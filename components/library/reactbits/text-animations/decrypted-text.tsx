"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";

interface DecryptedTextProps {
  text?: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: "view" | "hover" | "click";
  clickMode?: "once" | "toggle";
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

export const DecryptedText = ({
  text = "",
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
}: DecryptedTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const iterationsRef = useRef<number[]>(new Array(text.length).fill(0));
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const containerRef = useRef<HTMLSpanElement>(null);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const availableChars = useMemo(() => (
    useOriginalCharsOnly
      ? [...new Set(text.split(""))].filter((c) => c !== " ")
      : chars.split("")
  ), [text, useOriginalCharsOnly]);

  const getRandomChar = useCallback(() =>
    // audit-ok: hydration (inside useCallback/event loop)
    availableChars[Math.floor(Math.random() * availableChars.length)],
  [availableChars]);

  const decrypt = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    iterationsRef.current = new Array(text.length).fill(0);

    intervalRef.current = setInterval(() => {
      setDisplayText((prev) => {
        const next = text.split("").map((char, i) => {
          if (char === " ") return " ";

          if (sequential) {
            let revealedCount = 0;
            for (let j = 0; j < text.length; j++) {
              if (iterationsRef.current[j] >= maxIterations) revealedCount++;
            }
            const shouldReveal =
              revealDirection === "start"
                ? i < revealedCount
                : revealDirection === "end"
                ? i >= text.length - revealedCount
                : Math.abs(i - Math.floor(text.length / 2)) <
                  revealedCount / 2;

            if (shouldReveal) return char;
          }

          if (iterationsRef.current[i] >= maxIterations) return char;
          iterationsRef.current[i]++;
          return getRandomChar();
        });

        if (iterationsRef.current.every((v) => v >= maxIterations)) {
          clearInterval(intervalRef.current);
          setIsAnimating(false);
          setIsRevealed(true);
          return text;
        }
        return next.join("");
      });
    }, speed);
  }, [text, speed, maxIterations, sequential, revealDirection, isAnimating]);

  useEffect(() => {
    if (animateOn === "view") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            decrypt();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [animateOn, decrypt]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleInteraction = () => {
    if (animateOn === "hover") {
      decrypt();
    } else if (animateOn === "click") {
      if (clickMode === "toggle") {
        if (isRevealed) {
          setIsRevealed(false);
          setDisplayText(
            text
              .split("")
              .map((c) => (c === " " ? " " : getRandomChar()))
              .join("")
          );
        } else {
          decrypt();
        }
      } else {
        if (!isRevealed) decrypt();
      }
    }
  };

  if (!isMounted) return <span className={parentClassName}>{text}</span>;

  return (
    <motion.span
      ref={containerRef}
      className={parentClassName}
      onMouseEnter={animateOn === "hover" ? handleInteraction : undefined}
      onClick={animateOn === "click" ? handleInteraction : undefined}
    >
      {displayText.split("").map((char, i) => {
        const isOriginal = char === text[i];
        return (
          <span
            key={i}
            className={isOriginal ? className : encryptedClassName}
          >
            {char}
          </span>
        );
      })}
    </motion.span>
  );
};

