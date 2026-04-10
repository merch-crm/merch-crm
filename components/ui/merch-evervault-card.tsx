"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { randomString } from "@/lib/random-utils";
import { Typo } from "@/components/ui/typo";

interface MerchEvervaultCardProps {
  text?: string;
  className?: string;
}

/**
 * MerchEvervaultCard - Interactive card with scrambled text reveal on hover.
 * Uses native CSS masking and standard React state for mouse tracking.
 * 
 * Uses native CSS masking and standard React state for mouse tracking.
 */
export const MerchEvervaultCard = ({
  text,
  className,
}: MerchEvervaultCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [randomChars, setRandomChars] = useState("");
  
  // Track mouse position with CSS variables for high performance (no React re-renders)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const { left, top } = containerRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Update CSS variables on the container to move the mask
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
    
    // Scramble text on mouse move (matches original behavior)
    setRandomChars(randomString(1500));
  };

  useEffect(() => {
    // Initial random string
    setRandomChars(randomString(1500));
  }, []);

  return (
    <div
      className={cn(
        "p-0.5 bg-transparent aspect-square flex items-center justify-center w-full h-full relative",
        className
      )}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="group/card rounded-card w-full relative overflow-hidden bg-transparent flex items-center justify-center h-full"
        style={{
          // Default values if mouse hasn't entered
          "--mouse-x": "0px",
          "--mouse-y": "0px",
        } as React.CSSProperties}
      >
        {/* The Animated Pattern Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Static mask base */}
          <div className="absolute inset-0 rounded-card [mask-image:linear-gradient(white,transparent)] group-hover/card:opacity-50 transition-opacity duration-500" />
          
          {/* Animated Gradient Layer (Blue -> Emerald) */}
          <div 
            className="absolute inset-0 rounded-card bg-gradient-to-br from-blue-500 to-emerald-500 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition-[opacity] duration-500"
            style={{
              maskImage: `radial-gradient(250px at var(--mouse-x) var(--mouse-y), white, transparent)`,
              WebkitMaskImage: `radial-gradient(250px at var(--mouse-x) var(--mouse-y), white, transparent)`,
            }}
          />
          
          {/* Scrambled Text Layer */}
          <div 
            className="absolute inset-0 rounded-card opacity-0 group-hover/card:opacity-100 mix-blend-overlay transition-[opacity] duration-500"
            style={{
              maskImage: `radial-gradient(250px at var(--mouse-x) var(--mouse-y), white, transparent)`,
              WebkitMaskImage: `radial-gradient(250px at var(--mouse-x) var(--mouse-y), white, transparent)`,
            }}
          >
            <Typo as="p" className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold">
              {randomChars}
            </Typo>
          </div>
        </div>

        {/* Content Centered Label */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="relative h-44 w-44 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            <div className="absolute w-full h-full bg-white/[0.8] dark:bg-black/[0.8] blur-sm rounded-full" />
            <Typo as="span" className="dark:text-white text-black z-20">{text}</Typo>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Icon = ({ className, ...rest }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};
