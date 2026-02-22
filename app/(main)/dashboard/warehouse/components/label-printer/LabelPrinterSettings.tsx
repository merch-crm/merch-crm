"use client";
import React from "react";
import { AlignLeft, AlignCenter, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PrinterConfig, DisplayOptions, PaperSize, LayoutStyle, ResolvedParam } from "./label-printer-types";
import { InventoryItem, BrandingSettings } from "../../types";

interface LabelPrinterSettingsProps {
    config: PrinterConfig;
    setConfig: React.Dispatch<React.SetStateAction<PrinterConfig>>;
    displayOptions: DisplayOptions;
    setDisplayOptions: React.Dispatch<React.SetStateAction<DisplayOptions>>;
    item: InventoryItem;
    resolvedParams: ResolvedParam[];
    branding: BrandingSettings;
}

export function LabelPrinterSettings({
    config,
    setConfig,
    displayOptions,
    setDisplayOptions,
    item,
    resolvedParams,
    branding
}: LabelPrinterSettingsProps) {

    return (
        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto px-6 py-6 space-y-3 md:custom-scrollbar relative">
            {/* Paper Size */}
            <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Размер этикетки</label>
                <div className="grid grid-cols-3 gap-2">
                    {['58x40', '58x60', '75x120', 'a4', 'custom'].map((size) => (
                        <Button
                            key={size}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, paperSize: size as PaperSize }))}
                            variant="ghost"
                            className={cn(
                                "w-full h-11 rounded-[var(--radius-inner)] text-xs font-bold border-2 transition-all duration-200 flex items-center justify-center leading-none",
                                config.paperSize === size
                                    ? "bg-slate-900 text-white border-slate-900 shadow-md hover:bg-slate-800 hover:text-white"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            {size === 'custom' ? 'Свой' : size.replace('x', ' × ')}
                        </Button>
                    ))}
                </div>

                {config.paperSize === 'custom' && (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        <div className="relative">
                            <Input
                                type="number"
                                value={config.customWidth}
                                onChange={(e) => setConfig(prev => ({ ...prev, customWidth: Number(e.target.value) }))}
                                className="w-full pl-3 pr-8 h-[42px] bg-slate-50 border-2 border-transparent rounded-[var(--radius-inner)] text-sm font-bold focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-white transition-all shadow-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">MM</span>
                        </div>
                        <div className="relative">
                            <Input
                                type="number"
                                value={config.customHeight}
                                onChange={(e) => setConfig(prev => ({ ...prev, customHeight: Number(e.target.value) }))}
                                className="w-full pl-3 pr-8 h-[42px] bg-slate-50 border-2 border-transparent rounded-[var(--radius-inner)] text-sm font-bold focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-white transition-all shadow-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">MM</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Layout Style Settings */}
            <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Стиль макета</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { id: 'standard', label: 'Стандарт' },
                        { id: 'side-by-side', label: 'Компактный' },
                        { id: 'inline', label: 'Строчный' },
                        { id: 'minimal', label: 'Минимум' }
                    ].map((style) => (
                        <Button
                            key={style.id}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, layoutStyle: style.id as LayoutStyle }))}
                            variant="ghost"
                            className={cn(
                                "w-full h-11 rounded-[var(--radius-inner)] border-2 font-bold text-xs transition-all flex items-center justify-center",
                                config.layoutStyle === style.id ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/10 hover:bg-slate-800 hover:text-white" : "bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            {style.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Characteristics Toggles */}
            <div className={cn("space-y-2.5 transition-opacity", config.layoutStyle === 'minimal' && "opacity-40 pointer-events-none")}>
                <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Характеристики</label>
                <div className="-mx-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
                    <ToggleItem label="Артикул товара" checked={displayOptions.article} onChange={(val) => setDisplayOptions(prev => ({ ...prev, article: val }))} compact />
                    <ToggleItem label="Цена с/с" checked={displayOptions.costPrice} onChange={(val) => setDisplayOptions(prev => ({ ...prev, costPrice: val }))} compact />
                    <ToggleItem label="Продажная цена" checked={displayOptions.sellingPrice} onChange={(val) => setDisplayOptions(prev => ({ ...prev, sellingPrice: val }))} compact />
                    <ToggleItem label="Штрихкод / QR-код" checked={displayOptions.barcode} onChange={(val) => setDisplayOptions(prev => ({ ...prev, barcode: val }))} compact />
                    <ToggleItem label="Состав материала" checked={displayOptions.composition} onChange={(val) => setDisplayOptions(prev => ({ ...prev, composition: val }))} compact />
                    {item.brandCode && <ToggleItem label="Бренд" checked={displayOptions.brand} onChange={(val) => setDisplayOptions(prev => ({ ...prev, brand: val }))} compact />}
                    {item.qualityCode && <ToggleItem label="Качество" checked={displayOptions.quality} onChange={(val) => setDisplayOptions(prev => ({ ...prev, quality: val }))} compact />}
                    {item.materialCode && <ToggleItem label="Материал" checked={displayOptions.material} onChange={(val) => setDisplayOptions(prev => ({ ...prev, material: val }))} compact />}
                    {item.sizeCode && <ToggleItem label="Размер" checked={displayOptions.size} onChange={(val) => setDisplayOptions(prev => ({ ...prev, size: val }))} compact />}
                    {item.attributeCode && <ToggleItem label="Цвет" checked={displayOptions.color} onChange={(val) => setDisplayOptions(prev => ({ ...prev, color: val }))} compact />}

                    {resolvedParams
                        .filter(p => !["brand", "quality", "material", "size", "color"].includes(p.slug))
                        .map(p => (
                            <ToggleItem
                                key={p.slug}
                                label={p.label}
                                checked={displayOptions.extra[p.slug] ?? true}
                                onChange={(val) => setDisplayOptions(prev => ({ ...prev, extra: { ...prev.extra, [p.slug]: val } }))}
                                compact
                            />
                        ))}

                    <ToggleItem label="Категория" checked={displayOptions.category} onChange={(val) => setDisplayOptions(prev => ({ ...prev, category: val }))} compact />
                    {branding?.printLogoUrl && <ToggleItem label="Логотип" checked={displayOptions.logo} onChange={(val) => setDisplayOptions(prev => ({ ...prev, logo: val }))} compact />}
                </div>
            </div>

            {/* Custom Text */}
            <div className={cn("space-y-2.5 transition-opacity", config.layoutStyle === 'minimal' && "opacity-40 pointer-events-none")}>
                <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Дополнительная строка</label>
                <Input
                    type="text"
                    value={config.customText}
                    onChange={(e) => setConfig(prev => ({ ...prev, customText: e.target.value }))}
                    placeholder="Например: Сделано в России"
                    disabled={config.layoutStyle === 'minimal'}
                    className="w-full px-4 h-11 bg-slate-50 border-2 border-transparent rounded-[var(--radius-inner)] text-sm font-bold focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-white transition-all shadow-none"
                />
            </div>

            {/* Layout Settings */}
            <div className="space-y-2.5 pb-2">
                <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Расположение контента</label>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, isLandscape: !prev.isLandscape }))}
                        variant="ghost"
                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[var(--radius-inner)] border-2 border-slate-900 bg-slate-900 text-white font-bold text-xs transition-all active:scale-[0.98] hover:bg-slate-800 hover:text-white w-full h-auto"
                    >
                        <RotateCw className={cn("w-3.5 h-3.5 transition-transform duration-500", config.isLandscape && "rotate-90")} />
                        Горизонтальный
                    </Button>
                    <div className="flex bg-slate-50 p-1 rounded-[var(--radius-inner)] border-2 border-transparent">
                        <Button
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, alignment: 'left' }))}
                            variant="ghost"
                            aria-label="Выравнивание по левому краю"
                            className={cn(
                                "flex-1 py-1.5 flex items-center justify-center rounded-[var(--radius-inner)] transition-all h-auto",
                                config.alignment === 'left' ? "bg-white shadow-sm text-slate-900 hover:bg-white" : "text-slate-400 hover:text-slate-600 hover:bg-transparent"
                            )}
                        >
                            <AlignLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, alignment: 'center' }))}
                            variant="ghost"
                            aria-label="Выравнивание по центру"
                            className={cn(
                                "flex-1 py-1.5 flex items-center justify-center rounded-[var(--radius-inner)] transition-all h-auto",
                                config.alignment === 'center' ? "bg-white shadow-sm text-slate-900 hover:bg-white" : "text-slate-400 hover:text-slate-600 hover:bg-transparent"
                            )}
                        >
                            <AlignCenter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ label, checked, onChange, compact }: { label: string; checked: boolean; onChange: (v: boolean) => void; compact?: boolean }) {
    return (
        <label className={cn(
            "flex items-center justify-between transition-colors cursor-pointer group",
            compact ? "p-2 rounded-[var(--radius-inner)] hover:bg-slate-50/80" : "p-3 rounded-[var(--radius-inner)] hover:bg-slate-50"
        )}>
            <span className={cn(
                "font-bold text-slate-700 group-hover:text-slate-900 transition-colors",
                compact ? "text-xs" : "text-sm"
            )}>{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} variant="success" className={compact ? "scale-75 origin-right" : ""} />
        </label>
    );
}
