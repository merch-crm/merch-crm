"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../utils/cn";

/**
 * RotatingText — cycles through text strings with per-character staggered animation.
 * Independent implementation using CSS transitions. No framer-motion.
 */

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  initial?: { y?: string; opacity?: number };
  animate?: { y?: string | number; opacity?: number };
  exit?: { y?: string; opacity?: number };
  transition?: { type?: string; damping?: number; stiffness?: number };
  className?: string;
}

interface WordObj {
  characters: string[];
  needsSpace: boolean;
}

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

export const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      rotationInterval = 2000,
      staggerDuration = 0,
      staggerFrom = "first",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      initial = { y: "100%", opacity: 0 },
      animate = { y: "0%", opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      className,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<"enter" | "visible" | "exit">("enter");
    const [isMounted, setIsMounted] = useState(false);
    const randomSeedRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      setIsMounted(true);
      // Deterministic seed from text content (avoids Math.random hydration warning)
      const str = texts[0] || "default";
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
      }
      randomSeedRef.current = Math.abs(hash % 1000) / 1000;
    }, []);

    const elements = useMemo((): WordObj[] => {
      const currentText = texts[currentIndex];
      if (splitBy === "characters") {
        const words = currentText.split(" ");
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      if (splitBy === "words") {
        return currentText.split(" ").map((word, i, arr) => ({
          characters: [word],
          needsSpace: i !== arr.length - 1,
        }));
      }
      if (splitBy === "lines") {
        return currentText.split("\n").map((line, i, arr) => ({
          characters: [line],
          needsSpace: i !== arr.length - 1,
        }));
      }
      return currentText.split(splitBy).map((part, i, arr) => ({
        characters: [part],
        needsSpace: i !== arr.length - 1,
      }));
    }, [texts, currentIndex, splitBy]);

    const totalChars = useMemo(
      () => elements.reduce((sum, w) => sum + w.characters.length, 0),
      [elements]
    );

    const getStaggerDelay = useCallback(
      (index: number): number => {
        const total = totalChars;
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last")
          return (total - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          const randomIndex = Math.floor(randomSeedRef.current * total);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      [totalChars, staggerFrom, staggerDuration]
    );

    const maxDelay = useMemo(() => {
      let max = 0;
      for (let i = 0; i < totalChars; i++) {
        max = Math.max(max, getStaggerDelay(i));
      }
      return max;
    }, [totalChars, getStaggerDelay]);

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentIndex(newIndex);
        if (onNext) onNext(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIdx =
        currentIndex === texts.length - 1
          ? loop
            ? 0
            : currentIndex
          : currentIndex + 1;
      if (nextIdx !== currentIndex) {
        handleIndexChange(nextIdx);
      }
    }, [currentIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIdx =
        currentIndex === 0
          ? loop
            ? texts.length - 1
            : currentIndex
          : currentIndex - 1;
      if (prevIdx !== currentIndex) {
        handleIndexChange(prevIdx);
      }
    }, [currentIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentIndex) {
          handleIndexChange(validIndex);
        }
      },
      [texts.length, currentIndex, handleIndexChange]
    );

    const reset = useCallback(() => {
      if (currentIndex !== 0) {
        handleIndexChange(0);
      }
    }, [currentIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [
      next,
      previous,
      jumpTo,
      reset,
    ]);

    // Animation cycle: enter → visible → exit → change index → enter
    const animDuration = 350; // ms per phase transition

    useEffect(() => {
      if (!isMounted) return;
      // On mount or index change, start enter phase
      setPhase("enter");
    }, [currentIndex, isMounted]);

    useEffect(() => {
      if (!auto || !isMounted) return;

      if (phase === "enter") {
        // Wait for enter animation + stagger, then go visible
        timerRef.current = setTimeout(() => {
          setPhase("visible");
        }, animDuration + maxDelay * 1000);
      } else if (phase === "visible") {
        // Hold visible, then start exit
        timerRef.current = setTimeout(() => {
          setPhase("exit");
        }, rotationInterval - animDuration * 2 - maxDelay * 1000);
      } else if (phase === "exit") {
        // Wait for exit animation, then advance
        timerRef.current = setTimeout(() => {
          next();
        }, animDuration + maxDelay * 1000);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [phase, auto, isMounted, rotationInterval, maxDelay, next, animDuration]);

    if (!isMounted) return null;

    const getCharStyle = (
      charGlobalIndex: number
    ): React.CSSProperties => {
      const delay = getStaggerDelay(charGlobalIndex);
      const isEntering = phase === "enter" || phase === "visible";
      const isExiting = phase === "exit";

      return {
        display: "inline-block",
        transform: isExiting
          ? `translateY(${exit?.y || "-120%"})`
          : isEntering
          ? `translateY(${typeof animate?.y === "number" ? `${animate.y}px` : animate?.y || "0%"})`
          : `translateY(${initial?.y || "100%"})`,
        opacity: isExiting
          ? exit?.opacity ?? 0
          : isEntering
          ? animate?.opacity ?? 1
          : initial?.opacity ?? 0,
        transition: `transform ${animDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s, opacity ${animDuration}ms ease ${delay}s`,
        willChange: "transform, opacity",
      };
    };

    let globalCharIndex = 0;

    return (
      <span
        className={cn(
          "flex flex-wrap whitespace-pre-wrap relative",
          mainClassName,
          className
        )}
      >
        <span className="sr-only">{texts[currentIndex]}</span>
        <span
          className={cn(
            splitBy === "lines"
              ? "flex flex-col w-full"
              : "flex flex-wrap whitespace-pre-wrap relative"
          )}
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex) => (
            <span
              key={`${currentIndex}-${wordIndex}`}
              className={cn("inline-flex", splitLevelClassName)}
            >
              {wordObj.characters.map((char, charIndex) => {
                const style = getCharStyle(globalCharIndex);
                globalCharIndex++;
                return (
                  <span
                    key={`${currentIndex}-${wordIndex}-${charIndex}`}
                    className={cn("inline-block", elementLevelClassName)}
                    style={style}
                  >
                    {char}
                  </span>
                );
              })}
              {wordObj.needsSpace && (
                <span className="whitespace-pre"> </span>
              )}
            </span>
          ))}
        </span>
      </span>
    );
  }
);

RotatingText.displayName = "RotatingText";
export default RotatingText;
