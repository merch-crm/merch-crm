"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, Variants } from "framer-motion";
import Image from "next/image";
import { cn } from "../utils/cn";

interface Lanyard2DProps {
  className?: string;
  badgeContent?: React.ReactNode;
}

export const Lanyard2D = ({ className, badgeContent }: Lanyard2DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Base drag values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for a heavier "badge" feel
  const springX = useSpring(x, { stiffness: 60, damping: 10, mass: 2 });
  const springY = useSpring(y, { stiffness: 100, damping: 15, mass: 1.5 });

  // Pendulum swing: further it's dragged horizontally, the more it tilts
  const rotateX = useTransform(springY, [-100, 100], [10, -10]);
  const rotateY = useTransform(springX, [-100, 100], [-15, 15]);
  const rotateZ = useTransform(springX, [-100, 100], [-25, 25]); // The swinging pendulum rotation

  // We draw a pseudo-cord from top-center to the badge's top anchor
  const cordPath = useTransform(
    [springX, springY],
    ([latestX, latestY]: number[]) => {
      return `M 0 -200 Q ${latestX / 2} ${(latestY - 200) / 2} ${latestX} ${latestY - 60}`;
    }
  );

  if (!isMounted) return <div className="w-full h-full min-h-[400px] bg-neutral-900 animate-pulse" />;

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden", className)}
      style={{ perspective: 1200 }}
    >
      {/* Background/ambient */}
      <div className="absolute inset-0 bg-neutral-900 pointer-events-none" />

      {/* The cord rendered as an SVG layer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ left: '50%', top: '50%' }}>
        <motion.path
          d={cordPath as unknown as string}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          // We apply the same coordinate space translation so it aligns
        />
        {/* Origin point at top */}
        <circle cx="0" cy="-200" r="4" fill="white" />
      </svg>

      {/* The draggable badge */}
      <motion.div
        drag
        dragConstraints={containerRef}
        dragElastic={0.4}
        whileDrag={{ cursor: "grabbing" }}
        style={{
          x,
          y,
          rotateX,
          rotateY,
          rotateZ,
          cursor: "grab",
        }}
        className="relative z-10 w-[200px] h-[300px] bg-white rounded-xl shadow-2xl flex flex-col pt-8 pb-4 px-4 items-center gap-3"
      >
        {/* Hole clip at top */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[60px] h-[10px] rounded-full bg-neutral-900/10 shadow-inner" />
        
        {/* Clip piece extending slightly up for the cord to "attach" */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[30px] h-[15px] bg-zinc-300 rounded-t-md shadow-md flex items-end justify-center pb-1">
            <div className="w-[10px] h-[4px] rounded-full bg-zinc-800"/>
        </div>

        {/* Content of the badge */}
        <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-indigo-50 mt-4 overflow-hidden relative">
          <Image src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="avatar" fill className="object-cover" />
        </div>
        
        <div className="text-center mt-2 flex flex-col gap-1 w-full">
          <h3 className="font-outfit font-bold text-xl text-neutral-800">John Doe</h3>
          <p className="font-outfit text-sm text-indigo-500 font-medium">VIP ACCESS</p>
        </div>

        <div className="mt-auto w-full group">
          <div className="w-full h-8 bg-neutral-900 rounded-md overflow-hidden relative border border-neutral-800 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            {badgeContent || <span className="font-mono text-xs text-white ">SCAN TO ENTER</span>}
          </div>
        </div>

        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/40 pointer-events-none rounded-xl" />
      </motion.div>
    </div>
  );
};
