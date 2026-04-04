"use client";

import { composeRenderProps } from "react-aria-components";
import { cx } from "tailwind-variants";

export function composeTwRenderProps<T>(
  className: string | ((v: T) => string) | undefined,
  tailwind?: string | ((v: T) => string | undefined),
): string | ((v: T) => string) {
  return composeRenderProps(className, (className, renderProps): string => {
    const tw =
      typeof tailwind === "function"
        ? (tailwind(renderProps) ?? "")
        : (tailwind ?? "");
    const cls = className ?? "";
    return cx(tw, cls) ?? "";
  });
}

export const composeSlotClassName = (
  slotFn:
    | ((args?: { className?: string } & Record<string, unknown>) => string)
    | undefined,
  className?: string,
  variants?: Record<string, unknown>,
): string | undefined => {
  return typeof slotFn === "function"
    ? slotFn({ ...(variants ?? {}), className })
    : className;
};

export function composeTailwindClassName(
  className: string | undefined,
  tailwind: string,
): string {
  return (cx(tailwind, className ?? "") as string) || "";
}

// Alias for compatibility with some HeroUI components
export { composeTwRenderProps as composeTailwindRenderProps };
