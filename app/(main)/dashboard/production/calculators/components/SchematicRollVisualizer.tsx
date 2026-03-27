/**
 * @fileoverview Схематичный визуализатор раскладки на плёнке (обновлённый)
 * @module calculators/components/SchematicRollVisualizer
 * @requires @/lib/types/calculators
 * @audit Обновлён 2026-03-27
 */

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  Layers,
  TrendingUp,
  Grid3X3,
  Download,
  FileImage,
} from 'lucide-react';
import {
  DesignItem,
  LayoutResult,
  LayoutSettings,
  DESIGN_COLORS,
} from '@/lib/types/calculators';
import {
  optimizeLayout,
  ROLL_WIDTH_OPTIONS,
} from '@/lib/utils/layout-optimizer';
import { generateLayoutSVG } from '@/lib/utils/export-layout-svg';

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
const MIN_SCALE = 0.15;
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

  useEffect(() => {
    if (designs.length > 0) {
      setTimeout(handleFitToContainer, 100);
    }
  }, [designs.length, settings.rollWidthMm, handleFitToContainer]);

  const handleExportPNG = useCallback(async () => {
    const svg = generateLayoutSVG(layoutResult, designs);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'layout.png';
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
    const height = Math.max(layoutResult.stats.totalLengthMm, 100);
    const vertical = Array.from({ length: Math.floor(settings.rollWidthMm / step) + 1 }, (_, i) => i * step);
    const horizontal = Array.from({ length: Math.floor(height / step) + 1 }, (_, i) => i * step);
    return { vertical, horizontal };
  }, [showGrid, settings.rollWidthMm, layoutResult.stats.totalLengthMm]);

  const rollHeight = Math.max(layoutResult.stats.totalLengthMm, 100);
  const ARROW_PAD = 60;
  const svgWidth = settings.rollWidthMm + ARROW_PAD * 2;
  const svgHeight = rollHeight + ARROW_PAD + 10;
  const visualWidth = svgWidth * scale;
  const visualHeight = svgHeight * scale;

  return (
    <div className="crm-card border border-border/50 overflow-hidden transition-all hover:shadow-lg">
      {/* Header Standardized */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Раскладка на плёнке</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="gap-1 bg-white border-slate-200 text-slate-600 font-bold">
                  <Ruler className="h-3 w-3" />
                  {String((layoutResult.stats.totalLengthMm / 10).toFixed(1))} см
                </Badge>
                <Badge variant="secondary" className="gap-1 bg-white border-slate-200 text-slate-600 font-bold">
                  <TrendingUp className="h-3 w-3" />
                  {String(layoutResult.stats.efficiency)}%
                </Badge>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold">
                  {String(layoutResult.stats.printCount)} шт
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {/* Controls */}
        {!hideControls && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-muted-foreground/5">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-slate-500 tracking-normal">Ширина:</Label>
              <Select
                value={settings.rollWidthMm.toString()}
                onChange={(v) => updateSettings({ rollWidthMm: parseInt(v, 10) })}
                disabled={readonly}
                options={ROLL_WIDTH_OPTIONS.map((opt) => ({ id: opt.value.toString(), title: opt.label }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-slate-500 tracking-normal">Поворот:</Label>
              <Switch checked={settings.allowRotation} onCheckedChange={(v) => updateSettings({ allowRotation: v })} disabled={readonly} />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold text-slate-500 tracking-normal">Сетка:</Label>
              <Switch checked={showGrid} onCheckedChange={setShowGrid} />
            </div>

            <div className="h-6 w-px bg-border mx-1" />

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= MIN_SCALE} className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center font-bold font-mono">
                {String(Math.round((scale / baseScaleRef.current) * 100))}%
              </span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= MAX_SCALE} className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleFitToContainer} className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1" />

            {designs.length > 0 && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPNG} className="h-9 gap-2 rounded-xl font-bold bg-white">
                  <FileImage className="h-4 w-4" /> PNG
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportSVG} className="h-9 gap-2 rounded-xl font-bold bg-white">
                  <Download className="h-4 w-4" /> SVG
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        {designs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {designs.map((design, index) => {
              const color = getDesignColor(index);
              const isHovered = hoveredDesignId === design.id;
              return (
                <div
                  key={design.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm cursor-pointer transition-all border ${
                    isHovered ? 'ring-2 ring-primary border-transparent' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.bg }}
                  onMouseEnter={() => setHoveredDesignId(design.id)}
                  onMouseLeave={() => setHoveredDesignId(null)}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.fill }} />
                  <span className="truncate max-w-[150px] font-bold" title={design.name}>
                    {String(design.name)}
                  </span>
                  <Badge variant="secondary" className="bg-white/50 text-xs h-4 px-1 font-mono font-bold">
                    ×{String(design.quantity)}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {/* Visualization Area */}
        <div
          ref={containerRef}
          className="relative border rounded-2xl bg-slate-50/50 shadow-inner max-h-[500px] overflow-auto scrollbar-thin transition-all"
          style={{ minHeight: '200px' }}
        >
          {designs.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Grid3X3 className="h-12 w-12 opacity-20" />
              <p className="text-sm font-bold opacity-60">Загрузите файлы для предпросмотра раскладки</p>
            </div>
          ) : (
            <div className="flex justify-center p-8 min-h-full items-start">
              <svg
                width={visualWidth}
                height={visualHeight}
                viewBox={`${-ARROW_PAD} ${-ARROW_PAD + 10} ${svgWidth} ${svgHeight}`}
                className="drop-shadow-2xl transition-all duration-300"
              >
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
                  </marker>
                  <marker id="arrowhead-rev" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                    <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
                  </marker>
                  {layoutResult.placedDesigns.map((placed) => (
                    <clipPath key={`clip-${placed.designId}-${placed.instanceIndex}`} id={`clip-${placed.designId}-${placed.instanceIndex}`}>
                      <rect x={placed.x + 1} y={placed.y + 1} width={placed.width - 2} height={placed.height - 2} />
                    </clipPath>
                  ))}
                </defs>

                {/* Film background */}
                <rect x={0} y={0} width={settings.rollWidthMm} height={rollHeight} fill="white" stroke="#cbd5e1" strokeWidth={1.5} rx={4} />

                {/* Grid */}
                {showGrid && (
                  <g opacity={0.4}>
                    {gridLines.vertical.map((x) => (
                      <line key={`grid-v-${x}`} x1={x} y1={0} x2={x} y2={rollHeight} stroke={x % 100 === 0 ? '#94a3b8' : '#cbd5e1'} strokeWidth={x % 100 === 0 ? 1 : 0.5} strokeDasharray={x % 100 === 0 ? undefined : '3,3'} />
                    ))}
                    {gridLines.horizontal.map((y) => (
                      <line key={`grid-h-${y}`} x1={0} y1={y} x2={settings.rollWidthMm} y2={y} stroke={y % 100 === 0 ? '#94a3b8' : '#cbd5e1'} strokeWidth={y % 100 === 0 ? 1 : 0.5} strokeDasharray={y % 100 === 0 ? undefined : '3,3'} />
                    ))}
                  </g>
                )}

                {/* Dimensions */}
                <g className="font-mono text-[14px] font-black">
                  <line x1={0} y1={-32} x2={settings.rollWidthMm} y2={-32} stroke="#1e293b" strokeWidth={1.5} markerStart="url(#arrowhead-rev)" markerEnd="url(#arrowhead)" />
                  <text x={settings.rollWidthMm / 2} y={-42} fill="#1e293b" textAnchor="middle">{String(settings.rollWidthMm)} мм</text>
                  <line x1={-32} y1={0} x2={-32} y2={rollHeight} stroke="#1e293b" strokeWidth={1.5} markerStart="url(#arrowhead-rev)" markerEnd="url(#arrowhead)" />
                  <text x={-42} y={rollHeight / 2} fill="#1e293b" textAnchor="middle" transform={`rotate(-90, -42, ${rollHeight / 2})`}>{String(rollHeight)} мм</text>
                </g>

                {/* Placed designs */}
                {layoutResult.placedDesigns.map((placed) => {
                  const color = getDesignColor(placed.colorIndex);
                  const design = designs.find((d) => d.id === placed.designId);
                  const isHovered = hoveredDesignId === placed.designId;
                  const displayName = design?.name || 'Дизайн';
                  return (
                    <g key={`${placed.designId}-${placed.instanceIndex}`} onMouseEnter={() => setHoveredDesignId(placed.designId)} onMouseLeave={() => setHoveredDesignId(null)} className="cursor-pointer">
                      <rect x={placed.x} y={placed.y} width={placed.width} height={placed.height} fill={color.fill} stroke={isHovered ? '#2563eb' : color.border} strokeWidth={isHovered ? 2 : 1} rx={4} className="transition-all duration-200" />
                      {placed.width > 40 && placed.height > 20 && (
                        <text x={placed.x + placed.width / 2} y={placed.y + placed.height / 2} fontSize={Math.min(10, placed.width / 8)} fontWeight="black" fill={color.text} textAnchor="middle" dominantBaseline="middle" clipPath={`url(#clip-${placed.designId}-${placed.instanceIndex})`} className="pointer-events-none select-none">
                          {String(displayName.length > 15 ? displayName.slice(0, 12) + '...' : displayName)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchematicRollVisualizer;
