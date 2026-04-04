"use client";
import React from "react";
import { cn } from "../utils/cn";

export type StarBorderProps<T extends React.ElementType = "button"> = {
  as?: T;
  color?: string;
  speed?: string;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export const StarBorder = <T extends React.ElementType = "button">({
  as,
  className,
  color = "rgba(139, 92, 246, 0.8)",
  speed = "3s",
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || "button";

  return React.createElement(
    Component,
    {
      className: cn(
        "group relative inline-flex h-fit w-fit items-center justify-center gap-3 overflow-hidden rounded-[100px] p-[1px] bg-slate-800/50 transition-transform active:scale-[0.97]",
        className
      ),
      ...rest,
    },
    React.createElement(
      "div",
      {
        className: "absolute inset-0 z-0 flex items-center justify-center pointer-events-none",
      },
      React.createElement("div", {
        className: "aspect-square min-w-[300%] min-h-[300%] animate-spin",
        style: {
          animationDuration: speed,
          background: `conic-gradient(from 0deg at 50% 50%, transparent 60%, ${color} 90%, white 100%)`,
        },
      })
    ),
    React.createElement(
      "span",
      {
        className: "relative z-10 flex h-full w-full items-center justify-center gap-3 rounded-[100px] bg-gray-950 px-6 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-[#0c101a]",
      },
      children
    )
  );
};
