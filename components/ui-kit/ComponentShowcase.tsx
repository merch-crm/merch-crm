"use client";

import { ReactNode, useContext, useEffect, useId } from "react";
import { cn } from "@/components/library/custom/utils/cn";
import { CategoryContext } from "./CategoryPage";

interface ComponentShowcaseProps {
  title: ReactNode;
  description?: ReactNode;
  desc?: ReactNode;
  children: ReactNode;
  className?: string; // Standard HTML/React prop
  source?: string;    // Added missing prop from older usages
  importPath?: string;// Added missing prop from older usages
  code?: string;      // Added missing prop from older usages
}

export function ComponentShowcase({
  title,
  description,
  desc,
  children,
  className,
  code,
  importPath,
}: ComponentShowcaseProps) {
  const finalDescription = description || desc;
  const finalCode = code || (importPath ? `import { ${importPath} } from "@/components/ui";` : null);

  const id = useId();
  const context = useContext(CategoryContext);
  
  useEffect(() => {
    context.registerComponent(id);
    return () => context.unregisterComponent(id);
  }, [id, context]);

  return (
    <div
      className={cn(
        "crm-card overflow-visible",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
          {finalDescription && (
            <p className="text-sm text-muted-foreground">{finalDescription}</p>
          )}
          {(finalCode || importPath) && (
            <div className="flex flex-col gap-1 mt-2">
              {(finalCode || importPath) && (
                <code className="text-[10px] bg-slate-100/80 text-slate-600 px-2.5 py-1.5 rounded-lg font-mono border border-slate-200/60 inline-flex items-center w-fit">
                  {code || `import { ${importPath} } from "@/components/ui/${importPath?.toLowerCase()}";`}
                </code>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-[var(--radius-inner)] border border-border bg-[var(--background)] p-6 overflow-visible">
        {children}
      </div>
    </div>
  );
}
