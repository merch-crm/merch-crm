'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

import { type DetectionZone } from '@/lib/schema/presence'

interface Zone {
    id: string
    name: string
    zone: DetectionZone | null
    color: string
    isOccupied?: boolean
    occupiedBy?: string
    assignedUser?: { name: string }
}

interface CameraPreviewProps {
    streamUrl: string | null
    zones: Zone[]
    className?: string
    showLabels?: boolean
    onZoneClick?: (zoneId: string) => void
}

export function CameraPreview({
    streamUrl,
    zones,
    className,
    showLabels = true,
    onZoneClick
}: CameraPreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!video || !canvas || !streamUrl) {
            if (!streamUrl) setError('Stream URL is missing')
            return
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        video.src = streamUrl
        video.crossOrigin = 'anonymous'

        video.onloadeddata = () => {
            setIsLoading(false)
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
        }

        video.onerror = (e) => {
            console.error('Video error:', e)
            setError('Не удалось загрузить видео')
            setIsLoading(false)
        }

        const draw = () => {
            if (video.paused || video.ended) return

            // Draw Video
            ctx.drawImage(video, 0, 0)

            // Draw Zones
            zones.forEach(({ zone, color, name, isOccupied, occupiedBy, assignedUser }) => {
                if (!zone) return

                ctx.save()
                const fillOpacity = isOccupied ? 0.4 : 0.15
                const strokeWidth = isOccupied ? 4 : 2

                ctx.strokeStyle = color
                ctx.fillStyle = color

                if (zone.type === 'rect') {
                    const x = zone.x * canvas.width
                    const y = zone.y * canvas.height
                    const w = zone.width * canvas.width
                    const h = zone.height * canvas.height

                    ctx.globalAlpha = fillOpacity
                    ctx.fillRect(x, y, w, h)
                    ctx.globalAlpha = 1
                    ctx.lineWidth = strokeWidth
                    ctx.strokeRect(x, y, w, h)

                    if (showLabels) {
                        drawLabel(ctx, name, occupiedBy || assignedUser?.name, x, y, color, isOccupied)
                    }
                }

                if (zone.type === 'polygon' && zone.points?.length > 0) {
                    ctx.beginPath()
                    ctx.moveTo(zone.points[0].x * canvas.width, zone.points[0].y * canvas.height)
                    zone.points.forEach((p) => ctx.lineTo(p.x * canvas.width, p.y * canvas.height))
                    ctx.closePath()

                    ctx.globalAlpha = fillOpacity
                    ctx.fill()
                    ctx.globalAlpha = 1
                    ctx.lineWidth = strokeWidth
                    ctx.stroke()

                    if (showLabels) {
                        const centerX = zone.points.reduce((s: number, p) => s + p.x, 0) / zone.points.length * canvas.width
                        const centerY = zone.points.reduce((s: number, p) => s + p.y, 0) / zone.points.length * canvas.height
                        drawLabel(ctx, name, occupiedBy || assignedUser?.name, centerX, centerY, color, isOccupied, true)
                    }
                }

                if (zone.type === 'circle') {
                    const cx = zone.cx * canvas.width
                    const cy = zone.cy * canvas.height
                    const r = zone.radius * canvas.width

                    ctx.beginPath()
                    ctx.arc(cx, cy, r, 0, Math.PI * 2)

                    ctx.globalAlpha = fillOpacity
                    ctx.fill()
                    ctx.globalAlpha = 1
                    ctx.lineWidth = strokeWidth
                    ctx.stroke()

                    if (showLabels) {
                        drawLabel(ctx, name, occupiedBy || assignedUser?.name, cx, cy, color, isOccupied, true)
                    }
                }

                ctx.restore()
            })

            requestAnimationFrame(draw)
        }

        video.onplay = () => draw()
        video.play().catch(err => {
            console.warn('Video play failed:', err)
            // Often blocked by browser until interaction
        })

        return () => {
            video.pause()
            video.src = ""
            video.load()
        }
    }, [streamUrl, zones, showLabels])

    function drawLabel(ctx: CanvasRenderingContext2D, name: string, sub: string | undefined, x: number, y: number, color: string, isOccupied?: boolean, center?: boolean) {
        const label = sub || name
        const fontSize = 14
        ctx.font = `bold ${fontSize}px sans-serif`
        const textWidth = ctx.measureText(label).width
        const padding = 12
        const rectW = textWidth + padding * 2
        const rectH = 32

        const drawX = center ? x - rectW / 2 : x
        const drawY = center ? y - rectH / 2 : y - rectH - 10

        // Draw Background
        ctx.globalAlpha = 0.9
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(drawX, drawY, rectW, rectH, 8)
        ctx.fill()

        // Draw Text
        ctx.globalAlpha = 1
        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.fillText(label, drawX + rectW / 2, drawY + rectH / 2 + 5)

        if (isOccupied) {
            ctx.beginPath()
            ctx.arc(drawX + rectW - 10, drawY + 10, 4, 0, Math.PI * 2)
            ctx.fillStyle = '#22c55e'
            ctx.fill()
        }
    }

    return (
        <div className={cn("relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl transition-all group", className)}>
            <video ref={videoRef} className="hidden" muted playsInline crossOrigin="anonymous" />

            <canvas
                ref={canvasRef}
                className="w-full h-auto cursor-pointer"
                onClick={() => {
                    if (!onZoneClick || !canvasRef.current) return
                    // const x = (e.clientX - rect.left) / rect.width
                    // const y = (e.clientY - rect.top) / rect.height
                    // Logic for clicking zone could be added here
                }}
            />

            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 backdrop-blur-sm gap-3 transition-all">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-bold text-white   opacity-50">Connecting Live</span>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-red-500 font-bold p-10 text-center">
                    {error}
                </div>
            )}

            <div className="absolute bottom-4 left-4 flex gap-2">
                <div className="bg-red-600 w-2 h-2 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                <span className="text-[11px] leading-tight text-neutral-500 font-bold text-white  tracking-tighter shadow-sm">Live Feed</span>
            </div>
        </div>
    )
}
