"use client";

import React, { useState } from 'react';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  label?: string;
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

export const FolderAnimation = ({ color = '#5227FF', size = 1, items = [], className = '', label }: FolderProps) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState<{ x: number; y: number }[]>(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.25);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handleClick = () => {
    setOpen((prev) => !prev);
    if (open) {
      setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
    }
  };

  const handlePaperMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: offsetX, y: offsetY };
      return newOffsets;
    });
  };

  const handlePaperMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => {
    setPaperOffsets((prev) => {
      const newOffsets = [...prev];
      newOffsets[index] = { x: 0, y: 0 };
      return newOffsets;
    });
  };

  const folderStyle: React.CSSProperties = {
    '--folder-color': color,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3,
  } as React.CSSProperties;

  const scaleStyle = { transform: `scale(${size})` };

  const getOpenTransform = (index: number) => {
    if (index === 0) return 'translate(-120%, -70%) rotate(-15deg)';
    if (index === 1) return 'translate(10%, -70%) rotate(15deg)';
    if (index === 2) return 'translate(-50%, -100%) rotate(5deg)';
    return '';
  };

  return (
    <div style={scaleStyle} className={className}>
      <button
        type="button"
        aria-label={label ? `Открыть папку ${label}` : "Открыть папку"}
        className={`group relative transition-all duration-200 ease-in border-none outline-none bg-transparent p-0 w-auto h-auto ${
          !open ? "hover:-translate-y-2" : ""
        }`}
        style={{
          ...folderStyle,
          transform: open ? "translateY(-8px)" : undefined,
        }}
        onClick={handleClick}
      >
        <div
          className="relative w-[100px] h-[80px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px]"
          style={{ 
            backgroundColor: folderBackColor,
            backgroundImage: 'linear-gradient(to bottom right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.25), 0 10px 25px -5px rgba(0,0,0,0.1)'
          }}
        >
          <span
            className="absolute z-0 bottom-[98%] left-0 w-[35px] h-[12px] rounded-tl-[6px] rounded-tr-[6px] rounded-bl-none rounded-br-none -mb-[1px]"
            style={{ 
              backgroundColor: folderBackColor,
              backgroundImage: 'linear-gradient(to top right, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.1) 100%)',
              boxShadow: 'inset 0 2px 2px rgba(255,255,255,0.05)'
            }}
          ></span>
          
          {/* Papers */}
          {papers.map((item, i) => {
            let sizeClasses = '';
            if (i === 0) sizeClasses = open ? 'w-[70%] h-[80%]' : 'w-[70%] h-[80%]';
            if (i === 1) sizeClasses = open ? 'w-[80%] h-[80%]' : 'w-[80%] h-[70%]';
            if (i === 2) sizeClasses = open ? 'w-[90%] h-[80%]' : 'w-[90%] h-[60%]';

            const transformStyle = open
              ? `${getOpenTransform(i)} translate(${paperOffsets[i].x}px, ${paperOffsets[i].y}px)`
              : undefined;

            return (
              <div
                key={i}
                onMouseMove={(e) => handlePaperMouseMove(e, i)}
                onMouseLeave={(e) => handlePaperMouseLeave(e, i)}
                className={`absolute z-20 bottom-[10%] left-1/2 transition-all duration-300 ease-in-out ${
                  !open ? 'transform -translate-x-1/2 translate-y-[10%] group-hover:translate-y-0' : 'hover:scale-110'
                } ${sizeClasses} shadow-sm overflow-hidden flex items-center justify-center`}
                style={{
                  ...(!open ? {} : { transform: transformStyle }),
                  backgroundColor: i === 0 ? paper1 : i === 1 ? paper2 : paper3,
                  borderRadius: '10px',
                }}
              >
                {item}
              </div>
            );
          })}
          
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out ${
              !open ? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]' : ''
            }`}
            style={{
              backgroundColor: color,
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.15) 100%)',
              borderRadius: '5px 10px 10px 10px',
              ...(open && { transform: 'skew(15deg) scaleY(0.6)' })
            }}
          ></div>
          
          {/* Front Folder Right Overlay Flap for Trapezoid effect */}
          <div
            className={`absolute z-30 w-full h-full origin-bottom transition-all duration-300 ease-in-out -ml-[0.5px] ${
              !open ? 'group-hover:[transform:skew(-15deg)_scaleY(0.6)]' : ''
            }`}
            style={{
              backgroundColor: color,
              backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 40%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.1) 100%)',
              borderRadius: '5px 12px 12px 12px',
              ...(open && { transform: 'skew(-15deg) scaleY(0.6)' })
            }}
          ></div>

          {/* Label Flap */}
          {label && (
             <div
               className={`absolute z-40 w-full h-full origin-bottom flex items-center justify-center transition-all duration-300 ease-in-out pointer-events-none -ml-[0.5px] ${
                 !open ? 'group-hover:[transform:skew(15deg)_scaleY(0.6)]' : ''
               }`}
               style={{ ...(open && { transform: 'skew(15deg) scaleY(0.6)' }) }}
             >
                <span className="text-white font-black text-[11px] tracking-[0.15em]  drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] mb-2 px-2 bg-black/10 rounded-sm backdrop-blur-[1px]">
                  {label}
                </span>
             </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default FolderAnimation;
