"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoMagneticButtonProps extends HTMLMotionProps<"button"> {
  distance?: number;
}

export function BentoMagneticButton({ 
  children, 
  distance = 0.3,
  className, 
  style,
  ...props 
}: BentoMagneticButtonProps & { children?: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [isMounted, setIsMounted] = useState(false);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = event;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    x.set((clientX - centerX) * distance);
    y.set((clientY - centerY) * distance);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (!isMounted) {
    return (
      <div className={cn("h-14 px-8 rounded-card bg-gray-100 animate-pulse w-40", className)} />
    );
  }

  return (
    <motion.button
      type="button"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, x: springX, y: springY }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "h-14 px-8 rounded-card font-bold text-sm ",
        "bg-primary text-primary-foreground shadow-crm-md",
        "relative transition-colors hover:bg-primary/90",
        className
      )}
      {...props}
    >
      <span className="relative z-10 pointer-events-none">{children as React.ReactNode}</span>
    </motion.button>
  );
}
