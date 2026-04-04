"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  separator?: string;
  decimals?: number;
  className?: string;
  onEnd?: () => void;
}

export const CountUp = ({
  from = 0,
  to,
  duration = 2,
  separator = ",",
  decimals = 0,
  className = "",
  onEnd,
}: CountUpProps) => {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const currentCount = from + (to - from) * eased;
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(to);
        onEnd?.();
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, from, to, duration, onEnd]);

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    if (!separator) return fixed;
    const [integer, decimal] = fixed.split(".");
    const formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decimal ? `${formatted}.${decimal}` : formatted;
  };

  return (
    <motion.span ref={ref} className={className}>
      {formatNumber(count)}
    </motion.span>
  );
};
