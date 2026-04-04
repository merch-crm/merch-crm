"use client";

import { cn } from "@/components/library/custom/utils/cn";

type Source = "all" | "aceternity" | "reactbits" | "heroui" | "alignui" | "custom";

const sources: { value: Source; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "heroui", label: "HeroUI" },
  { value: "aceternity", label: "Aceternity" },
  { value: "reactbits", label: "React Bits" },
  { value: "alignui", label: "AlignUI" },
  { value: "custom", label: "Свои" },
];

interface ComponentFilterProps {
  value: Source;
  onChange: (source: Source) => void;
}

export function ComponentFilter({ value, onChange }: ComponentFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sources.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-all",
            value === s.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
