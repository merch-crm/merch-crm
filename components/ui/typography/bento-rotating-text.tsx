"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoRotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
  mainClassName?: string;
}

export const BentoRotatingText = ({
  texts,
  interval = 3000,
  className = "",
  mainClassName = "",
}: BentoRotatingTextProps) => {
  const [index, setIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, interval);
    return () => clearInterval(timer);
  }, [texts.length, interval]);

  if (!isMounted) return null;

  return (
    <span className={cn("relative inline-flex overflow-hidden", mainClassName)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={texts[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn("inline-block", className)}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
