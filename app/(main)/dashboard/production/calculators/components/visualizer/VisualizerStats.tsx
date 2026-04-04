import { Ruler, TrendingUp, Maximize, Layers } from 'lucide-react';
import { LayoutResult } from '@/lib/types/calculators';

interface VisualizerStatsProps {
  layoutResult: LayoutResult;
}

export function VisualizerStats({ layoutResult }: VisualizerStatsProps) {
  return (
    <div className="card-breakout card-breakout-bottom grid grid-cols-2 lg:grid-cols-4 gap-0 border-t border-slate-100 bg-slate-50/30">
      {/* Length */}
      <div className="flex items-center gap-3 p-5 border-r border-slate-100 transition-all hover:bg-white group/stat">
        <div className="bg-indigo-600/10 p-2.5 rounded-xl group-hover/stat:bg-indigo-600 group-hover/stat:text-white transition-all">
          <Ruler className="h-4 w-4 text-indigo-600 group-hover/stat:text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black  text-slate-400">Длина печати</span>
          <span className="text-sm font-bold text-slate-900">{(layoutResult.stats.totalLengthMm / 10).toFixed(1)} см</span>
        </div>
      </div>
      
      {/* Efficiency */}
      <div className="flex items-center gap-3 p-5 border-r border-slate-100 transition-all hover:bg-white group/stat">
        <div className="bg-blue-600/10 p-2.5 rounded-xl group-hover/stat:bg-blue-600 transition-all">
          <TrendingUp className="h-4 w-4 text-blue-600 group-hover/stat:text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black  text-blue-400/80">Эффективность</span>
          <span className="text-sm font-bold text-blue-600">{layoutResult.stats.efficiency}%</span>
        </div>
      </div>

      {/* Total Area */}
      <div className="flex items-center gap-3 p-5 border-r border-slate-100 transition-all hover:bg-white group/stat">
        <div className="bg-emerald-600/10 p-2.5 rounded-xl group-hover/stat:bg-emerald-600 transition-all">
          <Maximize className="h-4 w-4 text-emerald-600 group-hover/stat:text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black  text-slate-400">Общая площадь</span>
          <span className="text-sm font-bold text-slate-900 font-mono">{(layoutResult.stats.totalAreaMm2 / 1000000).toFixed(3)} м²</span>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-3 p-5 transition-all hover:bg-white group/stat">
        <div className="bg-amber-600/10 p-2.5 rounded-xl group-hover/stat:bg-amber-600 transition-all">
          <Layers className="h-4 w-4 text-amber-600 group-hover/stat:text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black  text-slate-400">Принтов</span>
          <span className="text-sm font-bold text-slate-900">{layoutResult.stats.printCount} шт</span>
        </div>
      </div>
    </div>
  );
}
