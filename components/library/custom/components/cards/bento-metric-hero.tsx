"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoMetricHeroProps {
  title: string;
  value: string;
  subtitle?: string;
  className?: string;
}

export function BentoMetricHero({ title, value, subtitle, className }: BentoMetricHeroProps) {
  return (
    <motion.div
      whileHover={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-md border border-border p-6 md:p-8 rounded-[27px] flex flex-col justify-end min-h-[220px]",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <h3 className="text-sm font-semibold   text-muted-foreground mb-1">
          {title}
        </h3>
        <div className="text-5xl md:text-7xl font-black font-heading  text-foreground mb-2">
          {value}
        </div>
        {subtitle && (
          <p className="text-sm font-medium text-muted-foreground bg-secondary/50 inline-block px-3 py-1 rounded-full">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
