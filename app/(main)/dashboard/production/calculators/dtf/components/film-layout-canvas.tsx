"use client";

import { forwardRef, useRef, useEffect, useState, memo, useCallback, useImperativeHandle } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalculatedSection } from "../../types";
import {
  calculateScale,
  calculateCanvasHeight,
  drawFilmBackground,
  drawPrint,
  drawSectionDivider,
  drawMoreRowsText,
} from "../../lib/canvas-utils";

interface FilmLayoutCanvasProps {
  sections: CalculatedSection[];
  rollWidthMm: number;
  edgeMarginMm: number;
  printGapMm: number;
  totalLengthMm?: number; // Опционально, если не передано - вычислим сами
  maxPreviewRows?: number;
  className?: string;
}

export const FilmLayoutCanvas = memo(
  forwardRef<HTMLCanvasElement, FilmLayoutCanvasProps>(function FilmLayoutCanvas(
    {
      sections,
      rollWidthMm,
      edgeMarginMm,
      printGapMm,
      totalLengthMm: propsTotalLengthMm,
      maxPreviewRows = 3,
      className,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);

    // Прокидываем внутренний реф наружу
    useImperativeHandle(ref, () => internalCanvasRef.current!, []);

    const [containerWidth, setContainerWidth] = useState(0);
    const [zoom, setZoom] = useState(1);

    // Отслеживание размера контейнера
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      observer.observe(container);
      setContainerWidth(container.clientWidth);

      return () => observer.disconnect();
    }, []);

    // Отрисовка Canvas
    useEffect(() => {
      const canvas = internalCanvasRef.current;
      if (!canvas || containerWidth === 0 || sections.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Расчёт масштаба
      const baseScale = calculateScale(rollWidthMm, containerWidth);
      const scale = baseScale * zoom;

      // Размеры в пикселях
      const canvasWidth = containerWidth;
      const canvasHeight = calculateCanvasHeight(
        sections,
        printGapMm,
        scale,
        maxPreviewRows
      );

      // Установка размеров canvas (с учётом devicePixelRatio для чёткости)
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.scale(dpr, dpr);

      // Очистка
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Фон плёнки
      const edgeMarginPx = edgeMarginMm * scale;
      drawFilmBackground(ctx, canvasWidth, canvasHeight, edgeMarginPx);

      // Отрисовка секций
      let currentY = 10; // начальный отступ

      sections.forEach((section, sectionIndex) => {
        const printWidthPx = section.widthMm * scale;
        const printHeightPx = section.heightMm * scale;
        const gapPx = printGapMm * scale;

        // Количество рядов для отображения
        const displayRows = Math.min(section.rowsCount, maxPreviewRows);

        // Отрисовка принтов
        let printNumber = 1;

        for (let row = 0; row < displayRows; row++) {
          const rowY = currentY + row * (printHeightPx + gapPx);

          for (let col = 0; col < section.printsPerRow; col++) {
            // Проверяем, не превысили ли общее количество
            if (printNumber > section.quantity) break;

            const printX = edgeMarginPx + col * (printWidthPx + gapPx);

            drawPrint(
              ctx,
              printX,
              rowY,
              printWidthPx,
              printHeightPx,
              section.color,
              printNumber
            );

            printNumber++;
          }
        }

        // Высота отрисованных рядов
        const drawnHeight = displayRows * printHeightPx + (displayRows - 1) * gapPx;
        currentY += drawnHeight;

        // Если есть ещё ряды — показываем текст
        if (section.rowsCount > maxPreviewRows) {
          currentY += 5;
          drawMoreRowsText(
            ctx,
            canvasWidth / 2,
            currentY + 10,
            section.rowsCount - maxPreviewRows
          );
          currentY += 25;
        }

        // Разделитель между секциями
        if (sectionIndex < sections.length - 1) {
          currentY += gapPx / 2;
          drawSectionDivider(ctx, currentY, canvasWidth);
          currentY += gapPx / 2 + 10;
        }
      });
    }, [
      sections,
      rollWidthMm,
      edgeMarginMm,
      printGapMm,
      containerWidth,
      zoom,
      maxPreviewRows,
    ]);

    // Управление зумом
    const handleZoomIn = useCallback(() => {
      setZoom((prev) => Math.min(prev + 0.25, 2));
    }, []);

    const handleZoomOut = useCallback(() => {
      setZoom((prev) => Math.max(prev - 0.25, 0.5));
    }, []);

    const handleResetZoom = useCallback(() => {
      setZoom(1);
    }, []);

    // Расчёт общей длины для отображения
    const totalLengthMm =
      propsTotalLengthMm ??
      sections.reduce((sum, s, i) => {
        return sum + s.sectionLengthMm + (i < sections.length - 1 ? printGapMm : 0);
      }, 0);

    return (
      <div className={cn("space-y-3", className)}>
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom>= 2}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            {zoom !== 1 && (
              <Button variant="ghost" size="sm" onClick={handleResetZoom}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {rollWidthMm} мм × {(totalLengthMm / 1000).toFixed(2)} м
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white"
        >
          <canvas ref={internalCanvasRef} className="block" />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <div
              key={section.groupId}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div
                className="w-3 h-3 rounded-md shrink-0"
                style={{ backgroundColor: section.color }}
              />
              <span className="text-xs font-bold text-slate-700">
                {section.name}
              </span>
              <span className="text-xs text-slate-500">
                {section.quantity} шт • {section.printsPerRow}×{section.rowsCount}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  })
);
