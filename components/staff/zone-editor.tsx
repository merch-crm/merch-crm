'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
    Square,
    Pentagon,
    Circle,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Move,
    MousePointer,
    Check,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ResponsiveModal } from '@/components/ui/responsive-modal'

type Tool = 'select' | 'rect' | 'polygon' | 'circle' | 'pan'

interface Point {
    x: number
    y: number
}

export type Zone =
    | { type: 'rect', x: number, y: number, width: number, height: number }
    | { type: 'polygon', points: Point[] }
    | { type: 'circle', cx: number, cy: number, radius: number }

interface ZoneEditorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageUrl?: string
    videoUrl?: string | null
    initialZone?: Zone
    color?: string
    onSave: (zone: Zone) => void
    onCancel: () => void
}

export function ZoneEditor({
    open: isOpen,
    onOpenChange: onClose,
    imageUrl,
    initialZone,
    color = '#3B82F6',
    onSave,
    onCancel
}: ZoneEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const [tool, setTool] = useState<Tool>('rect')
    const [currentZone, setCurrentZone] = useState<Zone | null>(initialZone || null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [polygonPoints, setPolygonPoints] = useState<Point[]>([])
    const [startPoint, setStartPoint] = useState<Point | null>(null)

    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null)

    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 })
    const [imageLoaded, setImageLoaded] = useState(false)

    const screenToNormalized = useCallback((screenX: number, screenY: number): Point => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        // normalized coordinate within visual canvas (accounting for zoom/pan)
        const x = ((screenX - rect.left) / rect.width - pan.x) / zoom
        const y = ((screenY - rect.top) / rect.height - pan.y) / zoom

        return {
            x: Math.max(0, Math.min(1, x)),
            y: Math.max(0, Math.min(1, y))
        }
    }, [zoom, pan])

    const normalizedToScreen = useCallback((nx: number, ny: number): Point => {
        return {
            x: (nx * zoom + pan.x) * canvasSize.width,
            y: (ny * zoom + pan.y) * canvasSize.height
        }
    }, [zoom, pan, canvasSize])

    const drawZone = useCallback((
        ctx: CanvasRenderingContext2D,
        zone: Zone,
        zoneColor: string,
        opacity: number
    ) => {
        ctx.save()

        if (zone.type === 'rect') {
            const topLeft = normalizedToScreen(zone.x, zone.y)
            const bottomRight = normalizedToScreen(zone.x + zone.width, zone.y + zone.height)
            const width = bottomRight.x - topLeft.x
            const height = bottomRight.y - topLeft.y

            ctx.fillStyle = zoneColor
            ctx.globalAlpha = opacity
            ctx.fillRect(topLeft.x, topLeft.y, width, height)

            ctx.globalAlpha = 1
            ctx.strokeStyle = zoneColor
            ctx.lineWidth = 3
            ctx.strokeRect(topLeft.x, topLeft.y, width, height)

            // Points at corners
            ctx.fillStyle = '#fff'
            ctx.fillRect(topLeft.x - 4, topLeft.y - 4, 8, 8)
            ctx.fillRect(bottomRight.x - 4, bottomRight.y - 4, 8, 8)
        }

        if (zone.type === 'polygon' && zone.points.length > 0) {
            ctx.beginPath()
            const firstPoint = normalizedToScreen(zone.points[0].x, zone.points[0].y)
            ctx.moveTo(firstPoint.x, firstPoint.y)

            zone.points.forEach((point, i) => {
                if (i > 0) {
                    const screenPoint = normalizedToScreen(point.x, point.y)
                    ctx.lineTo(screenPoint.x, screenPoint.y)
                }
            })
            ctx.closePath()

            ctx.fillStyle = zoneColor
            ctx.globalAlpha = opacity
            ctx.fill()

            ctx.globalAlpha = 1
            ctx.strokeStyle = zoneColor
            ctx.lineWidth = 3
            ctx.stroke()
        }

        if (zone.type === 'circle') {
            const center = normalizedToScreen(zone.cx, zone.cy)
            // Radius interpretation on screen can be tricky due to AR, use X-axis distance
            const edge = normalizedToScreen(zone.cx + zone.radius, zone.cy)
            const radiusPixels = Math.abs(edge.x - center.x)

            ctx.beginPath()
            ctx.arc(center.x, center.y, radiusPixels, 0, Math.PI * 2)

            ctx.fillStyle = zoneColor
            ctx.globalAlpha = opacity
            ctx.fill()

            ctx.globalAlpha = 1
            ctx.strokeStyle = zoneColor
            ctx.lineWidth = 3
            ctx.stroke()
        }

        ctx.restore()
    }, [normalizedToScreen])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Draw Background
        ctx.save()
        if (imageRef.current && imageLoaded) {
            // Manual implementation of zoom/pan for background
            const sWidth = canvas.width / zoom
            const sHeight = canvas.height / zoom
            const sx = -pan.x * canvas.width / zoom
            const sy = -pan.y * canvas.height / zoom

            ctx.drawImage(imageRef.current, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height)
        } else {
            ctx.fillStyle = '#1e293b'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        ctx.restore()

        if (currentZone) {
            drawZone(ctx, currentZone, color, 0.3)
        }

        // Drawing helpers
        if (tool === 'polygon' && polygonPoints.length > 0) {
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])

            ctx.beginPath()
            const firstPoint = normalizedToScreen(polygonPoints[0].x, polygonPoints[0].y)
            ctx.moveTo(firstPoint.x, firstPoint.y)

            polygonPoints.forEach((point, i) => {
                if (i > 0) {
                    const screenPoint = normalizedToScreen(point.x, point.y)
                    ctx.lineTo(screenPoint.x, screenPoint.y)
                }
            })
            ctx.stroke()
            ctx.setLineDash([])

            polygonPoints.forEach((point, i) => {
                const screenPoint = normalizedToScreen(point.x, point.y)
                ctx.beginPath()
                ctx.arc(screenPoint.x, screenPoint.y, 6, 0, Math.PI * 2)
                ctx.fillStyle = i === 0 ? '#22c55e' : color
                ctx.fill()
                ctx.strokeStyle = '#fff'
                ctx.lineWidth = 2
                ctx.stroke()
            })
        }
    }, [zoom, pan, currentZone, polygonPoints, tool, color, imageLoaded, drawZone, normalizedToScreen])

    useEffect(() => {
        if (isOpen) {
            const animate = () => {
                draw()
                requestAnimationFrame(animate)
            }
            const handle = requestAnimationFrame(animate)
            return () => cancelAnimationFrame(handle)
        }
    }, [isOpen, draw])

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect()
        const point = screenToNormalized(e.clientX, e.clientY)

        if (tool === 'pan') {
            setIsPanning(true)
            setLastPanPoint({ x: e.clientX, y: e.clientY })
            return
        }

        if (tool === 'rect' || tool === 'circle') {
            setIsDrawing(true)
            setStartPoint(point)
            setCurrentZone(null)
        }

        if (tool === 'polygon') {
            if (polygonPoints.length >= 3) {
                const firstScreenPoint = normalizedToScreen(polygonPoints[0].x, polygonPoints[0].y)
                const clickX = e.clientX - rect.left
                const clickY = e.clientY - rect.top

                const dist = Math.sqrt(Math.pow(firstScreenPoint.x - clickX, 2) + Math.pow(firstScreenPoint.y - clickY, 2))
                if (dist < 15) {
                    setCurrentZone({ type: 'polygon', points: [...polygonPoints] })
                    setPolygonPoints([])
                    return
                }
            }
            setPolygonPoints(prev => [...prev, point])
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isPanning && lastPanPoint) {
            const dx = (e.clientX - lastPanPoint.x) / canvasSize.width
            const dy = (e.clientY - lastPanPoint.y) / canvasSize.height
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
            setLastPanPoint({ x: e.clientX, y: e.clientY })
            return
        }

        if (!isDrawing || !startPoint) return

        const point = screenToNormalized(e.clientX, e.clientY)

        if (tool === 'rect') {
            setCurrentZone({
                type: 'rect',
                x: Math.min(startPoint.x, point.x),
                y: Math.min(startPoint.y, point.y),
                width: Math.abs(point.x - startPoint.x),
                height: Math.abs(point.y - startPoint.y)
            })
        }

        if (tool === 'circle') {
            const dx = point.x - startPoint.x
            const dy = point.y - startPoint.y
            const radius = Math.sqrt(dx * dx + dy * dy)
            setCurrentZone({
                type: 'circle',
                cx: startPoint.x,
                cy: startPoint.y,
                radius
            })
        }
    }

    const handleMouseUp = () => {
        setIsDrawing(false)
        setStartPoint(null)
        setIsPanning(false)
        setLastPanPoint(null)
    }

    useEffect(() => {
        if (imageUrl) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                imageRef.current = img
                setImageLoaded(true)
                const ar = img.width / img.height
                setCanvasSize(prev => ({ ...prev, height: prev.width / ar }))
            }
            img.src = imageUrl
        }
    }, [imageUrl])

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={() => onClose(false)}
            title="Настройка зоны детекции"
            description="Выделите область рабочего места на кадре (прямоугольник, круг или многоугольник)"
        >
            <div className="space-y-3 py-2">
                <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-2xl">
                    <div className="flex items-center gap-1">
                        <ToolButton icon={MousePointer} active={tool === 'select'} onClick={() => setTool('select')} label="Курсор" />
                        <ToolButton icon={Square} active={tool === 'rect'} onClick={() => setTool('rect')} label="Квадрат" />
                        <ToolButton icon={Pentagon} active={tool === 'polygon'} onClick={() => setTool('polygon')} label="Контур" />
                        <ToolButton icon={Circle} active={tool === 'circle'} onClick={() => setTool('circle')} label="Круг" />
                        <div className="w-px h-6 bg-slate-300 mx-1" />
                        <ToolButton icon={Move} active={tool === 'pan'} onClick={() => setTool('pan')} label="Панорама" />
                    </div>

                    <div className="flex items-center gap-2 pr-2">
                        <button type="button" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1 hover:bg-white rounded-lg transition-all"><ZoomOut className="w-4 h-4 text-slate-500" /></button>
                        <span className="text-[11px] leading-tight text-neutral-500 font-bold text-slate-600 w-8 text-center">{Math.round(zoom * 100)}%</span>
                        <button type="button" onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-1 hover:bg-white rounded-lg transition-all"><ZoomIn className="w-4 h-4 text-slate-500" /></button>
                    </div>
                </div>

                <div className="relative bg-slate-900 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-2xl" style={{ height: canvasSize.height }}>
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        className={cn("w-full h-full",
                            tool === 'pan' && "cursor-grab",
                            isPanning && "cursor-grabbing",
                            (tool === 'rect' || tool === 'polygon' || tool === 'circle') && "cursor-crosshair"
                        )}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />

                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => { setCurrentZone(null); setPolygonPoints([]); setPan({ x: 0, y: 0 }); setZoom(1); }}
                            className="bg-white/90 backdrop-blur p-2.5 rounded-xl shadow-lg hover:bg-white transition-all text-slate-900 border border-slate-200"
                            title="Сбросить"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                    </div>

                    {!imageLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-sm font-medium">Загрузка кадра...</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" className="flex-1 h-12 rounded-xl text-slate-500 font-bold" onClick={onCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Отмена
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200"
                        onClick={() => currentZone && onSave(currentZone)}
                        disabled={!currentZone}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Применить зону
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    )
}

function ToolButton({ icon: Icon, active, onClick, label }: { icon: React.ElementType, active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn("flex flex-col items-center justify-center p-2 rounded-xl transition-all w-12",
                active ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            )}
        >
            <Icon className="w-4 h-4" />
            <span className="text-[8px] font-bold mt-1  tracking-tighter">{label}</span>
        </button>
    )
}
