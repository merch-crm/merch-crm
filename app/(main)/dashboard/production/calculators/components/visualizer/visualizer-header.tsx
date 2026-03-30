"use client";

import { Layers, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisualizerHeaderProps {
  hasDesigns: boolean;
  onExportPNG: () => void;
  onExportSVG: () => void;
}

export function VisualizerHeader({ hasDesigns, onExportPNG, onExportSVG }: VisualizerHeaderProps) {
  return (
    <div className="card-breakout px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/50 -mt-[var(--current-padding)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <Layers className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Раскладка на плёнке</h3>
          </div>
        </div>

        {hasDesigns && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExportPNG} className="h-9 gap-2 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm transition-all px-4">
              <Download className="h-4 w-4 text-slate-500" /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={onExportSVG} className="h-9 gap-2 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm transition-all px-4">
              <Download className="h-4 w-4 text-slate-500" /> SVG
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
