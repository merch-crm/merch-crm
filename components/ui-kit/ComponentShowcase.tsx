"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/components/library/custom/utils/cn";
import { SourceBadge, Source } from "./SourceBadge";
import { CodePreview } from "./CodePreview";
import { Eye, Code2 } from "lucide-react";

type ViewMode = "preview" | "code" | "responsive";

interface ComponentShowcaseProps {
  title: string;
  description?: string;
  desc?: string;
  source: Source;
  importPath?: string;
  code?: string;
  children: ReactNode;
  className?: string;
}

export function ComponentShowcase({
  title,
  description,
  desc,
  source,
  importPath,
  code,
  children,
  className,
}: ComponentShowcaseProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const finalDescription = description || desc;

  return (
    <div
      className={cn(
        "crm-card overflow-visible",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <SourceBadge source={source} />
          </div>
          {finalDescription && (
            <p className="text-sm text-muted-foreground">{finalDescription}</p>
          )}
          {importPath && (
            <code className="block text-[11px] text-muted-foreground/70">
              {importPath}
            </code>
          )}
        </div>

        {/* View mode toggles */}
        <div className="flex items-center gap-0.5 rounded-lg bg-muted/50 p-0.5">
          <button
            onClick={() => setViewMode("preview")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
              viewMode === "preview"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Предпросмотр
          </button>
          {code && (
            <button
              onClick={() => setViewMode("code")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                viewMode === "code"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Code2 className="h-3.5 w-3.5" />
              Код
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === "preview" && (
        <div className="rounded-[var(--radius-inner)] border border-border bg-[var(--background)] p-6 overflow-visible">
          {children}
        </div>
      )}

      {viewMode === "code" && code && (
        <CodePreview code={code} title={`${title}.tsx`} />
      )}
    </div>
  );
}
