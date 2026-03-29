/**
 * @fileoverview Схематичный визуализатор раскладки на плёнке (обновлённый)
 * @module calculators/components/SchematicRollVisualizer
 * @requires @/lib/types/calculators
 * @audit Обновлён 2026-03-27
 */

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Ruler,
  Layers,
  TrendingUp,
  Grid3X3,
  Download,
  Settings2,
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
      <div className="card-breakout px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50 -mt-[var(--current-padding)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
              <Layers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Раскладка на плёнке</h3>
            </div>
          </div>

          {designs.length > 0 && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPNG} className="h-9 gap-2 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm transition-all px-4">
                <Download className="h-4 w-4 text-slate-500" /> PNG
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportSVG} className="h-9 gap-2 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm transition-all px-4">
                <Download className="h-4 w-4 text-slate-500" /> SVG
              </Button>
            </div>
          )}
        </div>
      </div>
      
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
      
      {/* Controls & Export Panel */}
      {!hideControls && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
            {/* Width Selector */}
            <div className="flex items-center gap-3 shrink-0">
              <Label className="text-xs font-black tracking-wider text-slate-400">Ширина:</Label>
              <Select
                value={settings.rollWidthMm.toString()}
                onChange={(v) => updateSettings({ rollWidthMm: parseInt(v, 10) })}
                disabled={readonly}
                options={ROLL_WIDTH_OPTIONS.map((opt) => ({ id: opt.value.toString(), title: opt.label }))}
              />
            </div>
            
            {/* Margins Trigger */}
            <div className="flex items-center gap-2 shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    <span className="hidden xs:inline">Отступы</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-5 rounded-[24px] border border-slate-200 bg-white/95 backdrop-blur-xl shadow-crm-xl animate-in fade-in zoom-in-95 duration-200 space-y-3">
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black tracking-wider text-slate-400">Поля пленки</Label>
                        <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{settings.edgeMarginMm} мм</span>
                      </div>
                      <Slider
                        value={[settings.edgeMarginMm]}
                        onValueChange={([v]) => updateSettings({ edgeMarginMm: v })}
                        min={0}
                        max={50}
                        step={1}
                        className="py-2"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-black tracking-wider text-slate-400">Зазор принтов</Label>
                        <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{settings.gapMm} мм</span>
                      </div>
                      <Slider
                        value={[settings.gapMm]}
                        onValueChange={([v]) => updateSettings({ gapMm: v })}
                        min={0}
                        max={50}
                        step={1}
                        className="py-2"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="h-6 w-px bg-slate-200/60 hidden sm:block" />

            {/* Toggles Group */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <Label className="text-xs font-black tracking-wider text-slate-400 hidden lg:block">Авто-поворот:</Label>
                <Switch 
                  checked={settings.allowRotation} 
                  onCheckedChange={(v) => updateSettings({ allowRotation: v })} 
                  disabled={readonly} 
                  className="scale-90"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs font-black tracking-wider text-slate-400 hidden lg:block">Сетка:</Label>
                <Switch 
                  checked={showGrid} 
                  onCheckedChange={setShowGrid} 
                  className="scale-90"
                />
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200/60 hidden md:block" />

            {/* Zoom & Fit Group */}
            <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= MIN_SCALE} className="h-9 w-9 rounded-xl hover:bg-slate-100/50">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="text-xs w-12 text-center font-bold font-mono text-slate-500 bg-slate-100/50 py-1 rounded-lg">
                {Math.round((scale / baseScaleRef.current) * 100)}%
              </div>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= MAX_SCALE} className="h-9 w-9 rounded-xl hover:bg-slate-100/50">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleFitAll} title="Вместить всё" className="h-9 w-9 rounded-xl hover:bg-slate-100/50 text-indigo-600">
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
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

      {/* Stats Grid Dashboard */}
      {designs.length > 0 && (
        <div className="card-breakout card-breakout-bottom grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-slate-100 bg-slate-50/30">
          {/* Length */}
          <div className="flex items-center gap-3 p-5 border-r border-slate-100 transition-all hover:bg-white group/stat">
            <div className="bg-indigo-600/10 p-2.5 rounded-xl group-hover/stat:bg-indigo-600 group-hover/stat:text-white transition-all">
              <Ruler className="h-4 w-4 text-indigo-600 group-hover/stat:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-slate-400">Длина печати</span>
              <span className="text-sm font-bold text-slate-900">{(layoutResult.stats.totalLengthMm / 10).toFixed(1)} см</span>
            </div>
          </div>
          
          {/* Efficiency */}
          <div className="flex items-center gap-3 p-5 border-r border-slate-100 transition-all hover:bg-white group/stat">
            <div className="bg-blue-600/10 p-2.5 rounded-xl group-hover/stat:bg-blue-600 transition-all">
              <TrendingUp className="h-4 w-4 text-blue-600 group-hover/stat:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-blue-400/80">Эффективность</span>
              <span className="text-sm font-bold text-blue-600">{layoutResult.stats.efficiency}%</span>
            </div>
          </div>

          {/* Total Area */}
          <div className="flex items-center gap-3 p-5 border-r border-slate-100 transition-all hover:bg-white group/stat">
            <div className="bg-emerald-600/10 p-2.5 rounded-xl group-hover/stat:bg-emerald-600 transition-all">
              <Maximize className="h-4 w-4 text-emerald-600 group-hover/stat:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-slate-400">Общая площадь</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{(layoutResult.stats.totalAreaMm2 / 1000000).toFixed(3)} м²</span>
            </div>
          </div>

          {/* Count */}
          <div className="flex items-center gap-3 p-5 transition-all hover:bg-white group/stat">
            <div className="bg-amber-600/10 p-2.5 rounded-xl group-hover/stat:bg-amber-600 transition-all">
              <Layers className="h-4 w-4 text-amber-600 group-hover/stat:text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-wider text-slate-400">Принтов</span>
              <span className="text-sm font-bold text-slate-900">{layoutResult.stats.printCount} шт</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default SchematicRollVisualizer;
