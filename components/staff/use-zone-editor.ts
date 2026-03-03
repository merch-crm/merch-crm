'use client'

import { useState } from 'react'
import type { Zone, Point } from './zone-editor'

// Drawing state (tool + zone being drawn)
export function useDrawingState(initialZone?: Zone) {
    const [tool, setTool] = useState<'select' | 'rect' | 'polygon' | 'circle' | 'pan'>('rect')
    const [currentZone, setCurrentZone] = useState<Zone | null>(initialZone || null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [polygonPoints, setPolygonPoints] = useState<Point[]>([])
    const [startPoint, setStartPoint] = useState<Point | null>(null)

    const resetZone = () => {
        setCurrentZone(null)
        setPolygonPoints([])
    }

    return {
        tool, setTool,
        currentZone, setCurrentZone,
        isDrawing, setIsDrawing,
        polygonPoints, setPolygonPoints,
        startPoint, setStartPoint,
        resetZone,
    }
}

// Viewport state (zoom + pan)
export function useViewportState() {
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null)

    const resetViewport = () => {
        setZoom(1)
        setPan({ x: 0, y: 0 })
    }

    return {
        zoom, setZoom,
        pan, setPan,
        isPanning, setIsPanning,
        lastPanPoint, setLastPanPoint,
        resetViewport,
    }
}

// Canvas/image loading state
export function useCanvasState() {
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 })
    const [imageLoaded, setImageLoaded] = useState(false)

    return { canvasSize, setCanvasSize, imageLoaded, setImageLoaded }
}
