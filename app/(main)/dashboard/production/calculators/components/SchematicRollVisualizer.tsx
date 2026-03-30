/**
 * @fileoverview Схематичный визуализатор раскладки на плёнке (обновлённый)
 * @module calculators/components/SchematicRollVisualizer
 * @requires @/lib/types/calculators
 * @audit Обновлён 2026-03-27
 */

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Grid3X3,
  AlertCircle,
} from 'lucide-react';
import {
  DesignItem,
  LayoutResult,
  LayoutSettings,
  DESIGN_COLORS,
} from '@/lib/types/calculators';
import {
  optimizeLayout,
} from '@/lib/utils/layout-optimizer';
import { generateLayoutSVG } from '@/lib/utils/export-layout-svg';

// Sub-components
import { VisualizerHeader } from './visualizer/visualizer-header';
import { VisualizerControls } from './visualizer/visualizer-controls';
import { VisualizerStats } from './visualizer/visualizer-stats';

/**
 * Пропсы визуализатора
 */
interface SchematicRollVisualizerProps {
  designs: DesignItem[];
  initialSettings?: Partial<LayoutSettings>;
  onSettingsChange?: (settings: LayoutSettings) => void;
  onLayoutChange?: (result: LayoutResult) => void;
  readonly?: boolean;
  hideControls?: boolean;
  minHeight?: number;
  showGrid?: boolean;
}

const DEFAULT_SCALE = 1;
const MIN_SCALE = 0.005;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;

/**
 * Хук для обработки touch pinch-to-zoom
 */
function usePinchZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onZoom: (delta: number) => void
) {
  const lastDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function getDistance(touches: TouchList): number {
      const [t1, t2] = [touches[0], touches[1]];
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function getCenter(touches: TouchList): { x: number; y: number } {
      const [t1, t2] = [touches[0], touches[1]];
      return {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastDistanceRef.current = getDistance(e.touches);
      }
    }

    function handleTouchMove(e: TouchEvent) {
      const container = containerRef.current;
      if (!container) return;
      
      if (e.touches.length === 2 && lastDistanceRef.current !== null) {
        e.preventDefault();
        const newDistance = getDistance(e.touches);
        const delta = (newDistance - lastDistanceRef.current) / 100;
        const _center = getCenter(e.touches);
        
        const _rect = container.getBoundingClientRect();
        onZoom(delta);
        lastDistanceRef.current = newDistance;
      }
    }

    function handleTouchEnd() {
      lastDistanceRef.current = null;
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [containerRef, onZoom]);
}

/**
 * Схематичный визуализатор раскладки
 */
export function SchematicRollVisualizer({
  designs,
  initialSettings,
  onSettingsChange,
  onLayoutChange,
  readonly = false,
  hideControls = false,
  showGrid: initialShowGrid = true,
}: SchematicRollVisualizerProps) {
  const [settings, setSettings] = useState<LayoutSettings>({
    rollWidthMm: 300,
    edgeMarginMm: 10,
    gapMm: 5,
    allowRotation: true,
    ...initialSettings,
  });

  // Синхронизируем внутреннее состояние при изменении внешних пропсов
  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({ ...prev, ...initialSettings }));
    }
  }, [initialSettings]);

  const [scale, setScale] = useState(DEFAULT_SCALE);
  const baseScaleRef = useRef(DEFAULT_SCALE);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(initialShowGrid);
  const [hoveredDesignId, setHoveredDesignId] = useState<string | null>(null);

  const handlePinchZoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  }, []);

  usePinchZoom(containerRef, handlePinchZoom);

  const layoutResult = useMemo(() => optimizeLayout(designs, settings), [designs, settings]);

  useEffect(() => {
    if (onLayoutChange) onLayoutChange(layoutResult);
  }, [layoutResult, onLayoutChange]);

  const updateSettings = useCallback(
    (updates: Partial<LayoutSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      if (onSettingsChange) onSettingsChange(newSettings);
    },
    [settings, onSettingsChange]
  );

  const handleZoomIn = () => setScale((s) => Math.min(s + SCALE_STEP, MAX_SCALE));
  const handleZoomOut = () => setScale((s) => Math.max(s - SCALE_STEP, MIN_SCALE));

  const handleFitToContainer = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const newScale = containerWidth / (settings.rollWidthMm + 120);
      const clamped = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
      baseScaleRef.current = clamped;
      setScale(clamped);
    }
  }, [settings.rollWidthMm]);

  const handleFitAll = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40;
      const containerHeight = Math.min(containerRef.current.clientHeight || 500, 450);
      
      const rollHeight = Math.max(layoutResult.stats.totalLengthMm, 100);
      
      // Считаем масштаб так, чтобы рулон уместился в экран с учетом пиксельных отступов
      const PADDING_X_PX = 120; // 60 * 2
      const PADDING_Y_PX = 100; // 80 + 20
      
      const scaleX = Math.max(0.001, (containerWidth - PADDING_X_PX) / settings.rollWidthMm);
      const scaleY = Math.max(0.001, (containerHeight - PADDING_Y_PX) / rollHeight);
      
      const newScale = Math.min(scaleX, scaleY);
      const clamped = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
      
      // Чтобы проценты считались относительно ширины
      baseScaleRef.current = scaleX;
      setScale(clamped);
    }
  }, [settings.rollWidthMm, layoutResult.stats.totalLengthMm]);

  useEffect(() => {
    if (designs.length > 0) {
      setTimeout(handleFitToContainer, 100);
    }
  }, [designs.length, settings.rollWidthMm, handleFitToContainer]);

  const handleExportPNG = useCallback(async () => {
    const svgContent = generateLayoutSVG(layoutResult, designs);
    
    // По умолчанию 1мм = 3.78px (96 DPI).
    // Для высокого качества (печать) нам нужно 300 DPI: 1мм = (300 / 25.4) ≈ 11.81px.
    const DPI = 300;
    const MM_TO_PX = DPI / 25.4;
    
    // Извлекаем оригинальные размеры из mm
    const svgWidthMm = parseFloat(svgContent.match(/width="([\d.]+)mm"/)![1]);
    const svgHeightMm = parseFloat(svgContent.match(/height="([\d.]+)mm"/)![1]);
    
    const highResWidth = Math.round(svgWidthMm * MM_TO_PX);
    const highResHeight = Math.round(svgHeightMm * MM_TO_PX);
    
    // Подменяем width/height в SVG на пиксели для растеризации в высоком разрешении
    const highResSvg = svgContent
      .replace(/width="[\d.]+mm"/, `width="${highResWidth}"`)
      .replace(/height="[\d.]+mm"/, `height="${highResHeight}"`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = highResWidth;
    canvas.height = highResHeight;

    const img = new Image();
    const svgBlob = new Blob([highResSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, highResWidth, highResHeight);
      
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `layout_${Math.round(svgWidthMm)}x${Math.round(svgHeightMm)}mm.png`;
      link.href = pngUrl;
      link.click();
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [layoutResult, designs]);

  const handleExportSVG = useCallback(() => {
    const svg = generateLayoutSVG(layoutResult, designs);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'layout.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [layoutResult, designs]);

  const getDesignColor = (colorIndex: number) => DESIGN_COLORS[colorIndex % DESIGN_COLORS.length];

  const gridLines = useMemo(() => {
    if (!showGrid) return { vertical: [], horizontal: [] };
    const step = 50;
    const height = Math.max(layoutResult.stats.totalLengthMm, 5);
    const width = layoutResult.settings.rollWidthMm || 100;
    const vertical = Array.from({ length: Math.floor(width / step) + 1 }, (_, i) => i * step);
    const horizontal = Array.from({ length: Math.floor(height / step) + 1 }, (_, i) => i * step);
    return { vertical, horizontal };
  }, [showGrid, layoutResult.settings.rollWidthMm, layoutResult.stats.totalLengthMm]);

  const rollHeight = Math.max(layoutResult.stats.totalLengthMm, 5);
  
  const invScale = 1 / scale;
  const ARROW_PAD = 60 * invScale;
  const TOP_PAD = 80 * invScale;
  const BOTTOM_PAD = 20 * Math.max(1, invScale * 0.5);
  
  const lineOffset = 32 * invScale;
  const textOffsetHorizontal = 42 * invScale;
  const textOffsetVertical = 42 * invScale;
  const fontSizeDisplay = 14 * invScale;
  const strokeW = 1.5 * invScale;
  
  const svgWidth = settings.rollWidthMm + ARROW_PAD * 2;
  const svgHeight = rollHeight + TOP_PAD + BOTTOM_PAD;
  const visualWidth = svgWidth * scale;
  const visualHeight = svgHeight * scale;

  return (
    <div className="crm-card border border-border/50 overflow-hidden transition-all hover:shadow-lg">
      <VisualizerHeader 
        hasDesigns={designs.length > 0}
        onExportPNG={handleExportPNG}
        onExportSVG={handleExportSVG}
      />
      
      <div className="space-y-3 pt-4">
      {/* Skipped Designs Warning */}
      {layoutResult.skippedDesigns && layoutResult.skippedDesigns.length > 0 && (
        <Alert variant="destructive" className="rounded-2xl border-destructive/20 bg-destructive/5 backdrop-blur-sm shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold text-xs tracking-wider">Ширина макета превышает размер полотна</AlertTitle>
          <AlertDescription className="font-medium">
            Следующие файлы не помещаются на текущую ширину ({settings.rollWidthMm} мм):
            <ul className="mt-1 list-disc list-inside text-xs opacity-90">
              {layoutResult.skippedDesigns.map(d => (
                <li key={d.id}>
                  {d.name} ({d.width}×{d.height} мм)
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {!hideControls && (
        <VisualizerControls 
          settings={settings}
          updateSettings={updateSettings}
          readonly={readonly}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          scale={scale}
          baseScale={baseScaleRef.current}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleFitAll={handleFitAll}
          MIN_SCALE={MIN_SCALE}
          MAX_SCALE={MAX_SCALE}
        />
      )}

      {/* Visualization Area */}
      <div
        ref={containerRef}
        className="relative border rounded-2xl bg-slate-50/50 shadow-inner max-h-[400px] overflow-auto scrollbar-thin transition-all"
        style={{ minHeight: '200px' }}
      >
        {designs.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Grid3X3 className="h-12 w-12 opacity-20" />
            <p className="text-sm font-bold opacity-60">Загрузите файлы для предпросмотра раскладки</p>
          </div>
        ) : (
          <div className="p-8 mx-auto w-fit origin-top">
            <svg
              width={visualWidth}
              height={visualHeight}
              style={{ width: visualWidth, height: visualHeight, display: 'block' }}
              viewBox={`${-ARROW_PAD} ${-TOP_PAD} ${svgWidth} ${svgHeight}`}
              className="drop-shadow-2xl transition-all duration-300"
            >
              <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
                </marker>
                <marker id="arrowhead-rev" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
                </marker>
                {layoutResult.placedDesigns.map((placed) => (
                  <clipPath key={`clip-${placed.designId}-${placed.instanceIndex}`} id={`clip-${placed.designId}-${placed.instanceIndex}`}>
                    <rect x={placed.x + 1} y={placed.y + 1} width={placed.width - 2} height={placed.height - 2} />
                  </clipPath>
                ))}
                <clipPath id="roll-clip">
                  <rect x={0} y={0} width={settings.rollWidthMm} height={rollHeight} rx={4} />
                </clipPath>
              </defs>

              {/* Film background */}
              <rect x={0} y={0} width={settings.rollWidthMm} height={rollHeight} fill="white" stroke="#cbd5e1" strokeWidth={1.5} rx={4} />

              {/* Grid - Clipped to roll bounds */}
              {showGrid && (
                <g clipPath="url(#roll-clip)" opacity={0.25}>
                  {gridLines.vertical.map((x) => (
                    <line key={`grid-v-${x}`} x1={x} y1={0} x2={x} y2={rollHeight} stroke={x % 100 === 0 ? '#94a3b8' : '#cbd5e1'} strokeWidth={x % 100 === 0 ? 1 : 0.5} strokeDasharray={x % 100 === 0 ? undefined : '3,3'} />
                  ))}
                  {gridLines.horizontal.map((y) => (
                    <line key={`grid-h-${y}`} x1={0} y1={y} x2={settings.rollWidthMm} y2={y} stroke={y % 100 === 0 ? '#94a3b8' : '#cbd5e1'} strokeWidth={y % 100 === 0 ? 1 : 0.5} strokeDasharray={y % 100 === 0 ? undefined : '3,3'} />
                  ))}
                </g>
              )}

              {/* Edge Margins Highlight */}
              {settings.edgeMarginMm > 0 && (
                <g opacity={0.3} clipPath="url(#roll-clip)">
                  <rect x={0} y={0} width={settings.edgeMarginMm} height={rollHeight} fill="#fef3c7" />
                  <rect x={settings.rollWidthMm - settings.edgeMarginMm} y={0} width={settings.edgeMarginMm} height={rollHeight} fill="#fef3c7" />
                  <rect x={0} y={0} width={settings.rollWidthMm} height={settings.edgeMarginMm} fill="#fef3c7" />
                  <rect x={0} y={rollHeight - settings.edgeMarginMm} width={settings.rollWidthMm} height={settings.edgeMarginMm} fill="#fef3c7" />
                </g>
              )}

              {/* Dimensions */}
              <g className="font-mono font-black" style={{ fontSize: `${fontSizeDisplay}px` }}>
                <line x1={0} y1={-lineOffset} x2={settings.rollWidthMm} y2={-lineOffset} stroke="#1e293b" strokeWidth={strokeW} markerStart="url(#arrowhead-rev)" markerEnd="url(#arrowhead)" />
                <text x={settings.rollWidthMm / 2} y={-textOffsetVertical} fill="#1e293b" textAnchor="middle" stroke="none">{String(settings.rollWidthMm)} мм</text>
                <line x1={-lineOffset} y1={0} x2={-lineOffset} y2={rollHeight} stroke="#1e293b" strokeWidth={strokeW} markerStart="url(#arrowhead-rev)" markerEnd="url(#arrowhead)" />
                <text x={-textOffsetHorizontal} y={rollHeight / 2} fill="#1e293b" textAnchor="middle" transform={`rotate(-90, -${textOffsetHorizontal}, ${rollHeight / 2})`} stroke="none">{String(rollHeight)} мм</text>
              </g>

              {/* Placed designs */}
              {layoutResult.placedDesigns.map((placed) => {
                const color = getDesignColor(placed.colorIndex);
                const design = designs.find((d) => d.id === placed.designId);
                const isHovered = hoveredDesignId === placed.designId;
                const displayName = design?.name || 'Дизайн';
                return (
                  <g key={`${placed.designId}-${placed.instanceIndex}`} onMouseEnter={() => setHoveredDesignId(placed.designId)} onMouseLeave={() => setHoveredDesignId(null)} className="cursor-pointer">
                    <rect x={placed.x} y={placed.y} width={placed.width} height={placed.height} fill={color.fill} stroke={isHovered ? '#2563eb' : color.border} strokeWidth={isHovered ? 1.5 * invScale : 0.75 * invScale} rx={4} className="transition-all duration-200" />
                    {Math.max(placed.width, placed.height) > 28 && Math.min(placed.width, placed.height) > 12 && (() => {
                      const longSide = Math.max(placed.width, placed.height);
                      const shortSide = Math.min(placed.width, placed.height);
                      const centerX = placed.x + placed.width / 2;
                      const centerY = placed.y + placed.height / 2;
                      
                      // Параметры шрифта и лимиты
                      const baseFontSize = Math.min(8.0, longSide / 10, shortSide / 2.5);
                      const showName = shortSide > 18;
                      const nameLimit = Math.max(6, Math.floor(longSide / 6.5));
                      
                      const dimsStr = placed.rotated ? `${placed.height}×${placed.width}` : `${placed.width}×${placed.height}`;
                      
                      return (
                        <text 
                          transform={`translate(${centerX}, ${centerY}) ${placed.rotated ? 'rotate(90)' : ''}`}
                          fontSize={baseFontSize} 
                          fill={color.text} 
                          textAnchor="middle" 
                          dominantBaseline="middle" 
                          className="pointer-events-none select-none transition-transform duration-300"
                        >
                          {/* Название (может быть скрыто или обрезано) */}
                          {showName && (
                            <tspan x="0" dy="-0.5em" fontSize="0.75em" fontWeight="700" fillOpacity={0.8}>
                              {String(displayName.length > nameLimit ? displayName.slice(0, nameLimit - 2) + '..' : displayName)}
                            </tspan>
                          )}
                          
                          {/* Размер (всегда виден, если прошел фильтр выше) */}
                          <tspan x="0" dy={showName ? "1.25em" : "0"} fontSize="0.95em" fillOpacity={1}>
                            <tspan fontWeight="700">{dimsStr}</tspan>
                            <tspan fontWeight="400" fontSize="0.8em"> мм</tspan>
                          </tspan>
                        </text>
                      );
                    })()}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <VisualizerStats layoutResult={layoutResult} />
      </div>
    </div>
  );
}

export default SchematicRollVisualizer;
