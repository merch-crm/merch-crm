"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BgSolidProps {
  children: React.ReactNode;
  className?: string;
}

export function BgSolid({ children, className }: BgSolidProps) {
  return (
    <div className={cn("bg-white min-h-screen", className)}>
      {children}
    </div>
  );
}
