"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "../utils/cn";

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface DockProps {
  items: DockItem[];
  className?: string;
  magnification?: number;
  distance?: number;
  baseSize?: number;
  panelHeight?: number;
}

export const Dock = ({
  items = [],
  className = "",
  magnification = 70,
  distance = 140,
  baseSize = 40,
  panelHeight = 68,
}: DockProps) => {
  const mouseX = useMotionValue(Infinity);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className={cn("mx-auto flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 h-[68px] animate-pulse", className)} />;
  }

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 backdrop-blur-xl",
        className
      )}
      style={{ height: panelHeight }}
    >
      {(items || []).map((item, i) => (
        <DockIcon
          key={i}
          mouseX={mouseX}
          magnification={magnification}
          distance={distance}
          baseSize={baseSize}
          {...item}
        />
      ))}
    </motion.div>
  );
};

function DockIcon({
  icon,
  label,
  onClick,
  mouseX,
  magnification,
  distance,
  baseSize,
}: DockItem & {
  mouseX: import("motion/react").MotionValue<number>;
  magnification: number;
  distance: number;
  baseSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distanceCalc = useTransform(mouseX, (val: number) => {
    if (!ref.current) return Infinity;
    const bounds = ref.current.getBoundingClientRect();
    return val - bounds.x - bounds.width / 2;
  });

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [baseSize, magnification, baseSize]
  );

  const size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="relative mb-2 flex cursor-pointer items-center justify-center rounded-xl bg-white/10"
    >
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: -5 }}
          className="absolute -top-8 whitespace-nowrap rounded-md bg-black/80 px-2 py-0.5 text-xs text-white z-50 shadow-xl border border-white/10"
        >
          {label}
        </motion.div>
      )}
      <div className="flex h-1/2 w-1/2 items-center justify-center">{icon}</div>
    </motion.div>
  );
}
