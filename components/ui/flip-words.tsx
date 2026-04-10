"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

/**
 * FlipWords — cycles through words with a smooth flip animation.
 * Independent implementation using CSS @keyframes.
 */
export function FlipWords({
  words,
  duration = 3000,
  className,
}: FlipWordsProps) {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flip = useCallback(() => {
    setIsFlipping(true);
    // Wait for exit animation, then swap word
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length);
      setIsFlipping(false);
    }, 400);
  }, [words.length]);

  useEffect(() => {
    timeoutRef.current = setTimeout(flip, duration);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, duration, flip]);

  const currentWord = words[index];

  return (
    <span
      className={cn("inline-block relative text-slate-900", className)}
      aria-live="polite"
    >
      <span
        className={cn(
          "inline-flex transition-all duration-400 ease-out",
          isFlipping
            ? "opacity-0 translate-y-[-10px] scale-105 blur-sm"
            : "opacity-100 translate-y-0 scale-100 blur-0"
        )}
      >
        {currentWord.split("").map((letter, i) => (
          <span
            key={`${index}-${i}`}
            className="inline-block animate-[flipLetterIn_0.35s_ease-out_both]"
            style={{
              animationDelay: isFlipping ? "0ms" : `${i * 50}ms`,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </span>
    </span>
  );
}
