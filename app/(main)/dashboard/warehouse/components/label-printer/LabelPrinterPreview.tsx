"use client";
import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { PrinterConfig, DisplayOptions, ResolvedParam } from "./label-printer-types";
import { InventoryItem, BrandingSettings } from "../../types";
import { getSizeDimensions, getScales } from "./label-printer-utils";

interface LabelPrinterPreviewProps {
    config: PrinterConfig;
    displayOptions: DisplayOptions;
    item: InventoryItem;
    resolvedParams: ResolvedParam[];
    getAttrLabel: (typeSlug: string, code: string | number | boolean | null | undefined) => string;
    branding: BrandingSettings;
    onClose: () => void;
    isMobile: boolean;
}

export function LabelPrinterPreview({
    config,
    displayOptions,
    item,
    resolvedParams,
    getAttrLabel,
    branding,
    onClose,
    isMobile
}: LabelPrinterPreviewProps) {
    const [refNode, setRefNode] = useState<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!refNode) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        observer.observe(refNode);
        return () => observer.disconnect();
    }, [refNode]);

    const { currencySymbol } = branding;
    const dims = getSizeDimensions(config.paperSize, config.customWidth, config.customHeight);
    const widthNum = parseInt(dims.width);
    const heightNum = parseInt(dims.height);

    const getPreviewScale = () => {
        if (containerSize.width === 0 || containerSize.height === 0) return 0.5;
        const w = config.isLandscape ? heightNum : widthNum;
        const h = config.isLandscape ? widthNum : heightNum;
        const pxW = w * 3.78;
        const pxH = h * 3.78;
        const padding = isMobile ? 32 : 120;
        return Math.min((containerSize.width - padding) / pxW, (containerSize.height - padding) / pxH);
    };

    const previewScale = getPreviewScale();
    const scale = 1.0; // Base scale simplified for now

    const previewStyle = {
        width: config.isLandscape ? `${heightNum}mm` : `${widthNum}mm`,
        height: config.isLandscape ? `${widthNum}mm` : `${heightNum}mm`,
        backgroundColor: 'white',
        color: 'black',
        display: 'grid',
        gridTemplateRows: config.layoutStyle === 'minimal' ? 'auto 1fr' : 'min-content 1fr min-content',
        rowGap: `${1 * scale}mm`,
        padding: config.paperSize === 'a4' ? '12mm' : (config.paperSize === '75x120' ? '6mm' : '4mm'),
        overflow: 'hidden' as const,
        textAlign: config.alignment as React.CSSProperties['textAlign'],
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box' as const,
        transform: `scale(${previewScale})`,
        transformOrigin: 'center center'
    };

    const visibleParams = resolvedParams.filter(p => p.show);
    const hasComposition = displayOptions.composition && item.materialComposition && Object.keys(item.materialComposition).length > 0;

    const contentDensity = visibleParams.length * 2.0 + (hasComposition ? 8 : 0) + (item.name.length / 8);
    const { name: nameScale, attr: attrScale, price: priceScale } = getScales(contentDensity, config.paperSize);
    const qrDensityFactor = contentDensity < 5 ? 1.1 : (contentDensity < 8 ? 1.0 : 0.85);

    const currentW = config.isLandscape ? heightNum : widthNum;
    const currentH = config.isLandscape ? widthNum : heightNum;
    const useTwoColumns = (widthNum >= 120 && visibleParams.length >= 4) ||
        config.layoutStyle === 'side-by-side' ||
        (currentW > currentH && visibleParams.length >= 3);

    return (
        <div className="w-full md:flex-1 bg-[#929292] relative overflow-hidden h-auto min-h-[400px] md:h-auto md:min-h-[500px] border-t md:border-t-0 border-slate-200">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {!isMobile && (
                <div className="absolute top-8 left-8 right-8 flex justify-end items-start z-50 pointer-events-none">
                    <Button variant="ghost" size="icon" type="button" onClick={onClose} className="h-11 w-11 rounded-[var(--radius-inner)] bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 transition-all shadow-xl active:scale-95 group pointer-events-auto cursor-pointer">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </Button>
                </div>
            )}

            <div ref={setRefNode} className="absolute inset-0 flex items-center justify-center overflow-hidden p-6">
                <div id="label-preview-content" className="bg-white rounded-[var(--radius-inner)] shadow-2xl relative flex-shrink-0" style={previewStyle}>
                    <div className={cn("flex flex-col min-h-0", (config.layoutStyle === 'minimal' || config.alignment === 'center') ? "items-center text-center" : "items-start text-left")}>
                        {displayOptions.category && item.category?.name && config.layoutStyle !== 'minimal' && (
                            <div style={{ fontSize: `${7 * scale}px` }} className="font-bold text-slate-400 leading-none mb-0.5">
                                {item.category.name}
                            </div>
                        )}
                        <div style={{ fontSize: `${(config.layoutStyle === 'minimal' ? 14 : 14.5) * scale * nameScale}px` }} className="font-bold text-black leading-[1.05] break-words">
                            {item.name}
                        </div>
                        {displayOptions.logo && branding?.printLogoUrl && (
                            <div className="mt-1 mb-1 relative w-full" style={{ height: `${10 * scale}mm` }}>
                                <NextImage src={branding.printLogoUrl} alt="Logo" fill className="object-contain" style={{ objectPosition: config.alignment === 'center' ? 'center' : 'left' }} />
                            </div>
                        )}
                        {config.layoutStyle === 'minimal' && item.sizeCode && (
                            <div style={{ fontSize: `${12 * scale * attrScale}px` }} className="font-bold text-slate-900 mt-1 bg-slate-50 px-2 py-0.5 rounded-[var(--radius-inner)] border border-slate-200">
                                Размер: {getAttrLabel('size', item.sizeCode)}
                            </div>
                        )}
                        {displayOptions.article && item.sku && config.layoutStyle !== 'minimal' && (
                            <div style={{ fontSize: `${8 * scale}px` }} className="font-mono font-bold text-slate-500 mt-1">
                                APT: {item.sku}
                            </div>
                        )}
                    </div>

                    {config.layoutStyle !== 'minimal' && (
                        <div className="flex-1 min-h-0 overflow-hidden py-1 flex flex-col justify-center" style={{ alignItems: config.alignment === 'center' ? 'center' : 'flex-start' }}>
                            <div className={cn("grid gap-x-3 gap-y-0.5", useTwoColumns ? "grid-cols-2" : "grid-cols-1", config.alignment === 'center' ? "justify-items-center" : "justify-items-start")}>
                                {visibleParams.map((param) => (
                                    <div key={param.slug} style={{ fontSize: `${9 * scale * attrScale}px` }} className={cn("flex gap-1.5 font-bold text-slate-700 leading-tight", config.alignment === 'center' ? "justify-center text-center" : "justify-start text-left")}>
                                        <span className="text-slate-400 font-medium shrink-0">{param.label}:</span>
                                        <span className="break-words">{param.value}</span>
                                    </div>
                                ))}
                            </div>
                            {config.customText && (
                                <div style={{ fontSize: `${8 * scale * attrScale}px` }} className={cn("font-bold text-black border-t border-slate-200 mt-1 w-full break-words", config.alignment === 'center' ? "text-center" : "text-left")}>
                                    {config.customText}
                                </div>
                            )}
                        </div>
                    )}

                    <div className={cn("pt-1.5 border-t border-slate-200 flex gap-2 shrink-0", (config.layoutStyle === 'side-by-side' || config.layoutStyle === 'inline' || heightNum <= 60) ? "flex-row justify-between items-end w-full px-1" : "flex-col items-center", config.layoutStyle === 'minimal' && "flex-1 justify-center items-center border-none pt-2")}>
                        <div className="flex flex-col gap-0.5 items-start">
                            {displayOptions.sellingPrice && item.sellingPrice !== null && (
                                <div style={{ fontSize: `${16 * scale * priceScale}px` }} className="font-black text-black leading-none whitespace-nowrap">
                                    {new Intl.NumberFormat('ru-RU').format(Number(item.sellingPrice))} <span style={{ fontSize: `${9 * scale * priceScale}px` }} className="font-bold text-slate-400">{currencySymbol}</span>
                                </div>
                            )}
                        </div>
                        {(displayOptions.barcode || config.layoutStyle === 'minimal') && (
                            <QRCodeSVG value={item.sku || item.id} size={Math.round(32 * qrDensityFactor)} level="M" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
