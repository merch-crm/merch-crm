"use client";

import { useState } from "react";
import { cn } from "@/components/library/custom/utils/cn";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";

interface CodePreviewProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  maxHeight?: number;
}

export function CodePreview({
  code,
  language = "tsx",
  title,
  className,
  maxHeight = 300,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-inner)] border border-border bg-slate-950",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          </div>
          {title && (
            <span className="ml-2 text-xs text-white/40">{title}</span>
          )}
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-white/50">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Code */}
      <div
        className="overflow-auto p-4"
        style={{ maxHeight: expanded ? "none" : maxHeight }}
      >
        <pre className="text-xs leading-relaxed text-white/80">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
