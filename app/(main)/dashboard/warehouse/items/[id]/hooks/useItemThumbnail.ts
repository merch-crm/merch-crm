import { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface ThumbnailSettings {
    zoom: number;
    x: number;
    y: number;
}

export function useItemThumbnail(
    initialSettings: ThumbnailSettings,
    isEditing: boolean,
    onUpdate: (settings: Partial<ThumbnailSettings>) => void
) {
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    // Calculate base scale to achieve 'cover' fit
    const baseScale = useMemo(() => {
        if (!aspectRatio) return 1;
        return Math.max(aspectRatio, 1 / aspectRatio);
    }, [aspectRatio]);

    // Calculate dynamic boundaries based on effective scale
    const maxBounds = useMemo(() => {
        if (!aspectRatio) return { x: 0, y: 0 };

        // Effective scale applied to the container
        const s = (initialSettings.zoom || 1) * baseScale;

        const ar = aspectRatio;
        const normalizedW = ar >= 1 ? 1 : ar;
        const normalizedH = ar <= 1 ? 1 : 1 / ar;

        const limitX = Math.max(0, 50 * (normalizedW - 1 / s));
        const limitY = Math.max(0, 50 * (normalizedH - 1 / s));

        return { x: limitX, y: limitY };
    }, [aspectRatio, initialSettings.zoom, baseScale]);

    // Auto-clamp X/Y when bounds change
    useEffect(() => {
        if (!aspectRatio) return;
        const { x, y } = initialSettings;
        let newX = x;
        let newY = y;

        const limitX = Math.max(0, maxBounds.x);
        const limitY = Math.max(0, maxBounds.y);

        if (newX > limitX) newX = limitX;
        else if (newX < -limitX) newX = -limitX;

        if (newY > limitY) newY = limitY;
        else if (newY < -limitY) newY = -limitY;

        if (newX !== x || newY !== y) {
            onUpdate({
                zoom: initialSettings.zoom,
                x: newX,
                y: newY
            });
        }
    }, [maxBounds, initialSettings, onUpdate, aspectRatio]);

    // Main Image Draggable Logic (Zoom/Pan)
    const isMainDragging = useRef(false);
    const mainDragStart = useRef({ x: 0, y: 0 });
    const mainDragInitialRaw = useRef({ x: 0, y: 0 });

    const handleMainMouseDown = useCallback((e: React.MouseEvent) => {
        if (!isEditing) return;
        isMainDragging.current = true;
        mainDragStart.current = { x: e.clientX, y: e.clientY };
        mainDragInitialRaw.current = { x: initialSettings.x, y: initialSettings.y };
        document.body.style.cursor = 'grabbing';
    }, [isEditing, initialSettings.x, initialSettings.y]);

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isMainDragging.current) {
                isMainDragging.current = false;
                document.body.style.cursor = '';
            }
        };

        const handleMouseMoveGlobal = (e: MouseEvent) => {
            if (isMainDragging.current) {
                const dx = e.clientX - mainDragStart.current.x;
                const dy = e.clientY - mainDragStart.current.y;
                // Container size is 320x320 roughly.
                // dx / 320 * 100 for percentage
                const moveX = (dx / 320) * 100;
                const moveY = (dy / 320) * 100;
                onUpdate({
                    x: mainDragInitialRaw.current.x + moveX,
                    y: mainDragInitialRaw.current.y + moveY
                });
            }
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        window.addEventListener('mousemove', handleMouseMoveGlobal);

        return () => {
            window.removeEventListener('mouseup', handleMouseUpGlobal);
            window.removeEventListener('mousemove', handleMouseMoveGlobal);
        };
    }, [isEditing, onUpdate]);

    const resetSettings = useCallback(() => {
        onUpdate({ zoom: 1, x: 0, y: 0 });
    }, [onUpdate]);

    return {
        aspectRatio,
        setAspectRatio,
        baseScale,
        maxBounds,
        handleMainMouseDown,
        resetSettings
    };
}
