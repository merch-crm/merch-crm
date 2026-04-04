import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Settings2,
} from 'lucide-react';
import { LayoutSettings } from '@/lib/types/calculators';
import { ROLL_WIDTH_OPTIONS } from '@/lib/utils/layout-optimizer';

interface VisualizerControlsProps {
  settings: LayoutSettings;
  updateSettings: (updates: Partial<LayoutSettings>) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  scale: number;
  baseScale: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleFitAll: () => void;
  readonly?: boolean;
  minScale: number;
  maxScale: number;
}

export function VisualizerControls({
  settings,
  updateSettings,
  showGrid,
  setShowGrid,
  scale,
  baseScale,
  handleZoomIn,
  handleZoomOut,
  handleFitAll,
  readonly = false,
  minScale,
  maxScale,
}: VisualizerControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
        {/* Width Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <Label className="text-xs font-black  text-slate-400">Ширина:</Label>
          <Select
            value={settings.rollWidthMm.toString()}
            onChange={(v) => updateSettings({ rollWidthMm: parseInt(v, 10) })}
            disabled={readonly}
            options={ROLL_WIDTH_OPTIONS.map((opt) => ({ id: opt.value.toString(), title: opt.label }))}
          />
        </div>
        
        {/* Margins Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl font-bold bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                <Settings2 className="h-4 w-4 text-slate-500" />
                <span className="hidden xs:inline">Отступы</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-5 rounded-[24px] border border-slate-200 bg-white/95 backdrop-blur-xl shadow-crm-xl animate-in fade-in zoom-in-95 duration-200 space-y-3">
              <div className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black  text-slate-400">Поля пленки</Label>
                    <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{settings.edgeMarginMm} мм</span>
                  </div>
                  <Slider
                    value={[settings.edgeMarginMm]}
                    onValueChange={([v]) => updateSettings({ edgeMarginMm: v })}
                    min={0}
                    max={50}
                    step={1}
                    className="py-2"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black  text-slate-400">Зазор принтов</Label>
                    <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{settings.gapMm} мм</span>
                  </div>
                  <Slider
                    value={[settings.gapMm]}
                    onValueChange={([v]) => updateSettings({ gapMm: v })}
                    min={0}
                    max={50}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="h-6 w-px bg-slate-200/60 hidden sm:block" />

        {/* Toggles Group */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <Label className="text-xs font-black  text-slate-400 hidden lg:block">Авто-поворот:</Label>
            <Switch 
              checked={settings.allowRotation} 
              onCheckedChange={(v) => updateSettings({ allowRotation: v })} 
              disabled={readonly} 
              className="scale-90"
            />
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs font-black  text-slate-400 hidden lg:block">Сетка:</Label>
            <Switch 
              checked={showGrid} 
              onCheckedChange={setShowGrid} 
              className="scale-90"
            />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200/60 hidden md:block" />

        {/* Zoom & Fit Group */}
        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={scale <= minScale} className="h-9 w-9 rounded-xl hover:bg-slate-100/50">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="text-xs w-12 text-center font-bold font-mono text-slate-500 bg-slate-100/50 py-1 rounded-lg">
            {Math.round((scale / baseScale) * 100)}%
          </div>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={scale >= maxScale} className="h-9 w-9 rounded-xl hover:bg-slate-100/50">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleFitAll} title="Вместить всё" className="h-9 w-9 rounded-xl hover:bg-slate-100/50 text-indigo-600">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
