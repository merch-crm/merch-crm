"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterEffectProps {
  words: { text: string; className?: string }[];
  className?: string;
  cursorClassName?: string;
}

/**
 * TypewriterEffect — reveals text letter by letter with a blinking cursor.
 * Independent implementation using IntersectionObserver + CSS animations.
 */
export function TypewriterEffect({
  words,
  className,
  cursorClassName,
}: TypewriterEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const totalChars = words.reduce((acc, w) => acc + w.text.length, 0);

  // IntersectionObserver to trigger animation when in view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Reveal letters one by one
  useEffect(() => {
    if (!hasStarted) return;
    if (visibleCount >= totalChars) return;

    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, 80);

    return () => clearTimeout(timer);
  }, [hasStarted, visibleCount, totalChars]);

  // Build flat character array with word boundaries
  let charIndex = 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "text-center text-base font-bold sm:text-xl md:text-3xl lg:text-5xl",
        className
      )}
    >
      {words.map((word, wordIdx) => (
        <span key={`word-${wordIdx}`} className="inline-block">
          {word.text.split("").map((char) => {
            const idx = charIndex++;
            return (
              <span
                key={`char-${idx}`}
                className={cn(
                  "inline-block transition-opacity duration-200",
                  idx < visibleCount ? "opacity-100" : "opacity-0",
                  word.className || "text-slate-900"
                )}
              >
                {char}
              </span>
            );
          })}
          &nbsp;
        </span>
      ))}
      <span
        className={cn(
          "inline-block h-4 w-[4px] rounded-sm bg-blue-500 md:h-6 lg:h-10 align-middle animate-[cursorBlink_0.8s_ease-in-out_infinite]",
          cursorClassName
        )}
      />
    </div>
  );
}

/**
 * TypewriterEffectSmooth — reveals text with a smooth width reveal animation.
 * Independent implementation using IntersectionObserver + CSS transitions.
 */
export function TypewriterEffectSmooth({
  words,
  className,
  cursorClassName,
}: TypewriterEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("my-6 flex items-center space-x-1", className)}
    >
      <div
        className="overflow-hidden pb-1 transition-[width] duration-[2s] ease-linear delay-[1s]"
        style={{ width: isVisible ? "fit-content" : "0%" }}
      >
        <div
          className="text-xs font-bold sm:text-base md:text-xl lg:text-3xl xl:text-5xl"
          style={{ whiteSpace: "nowrap" }}
        >
          {words.map((word, idx) => (
            <span key={`word-${idx}`} className="inline-block">
              {word.text.split("").map((char, charIdx) => (
                <span
                  key={`char-${charIdx}`}
                  className={cn("text-slate-900", word.className)}
                >
                  {char}
                </span>
              ))}
              &nbsp;
            </span>
          ))}
        </div>
      </div>
      <span
        className={cn(
          "block h-4 w-[4px] rounded-sm bg-blue-500 sm:h-6 xl:h-12 animate-[cursorBlink_0.8s_ease-in-out_infinite]",
          cursorClassName
        )}
      />
    </div>
  );
}
