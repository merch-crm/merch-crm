import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { useBranding } from "@/components/branding-provider";
import { PaperSize, LabelUiState, LabelContentSettings, LabelDimensions, ResolvedParam } from "./hooks/useLabelPrinterLogic";

interface LabelPrinterPreviewProps {
    item: InventoryItem;
    settings: {
        ui: LabelUiState;
        content: LabelContentSettings;
        dimensions: LabelDimensions;
    };
    params: {
        visible: ResolvedParam[];
        hasComposition: boolean;
    };
    scales: {
        base: number;
        name: number;
        attr: number;
        price: number;
    };
    layout: {
        qrDensity: number;
        useTwoColumns: boolean;
        previewStyle: React.CSSProperties;
        previewScale: number;
        currentH: number;
        currentW: number;
        widthNum: number;
        heightNum: number;
    };
    actions: {
        setRefNode: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
        getSizeDimensions: (size: PaperSize) => { width: string, height: string };
        getAttrLabel: (slug: string, code: string | number | null | undefined) => string;
        onClose: () => void;
    };
}

export function LabelPrinterPreview({
    item,
    settings,
    params,
    scales,
    layout,
    actions
}: LabelPrinterPreviewProps) {
    const { currencySymbol } = useBranding();
    const { ui: uiState, content: contentSettings, dimensions } = settings;
    const { visible: visibleParams, hasComposition } = params;
    const { base: scale, name: finalNameScale, attr: finalAttrScale, price: finalPriceScale } = scales;
    const { qrDensity: qrDensityFactor, useTwoColumns, previewStyle, previewScale, currentH, currentW, widthNum, heightNum } = layout;
    const { setRefNode, getSizeDimensions, getAttrLabel, onClose } = actions;

    return (
        <div className="flex-1 bg-[#929292] relative overflow-hidden flex flex-col min-w-0">

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* Top Bar Overlay */}
            <div className="absolute top-8 left-8 right-8 flex justify-end items-start z-50 pointer-events-none">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-12 w-12 rounded-2xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 transition-all shadow-xl active:scale-95 group pointer-events-auto cursor-pointer"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </Button>
            </div>

            {/* Label Preview */}
            <div
                ref={setRefNode}
                className="absolute inset-0 flex items-center justify-center overflow-hidden p-6"
            >
                <div
                    id="label-preview-content"
                    className="bg-white rounded-sm shadow-2xl relative flex-shrink-0"
                    style={previewStyle}
                >
                    {/* Row 1: Header */}
                    <div className={cn(
                        "flex flex-col min-h-0",
                        (uiState.layoutStyle === 'minimal' || uiState.alignment === 'center') ? "items-center text-center" : "items-start text-left"
                    )}>
                        {contentSettings.showCategory && item.category?.name && uiState.layoutStyle !== 'minimal' && (
                            <div style={{ fontSize: `${7 * scale}px` }} className="font-black text-slate-400 leading-none mb-0.5">
                                {item.category.name}
                            </div>
                        )}
                        <div style={{ fontSize: `${(uiState.layoutStyle === 'minimal' ? 14 : 14.5) * scale * finalNameScale}px`, hyphens: 'auto' } as React.CSSProperties} className="font-black text-black leading-[1.05] break-words">
                            {item.name}
                        </div>
                        {uiState.layoutStyle === 'minimal' && item.sizeCode && (
                            <div style={{ fontSize: `${12 * scale * finalAttrScale}px` }} className="font-black text-slate-900 mt-1 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                                Размер: {getAttrLabel('size', item.sizeCode)}
                            </div>
                        )}
                        {contentSettings.showArticle && item.sku && uiState.layoutStyle !== 'minimal' && (
                            <div style={{ fontSize: `${8 * scale}px` }} className="font-mono font-bold text-slate-500 mt-1">
                                Арт: {item.sku}
                            </div>
                        )}
                    </div>

                    {/* Row 2: Content (flexible area) */}
                    {uiState.layoutStyle !== 'minimal' && (
                        <div className={cn(
                            "flex-1 min-h-0 overflow-hidden py-1 flex flex-col justify-center",
                            uiState.alignment === 'center' ? "items-center" : "items-start"
                        )}>
                            {uiState.layoutStyle === 'inline' ? (
                                <div
                                    style={{ fontSize: `${9 * scale * finalAttrScale}px` }}
                                    className={cn(
                                        "flex flex-wrap gap-x-2 gap-y-0.5 font-bold text-slate-700 leading-tight",
                                        uiState.alignment === 'center' ? "justify-center" : "justify-start"
                                    )}
                                >
                                    {visibleParams.map((param, i) => (
                                        <span key={param.slug}>
                                            <span className="text-slate-400 font-medium">{param.label}: </span>
                                            <span>{param.value}</span>
                                            {i < visibleParams.length - 1 && <span className="ml-2 text-slate-300">|</span>}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className={cn(
                                    "grid gap-x-3 gap-y-0.5",
                                    useTwoColumns ? "grid-cols-2" : "grid-cols-1",
                                    uiState.alignment === 'center' ? "justify-items-center" : "justify-items-start"
                                )}>
                                    {visibleParams.map((param) => (
                                        <div key={param.slug} style={{ fontSize: `${(currentH > currentW ? (dimensions.paperSize === '75x120' ? 9 : 11) : 9) * scale * finalAttrScale}px` }} className={cn(
                                            "flex gap-1.5 font-bold text-slate-700 leading-tight",
                                            uiState.alignment === 'center' ? "justify-center text-center" : "justify-start text-left"
                                        )}>
                                            {uiState.layoutStyle !== 'side-by-side' && <span className="text-slate-400 font-medium shrink-0">{param.label}:</span>}
                                            <span className="break-words" style={{ hyphens: 'auto' } as React.CSSProperties}>{param.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {hasComposition && (
                                <div
                                    style={{ fontSize: `${(currentH > currentW ? (dimensions.paperSize === '75x120' ? 9 : 10) : 8.5) * scale * finalAttrScale}px`, paddingBottom: `${0.5 * scale}mm` }}
                                    className={cn(
                                        "font-bold text-slate-700 leading-tight border-b border-slate-200 mt-1 w-full break-words",
                                        uiState.alignment === 'center' ? "text-center" : "text-left"
                                    )}
                                >
                                    <span className="text-slate-400 font-medium">Состав: </span>
                                    {Object.entries(item.materialComposition || {})
                                        .map(([name, percent]) => `${name} ${percent}%`)
                                        .join(', ')}
                                </div>
                            )}
                            {contentSettings.customText && (
                                <div
                                    style={{ fontSize: `${8 * scale * finalAttrScale}px`, paddingTop: `${0.5 * scale}mm` }}
                                    className={cn(
                                        "font-black text-black border-t border-slate-200 mt-0.5 w-full break-words",
                                        uiState.alignment === 'center' ? "text-center" : "text-left"
                                    )}
                                >
                                    {contentSettings.customText}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Row 3: Footer */}
                    <div className={cn(
                        "pt-1.5 border-t border-slate-200 flex gap-2 shrink-0",
                        (uiState.layoutStyle === 'side-by-side' || uiState.layoutStyle === 'inline' || heightNum <= 60 || dimensions.paperSize === '75x120') ? "flex-row justify-between items-end w-full px-1" : "flex-col items-center",
                        uiState.layoutStyle === 'minimal' && "flex-1 justify-center items-center border-none pt-2"
                    )}>
                        {contentSettings.showPrice && item.sellingPrice !== null && uiState.layoutStyle !== 'minimal' && (
                            <div style={{ fontSize: `${(dimensions.paperSize === 'a4' || dimensions.paperSize === '75x120' ? 24 : (currentH > currentW ? 19 : (dimensions.paperSize === '58x60' ? 14 : 16))) * scale * finalPriceScale}px` }} className="font-black text-black leading-none">
                                {new Intl.NumberFormat('ru-RU').format(Number(item.sellingPrice))} <span style={{ fontSize: `${(dimensions.paperSize === 'a4' || dimensions.paperSize === '75x120' ? 12 : (currentH > currentW ? 11 : 9)) * scale * finalPriceScale}px` }} className="font-bold text-slate-400">{currencySymbol}</span>
                            </div>
                        )}
                        {(contentSettings.showBarcode || uiState.layoutStyle === 'minimal') && (
                            <QRCodeSVG
                                value={item.sku || item.id}
                                size={Math.round((
                                    uiState.layoutStyle === 'minimal'
                                        ? (
                                            (dimensions.isLandscape ? widthNum : heightNum) >= 110 ? 160 :
                                                (dimensions.isLandscape ? widthNum : heightNum) >= 80 ? 120 :
                                                    (dimensions.isLandscape ? widthNum : heightNum) >= 55 ? 90 : 75
                                        )
                                        : (dimensions.paperSize === 'a4' ? 160 : (dimensions.paperSize === '75x120' ? 85 : (dimensions.paperSize === '58x60' ? 40 : (dimensions.paperSize === '58x40' ? ((uiState.layoutStyle === 'side-by-side' || uiState.layoutStyle === 'inline') ? (currentH > currentW ? 38 : 22) : (currentH > currentW ? 45 : 28)) : (currentH > currentW ? 45 : 32)))))
                                ) * qrDensityFactor)}
                                level="M"
                                className="opacity-100"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Dimensions Label (Bottom Right) */}
            <div className="absolute bottom-8 right-8 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 pointer-events-none">
                <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                    Масштаб: {Math.round(previewScale * 100)}%
                    <span className="w-1 h-3 bg-slate-200 rounded-full" />
                    {dimensions.isLandscape ? getSizeDimensions(dimensions.paperSize).height : getSizeDimensions(dimensions.paperSize).width}
                    <span className="text-slate-400">×</span>
                    {dimensions.isLandscape ? getSizeDimensions(dimensions.paperSize).width : getSizeDimensions(dimensions.paperSize).height}
                </span>
            </div>
        </div>
    );
}
