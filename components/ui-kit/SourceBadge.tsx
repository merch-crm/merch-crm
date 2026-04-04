import { cn } from "@/components/library/custom/utils/cn";

export type Source = "aceternity" | "reactbits" | "heroui" | "alignui" | "custom" | "gravity" | "base" | "radix";

const sourceConfig: Record<Source, { label: string; color: string }> = {
  aceternity: {
    label: "Aceternity",
    color: "bg-violet-100 text-violet-700 border-violet-200",
  },
  reactbits: {
    label: "React Bits",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  heroui: {
    label: "HeroUI",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  alignui: {
    label: "AlignUI",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  custom: {
    label: "Собственный",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  gravity: {
    label: "GravityUI",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  base: {
    label: "Базовый",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  radix: {
    label: "Radix UI",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

export function SourceBadge({
  source,
  className,
}: {
  source: Source;
  className?: string;
}) {
  const config = sourceConfig[source];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold  ",
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}
