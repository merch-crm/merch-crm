import React from "react";
import { Printer, RotateCw, AlignLeft, AlignCenter, Download, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PaperSize, LayoutStyle, LabelDimensions, LabelContentSettings, LabelUiState, ResolvedParam } from "./hooks/useLabelPrinterLogic";

interface LabelPrinterSettingsProps {
    settings: {
        dimensions: LabelDimensions;
        content: LabelContentSettings;
        ui: LabelUiState;
    };
    setters: {
        setDimensions: React.Dispatch<React.SetStateAction<LabelDimensions>>;
        setContentSettings: React.Dispatch<React.SetStateAction<LabelContentSettings>>;
        setUiState: React.Dispatch<React.SetStateAction<LabelUiState>>;
        setExtraAttributesToggles: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    };
    data: {
        resolvedParams: ResolvedParam[];
        extraAttributesToggles: Record<string, boolean>;
        currentW: number;
        currentH: number;
    };
    availability: {
        hasBrand: boolean;
        hasQuality: boolean;
        hasMaterial: boolean;
        hasSize: boolean;
        hasAttribute: boolean;
    };
    onPrint: () => void;
}

export function LabelPrinterSettings({
    settings,
    setters,
    data,
    availability,
    onPrint
}: LabelPrinterSettingsProps) {
    const { dimensions, content: contentSettings, ui: uiState } = settings;
    const { setDimensions, setContentSettings, setUiState, setExtraAttributesToggles } = setters;
    const { resolvedParams, extraAttributesToggles, currentW, currentH } = data;
    const { hasBrand: hasBrandCode, hasQuality: hasQualityCode, hasMaterial: hasMaterialCode, hasSize: hasSizeCode, hasAttribute: hasAttributeCode } = availability;

    return (
        <div className="w-[420px] bg-white border-r border-slate-200 flex flex-col h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] overflow-hidden shrink-0">
            {/* Header */}
            <div className="flex-none px-6 py-5 border-b border-slate-200 bg-white relative z-10">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Printer className="w-5 h-5" />
                    </div>
                    Печать
                </h2>
            </div>

            {/* Scrollable Settings */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-3 custom-scrollbar relative">
                {/* Paper Size */}
                <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-slate-500 ml-1">Размер этикетки</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['58x40', '58x60', '75x120', 'a4', 'custom'].map((size) => (
                            <Button
                                type="button"
                                key={size}
                                onClick={() => setDimensions(prev => ({ ...prev, paperSize: size as PaperSize }))}
                                variant="ghost"
                                className={cn(
                                    "w-full h-11 rounded-2xl text-xs font-black border-2 transition-all duration-200 flex items-center justify-center leading-none",
                                    dimensions.paperSize === size
                                        ? "bg-slate-900 text-white border-slate-900 shadow-md hover:bg-slate-800 hover:text-white"
                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                                    size === 'custom' && "col-span-2"
                                )}
                            >
                                {size === 'custom' ? 'Свой размер' : size.replace('x', ' × ')}
                            </Button>
                        ))}
                    </div>

                    {dimensions.paperSize === 'custom' && (
                        <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={dimensions.customWidth}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, customWidth: Number(e.target.value) }))}
                                    className="w-full pl-3 pr-8 h-[42px] bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-white transition-all shadow-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none">MM</span>
                            </div>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={dimensions.customHeight}
                                    onChange={(e) => setDimensions(prev => ({ ...prev, customHeight: Number(e.target.value) }))}
                                    className="w-full pl-3 pr-8 h-[42px] bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-white transition-all shadow-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none">MM</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Layout Style Settings */}
                <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-slate-500 ml-1">Стиль макета</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'standard', label: 'Стандарт' },
                            { id: 'side-by-side', label: 'Компактный' },
                            { id: 'inline', label: 'Строчный' },
                            { id: 'minimal', label: 'Минимум' }
                        ].map((style) => (
                            <Button
                                type="button"
                                key={style.id}
                                onClick={() => setUiState(prev => ({ ...prev, layoutStyle: style.id as LayoutStyle }))}
                                variant="ghost"
                                className={cn(
                                    "py-2.5 px-3 rounded-2xl border-2 font-black text-xs transition-all",
                                    uiState.layoutStyle === style.id ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/10 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                {style.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Characteristics Toggles */}
                <div className={cn("space-y-2.5 transition-opacity", uiState.layoutStyle === 'minimal' && "opacity-40 pointer-events-none")}>
                    <label className="text-[11px] font-bold text-slate-500 ml-1">Характеристики</label>
                    <div className="-mx-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
                        <ToggleItem label="Артикул товара" checked={contentSettings.showArticle} onChange={(v) => setContentSettings(prev => ({ ...prev, showArticle: v }))} compact />
                        <ToggleItem label="Цена изделия" checked={contentSettings.showPrice} onChange={(v) => setContentSettings(prev => ({ ...prev, showPrice: v }))} compact />
                        <ToggleItem label="Штрихкод / QR-код" checked={contentSettings.showBarcode} onChange={(v) => setContentSettings(prev => ({ ...prev, showBarcode: v }))} compact />
                        <ToggleItem label="Состав материала" checked={contentSettings.showComposition} onChange={(v) => setContentSettings(prev => ({ ...prev, showComposition: v }))} compact />
                        {hasBrandCode && <ToggleItem label="Бренд" checked={contentSettings.showBrand} onChange={(v) => setContentSettings(prev => ({ ...prev, showBrand: v }))} compact />}
                        {hasQualityCode && <ToggleItem label="Качество" checked={contentSettings.showQuality} onChange={(v) => setContentSettings(prev => ({ ...prev, showQuality: v }))} compact />}
                        {hasMaterialCode && <ToggleItem label="Материал" checked={contentSettings.showMaterial} onChange={(v) => setContentSettings(prev => ({ ...prev, showMaterial: v }))} compact />}
                        {hasSizeCode && <ToggleItem label="Размер" checked={contentSettings.showSize} onChange={(v) => setContentSettings(prev => ({ ...prev, showSize: v }))} compact />}
                        {hasAttributeCode && <ToggleItem label="Цвет" checked={contentSettings.showColor} onChange={(v) => setContentSettings(prev => ({ ...prev, showColor: v }))} compact />}

                        {resolvedParams
                            .filter(p => !["brand", "quality", "material", "size", "color"].includes(p.slug))
                            .map(p => (
                                <ToggleItem
                                    key={p.slug}
                                    label={p.label}
                                    checked={extraAttributesToggles[p.slug] ?? true}
                                    onChange={(val) => setExtraAttributesToggles(prev => ({ ...prev, [p.slug]: val }))}
                                    compact
                                />
                            ))}

                        <ToggleItem label="Категория" checked={contentSettings.showCategory} onChange={(v) => setContentSettings(prev => ({ ...prev, showCategory: v }))} compact />
                    </div>
                </div>

                {/* Custom Text */}
                <div className={cn("space-y-2.5 transition-opacity", uiState.layoutStyle === 'minimal' && "opacity-40 pointer-events-none")}>
                    <label className="text-[11px] font-bold text-slate-500 ml-1">Дополнительная строка</label>
                    <Input
                        type="text"
                        value={contentSettings.customText}
                        onChange={(e) => setContentSettings(prev => ({ ...prev, customText: e.target.value }))}
                        placeholder="Например: Сделано в России"
                        disabled={uiState.layoutStyle === 'minimal'}
                        className="w-full px-4 h-11 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-white transition-all shadow-none"
                    />
                </div>


                {/* Layout Settings */}
                <div className="space-y-2.5 pb-2">
                    <label className="text-[11px] font-bold text-slate-500 ml-1">Расположение контента</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            onClick={() => setDimensions(prev => ({ ...prev, isLandscape: !prev.isLandscape }))}
                            variant="ghost"
                            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border-2 border-slate-900 bg-slate-900 text-white font-black text-xs shadow-sm transition-all active:scale-[0.98] hover:bg-slate-800 hover:text-white w-full h-auto"
                        >
                            <RotateCw className={cn("w-3.5 h-3.5 transition-transform duration-500", dimensions.isLandscape && "rotate-90")} />
                            {currentW > currentH ? 'Горизонтальный' : 'Вертикальный'}
                        </Button>
                        <div className="flex bg-slate-50 p-1 rounded-2xl border-2 border-transparent">
                            <Button
                                type="button"
                                onClick={() => setUiState(prev => ({ ...prev, alignment: 'left' }))}
                                variant="ghost"
                                className={cn(
                                    "flex-1 py-1.5 flex items-center justify-center rounded-2xl transition-all h-auto",
                                    uiState.alignment === 'left' ? "bg-white shadow-sm text-slate-900 hover:bg-white" : "text-slate-400 hover:text-slate-600 hover:bg-transparent"
                                )}
                            >
                                <AlignLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setUiState(prev => ({ ...prev, alignment: 'center' }))}
                                variant="ghost"
                                className={cn(
                                    "flex-1 py-1.5 flex items-center justify-center rounded-2xl transition-all h-auto",
                                    uiState.alignment === 'center' ? "bg-white shadow-sm text-slate-900 hover:bg-white" : "text-slate-400 hover:text-slate-600 hover:bg-transparent"
                                )}
                            >
                                <AlignCenter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Quantity & Actions */}
            <div className="flex-none px-6 pt-5 pb-6 bg-white border-t border-slate-200 z-50 space-y-3 shadow-[0_-12px_30px_-15px_rgba(0,0,0,0.08)]">
                {/* Quantity Row */}
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 ml-1">Тираж</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl">
                        <Button type="button" size="icon" variant="outline" onClick={() => setUiState(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))} className="w-8 h-8 rounded-2xl bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-sm transition-all active:scale-90">
                            <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <Input
                            type="number"
                            value={uiState.quantity}
                            onChange={(e) => setUiState(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                            className="w-12 h-8 bg-transparent text-center font-black text-base text-slate-900 focus-visible:ring-0 border-none shadow-none p-0"
                        />
                        <Button type="button" size="icon" variant="outline" onClick={() => setUiState(prev => ({ ...prev, quantity: prev.quantity + 1 }))} className="w-8 h-8 rounded-2xl bg-white border-slate-200 hover:bg-slate-100 text-slate-900 shadow-sm transition-all active:scale-90">
                            <Plus className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-16 rounded-2xl bg-white border-2 border-slate-200 text-slate-900 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group shadow-sm px-0"
                        title="Скачать PDF"
                    >
                        <Download className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    </Button>
                    <Button
                        type="button"
                        onClick={onPrint}
                        className="flex-1 h-12 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] group"
                    >
                        <Printer className="w-4 h-4 transition-transform" />
                        Печать
                    </Button>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ label, checked, onChange, compact }: { label: string; checked: boolean; onChange: (v: boolean) => void; compact?: boolean }) {
    return (
        <label className={cn(
            "flex items-center justify-between transition-colors cursor-pointer group",
            compact ? "p-2 rounded-2xl hover:bg-slate-50/80" : "p-3 rounded-2xl hover:bg-slate-50"
        )}>
            <span className={cn(
                "font-bold text-slate-700 group-hover:text-slate-900 transition-colors",
                compact ? "text-xs" : "text-sm"
            )}>{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} variant="success" className={compact ? "scale-75 origin-right" : ""} />
        </label>
    );
}
