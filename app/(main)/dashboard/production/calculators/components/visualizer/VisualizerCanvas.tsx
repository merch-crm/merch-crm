import React, { useMemo } from 'react';
import { Grid3X3 } from 'lucide-react';
import { LayoutResult, DesignItem, LayoutSettings } from '@/lib/types/calculators';

const DESIGN_COLORS = [
 { fill: '#eff6ff', border: '#3b82f6', text: '#1e40af' }, // Blue
 { fill: '#f0fdf4', border: '#22c55e', text: '#166534' }, // Green
 { fill: '#fff7ed', border: '#f97316', text: '#9a3412' }, // Orange
 { fill: '#faf5ff', border: '#a855f7', text: '#6b21a8' }, // Purple
 { fill: '#fff1f2', border: '#f43f5e', text: '#9f1239' }, // Rose
 { fill: '#f5f3ff', border: '#6366f1', text: '#3730a3' }, // Indigo
 { fill: '#fdf2f8', border: '#ec4899', text: '#9d174d' }, // Pink
 { fill: '#ecfeff', border: '#06b6d4', text: '#155e75' }, // Cyan
];

interface VisualizerCanvasProps {
 containerRef: React.RefObject<HTMLDivElement | null>;
 layoutResult: LayoutResult;
 designs: DesignItem[];
 settings: LayoutSettings;
 scale: number;
 showGrid: boolean;
 hoveredDesignId: string | null;
 setHoveredDesignId: (id: string | null) => void;
}

export function VisualizerCanvas({
 containerRef,
 layoutResult,
 designs,
 settings,
 scale,
 showGrid,
 hoveredDesignId,
 setHoveredDesignId,
}: VisualizerCanvasProps) {
 const getDesignColor = (colorIndex: number) => DESIGN_COLORS[colorIndex % DESIGN_COLORS.length];

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

 const gridLines = useMemo(() => {
  if (!showGrid) return { vertical: [], horizontal: [] };
  const step = 50;
  const height = Math.max(layoutResult.stats.totalLengthMm, 5);
  const width = settings.rollWidthMm || 100;
  const vertical = Array.from({ length: Math.floor(width / step) + 1 }, (_, i) => i * step);
  const horizontal = Array.from({ length: Math.floor(height / step) + 1 }, (_, i) => i * step);
  return { vertical, horizontal };
 }, [showGrid, settings.rollWidthMm, layoutResult.stats.totalLengthMm]);

 return (
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
            {showName && (
             <tspan x="0" dy="-0.5em" fontSize="0.75em" fontWeight="700" fillOpacity={0.8}>
              {String(displayName.length > nameLimit ? displayName.slice(0, nameLimit - 2) + '..' : displayName)}
             </tspan>
            )}
            
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
 );
}
