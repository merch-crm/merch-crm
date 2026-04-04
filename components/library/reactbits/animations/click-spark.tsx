"use client";
import { useRef, useEffect, useCallback } from "react";

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  children: React.ReactNode;
}

export const ClickSpark = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  children,
}: ClickSparkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const createSpark = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const sparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

      for (let i = 0; i < sparkCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkCount;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * sparkRadius,
          vy: Math.sin(angle) * sparkRadius,
          life: 1,
        });
      }

      const startTime = performance.now();

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        sparks.forEach((spark) => {
          const currentX = spark.x + spark.vx * progress;
          const currentY = spark.y + spark.vy * progress;
          const opacity = 1 - progress;
          const size = sparkSize * (1 - progress * 0.5);

          ctx.beginPath();
          ctx.arc(currentX, currentY, size / 2, 0, Math.PI * 2);
          ctx.fillStyle = sparkColor;
          ctx.globalAlpha = opacity;
          ctx.fill();
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      requestAnimationFrame(animate);
    },
    [sparkColor, sparkSize, sparkRadius, sparkCount, duration]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    resize();

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      createSpark(e.clientX - rect.left, e.clientY - rect.top);
    };

    container.addEventListener("click", handleClick);
    window.addEventListener("resize", resize);

    return () => {
      container.removeEventListener("click", handleClick);
      window.removeEventListener("resize", resize);
    };
  }, [createSpark]);

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-50"
      />
      {children}
    </div>
  );
};
