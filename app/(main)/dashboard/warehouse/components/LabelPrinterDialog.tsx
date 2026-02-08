"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect } from "react";
import { InventoryItem, AttributeType, InventoryAttribute } from "../types";
import { Printer, X, AlignLeft, AlignCenter, RotateCw, Download, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useBranding } from "@/components/branding-provider";

interface LabelPrinterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
}

type PaperSize = '58x40' | '58x60' | '75x120' | 'a4' | 'custom';
type LayoutStyle = 'standard' | 'side-by-side' | 'inline' | 'minimal';


export function LabelPrinterDialog({ isOpen, onClose, item, attributeTypes, allAttributes }: LabelPrinterDialogProps) {
    const isMobile = useMediaQuery("(max-width: 1100px)");

    // Settings State
    const [paperSize, setPaperSize] = useState<PaperSize>('58x40');

    // Custom Size State
    const [customWidth, setCustomWidth] = useState(100);
    const [customHeight, setCustomHeight] = useState(100);

    const [showArticle, setShowArticle] = useState(true);
    const [showCostPrice, setShowCostPrice] = useState(false);
    const [showSellingPrice, setShowSellingPrice] = useState(true);
    const [showBarcode, setShowBarcode] = useState(true); // Will render QR/Barcode
    const [showComposition, setShowComposition] = useState(true);

    // New Characteristics Toggles
    const [showBrand, setShowBrand] = useState(false);
    const [showSize, setShowSize] = useState(true);
    const [showMaterial, setShowMaterial] = useState(false);
    const [showColor, setShowColor] = useState(true);
    const [showQuality, setShowQuality] = useState(false);
    const [showCategory, setShowCategory] = useState(false);
    const [showLogo, setShowLogo] = useState(false);
    const [extraAttributesToggles, setExtraAttributesToggles] = useState<Record<string, boolean>>({});
    const branding = useBranding();
    const { currencySymbol } = branding;
    const [alignment, setAlignment] = useState<'center' | 'left'>('center');
    const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('side-by-side');
    const [quantity, setQuantity] = useState(1);
    const [customText, setCustomText] = useState("");
    const [isLandscape, setIsLandscape] = useState(false);

    // Resolve Attributes Logic
    const getAttrLabel = React.useCallback((typeSlug: string, value: string | number | null | undefined): string => {
        if (!value) return "";
        const attr = allAttributes.find(a => a.type === typeSlug && a.value === value);
        return attr ? attr.name : String(value);
    }, [allAttributes]);

    const resolvedParams = React.useMemo(() => {
        if (!item) return [];

        const skuTechnicalSlugs = ["quality", "brand", "material", "size", "color"];

        const coreParams = [
            { label: "Бренд", slug: "brand", code: item.brandCode, show: showBrand },
            { label: "Качество", slug: "quality", code: item.qualityCode, show: showQuality },
            { label: "Материал", slug: "material", code: item.materialCode, show: showMaterial },
            { label: "Размер", slug: "size", code: item.sizeCode, show: showSize },
            { label: "Цвет", slug: "color", slugType: "color", code: item.attributeCode, show: showColor },
        ].filter(p => p.code);

        // Dynamic extra attributes (those not in core)
        const dynamicEntries = Object.entries(item.attributes || {}).filter(([key, val]) =>
            val !== undefined && val !== "" && val !== null && typeof val !== 'object' && key !== 'thumbnailSettings'
        );

        const extraParams = dynamicEntries.filter(([key]) => {
            if (skuTechnicalSlugs.includes(key)) return false;
            const type = attributeTypes.find(t => t.slug === key || t.name === key);
            if (type && skuTechnicalSlugs.includes(type.slug)) return false;
            return true;
        }).map(([slug, value]) => ({
            label: attributeTypes.find(t => t.slug === slug)?.name || slug,
            slug,
            code: value,
            show: extraAttributesToggles[slug] ?? true
        }));

        return [...coreParams, ...extraParams]
            .map(p => ({
                ...p,
                value: getAttrLabel(p.slug, p.code as string | number | null)
            }))
            .filter(p => p.value);
    }, [item, showBrand, showQuality, showMaterial, showSize, showColor, attributeTypes, extraAttributesToggles, getAttrLabel]);

    // Dynamic Preview Sizing
    const [refNode, setRefNode] = useState<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!refNode) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                requestAnimationFrame(() => {
                    setContainerSize({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height
                    });
                });
            }
        });

        observer.observe(refNode);

        return () => observer.disconnect();
    }, [refNode]);

    // Initialize quantity to 1
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (isOpen !== prevIsOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setQuantity(1);
        }
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const styles = `
            @page {
                size: ${getPrintSize(paperSize, isLandscape)};
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .label-page {
                width: 100%;
                height: 100vh;
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
            }
            .label-container {
                width: ${isLandscape ? getSizeDimensions(paperSize).height : getSizeDimensions(paperSize).width};
                height: ${isLandscape ? getSizeDimensions(paperSize).width : getSizeDimensions(paperSize).height};
                page-break-inside: avoid;
                display: grid;
                grid-template-rows: ${layoutStyle === 'minimal' ? 'auto 1fr' : 'min-content 1fr min-content'};
                padding: 4mm;
                box-sizing: border-box;
                overflow: hidden;
                border: 1px dotted #eee;
            }
            @media print {
                .label-container {
                    border: none;
                }
            }
            * {
                color: black !important;
                border-color: black !important;
            }
        `;

        const content = document.getElementById('label-preview-content')?.innerHTML;

        let allContent = '';
        for (let i = 0; i < quantity; i++) {
            allContent += `<div class="label-container" style="text-align: ${alignment}">${content}</div>`;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Печать этикеток - ${item.name}</title>
                    <style>${styles}</style>
                </head>
                <body>
                    <div class="label-page">
                        ${allContent}
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getSizeDimensions = (size: PaperSize) => {
        switch (size) {
            case '58x40': return { width: '58mm', height: '40mm' };
            case '58x60': return { width: '58mm', height: '60mm' };
            case '75x120': return { width: '75mm', height: '120mm' };
            case 'a4': return { width: '210mm', height: '297mm' };
            case 'custom': return { width: `${customWidth}mm`, height: `${customHeight}mm` };
            default: return { width: '58mm', height: '40mm' };
        }
    };

    const getPrintSize = (size: PaperSize, landscape: boolean) => {
        if (size === 'a4') return 'A4';
        const dims = getSizeDimensions(size);
        return landscape ? `${dims.height} ${dims.width}` : `${dims.width} ${dims.height}`;
    };

    const dims = getSizeDimensions(paperSize);
    const widthNum = parseInt(dims.width);
    const heightNum = parseInt(dims.height);

    const getPreviewScale = () => {
        if (containerSize.width === 0 || containerSize.height === 0) return 0.5;

        const w = isLandscape ? heightNum : widthNum;
        const h = isLandscape ? widthNum : heightNum;
        const pxW = w * 3.78;
        const pxH = h * 3.78;

        const padding = isMobile ? 32 : 120;
        const availableW = containerSize.width - padding;
        const availableH = containerSize.height - padding;

        return Math.min(availableW / pxW, availableH / pxH);
    };

    const previewScale = getPreviewScale();

    const getBaseScale = (size: PaperSize) => {
        switch (size) {
            case '58x40': return 1.0;
            case '58x60': return 1.4;
            case '75x120': return 2.4;
            case 'a4': return 5.5;
            default: return 1.0;
        }
    };
    const scale = getBaseScale(paperSize);

    const previewStyle = {
        width: isLandscape ? `${heightNum}mm` : `${widthNum}mm`,
        height: isLandscape ? `${widthNum}mm` : `${heightNum}mm`,
        backgroundColor: 'white',
        color: 'black',
        display: 'grid',
        gridTemplateRows: layoutStyle === 'minimal' ? 'auto 1fr' : 'min-content 1fr min-content',
        rowGap: `${1 * scale}mm`,
        padding: paperSize === 'a4' ? '12mm' : (paperSize === '75x120' ? '6mm' : '4mm'),
        overflow: 'hidden' as const,
        textAlign: alignment as React.CSSProperties['textAlign'],
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box' as const,
        transform: `scale(${previewScale})`,
        transformOrigin: 'center center'
    };

    const visibleParams = resolvedParams.filter(p => p.show);
    const hasComposition = showComposition && item.materialComposition && Object.keys(item.materialComposition).length > 0;

    const contentDensity =
        visibleParams.length * 2.0 +
        (hasComposition ? 8 : 0) +
        (item.name.length / 8) +
        (customText ? 5 : 0) +
        (showCostPrice ? 2 : 0) +
        (showSellingPrice ? 2 : 0) +
        (showLogo ? 4 : 0) +
        (showArticle ? 2 : 0) +
        (showCategory ? 2 : 0);

    const getScales = (density: number, size: PaperSize) => {
        if (density > 28) return { name: 0.4, attr: 0.35, price: 0.6 };
        if (density > 22) return { name: 0.5, attr: 0.45, price: 0.7 };
        if (density > 16) return { name: 0.65, attr: 0.6, price: 0.8 };
        if (density > 10) return { name: 0.8, attr: 0.75, price: 0.9 };
        if (density > 8) return { name: 1.05, attr: 1.0, price: 1.05 };
        const isVertical = size === '58x60' || size === '75x120';
        if (density < 4) return { name: isVertical ? 2.4 : 2.0, attr: isVertical ? 2.2 : 1.9, price: 2.0 };
        if (density < 7) return { name: isVertical ? 1.8 : 1.6, attr: isVertical ? 1.6 : 1.45, price: 1.6 };
        return { name: 1.4, attr: 1.3, price: 1.4 };
    };

    const { name: nameScale, attr: attrScale, price: priceScale } = getScales(contentDensity, paperSize);
    const globalScaleFactor = contentDensity > 25 ? 0.8 : 1;
    const finalNameScale = nameScale * globalScaleFactor;
    const finalAttrScale = attrScale * globalScaleFactor;
    const finalPriceScale = priceScale * globalScaleFactor;
    const qrDensityFactor = contentDensity < 5 ? 1.1 : (contentDensity < 8 ? 1.0 : 0.85);

    const currentW = isLandscape ? heightNum : widthNum;
    const currentH = isLandscape ? widthNum : heightNum;
    const useTwoColumns = (widthNum >= 120 && visibleParams.length >= 4) ||
        layoutStyle === 'side-by-side' ||
        (currentW > currentH && visibleParams.length >= 3);

    const ActionFooter = (
        <div className="flex-none px-6 pt-5 pb-6 bg-white border-t border-slate-200 z-50 space-y-4 shadow-[0_-12px_30px_-15px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-900 ml-1">Тираж</label>
                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-[var(--radius-inner)]">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-[var(--radius-inner)] bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-900 shadow-sm transition-all active:scale-90">
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-10 bg-transparent text-center font-bold text-base text-slate-900 outline-none"
                    />
                    <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-[var(--radius-inner)] bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-900 shadow-sm transition-all active:scale-90">
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
            <div className="flex gap-3 w-full">
                <button className="flex-1 h-11 rounded-[var(--radius-inner)] bg-white border-2 border-slate-200 text-slate-900 flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group shadow-sm">
                    <Download className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
                <button
                    onClick={handlePrint}
                    className="flex-1 h-11 bg-slate-900 hover:bg-black text-white rounded-[var(--radius-inner)] font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] group"
                >
                    <Printer className="w-4 h-4 transition-transform" />
                    Печать
                </button>
            </div>
        </div>
    );

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Печать"
            showVisualTitle={false}
            hideClose={true}
            footer={isMobile ? ActionFooter : undefined}
            desktopBreakpoint={1280}
            className="sm:max-w-[1240px] md:h-auto"
        >
            <div className="flex flex-col md:flex-row flex-1 h-[85vh] md:h-auto md:max-h-[80vh] overflow-y-auto md:overflow-hidden">
                {/* LEFT PANEL: Settings */}
                <div className="w-full md:w-[380px] lg:w-[420px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-auto md:h-auto z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] md:overflow-hidden shrink-0">
                    {/* Header Desktop only */}
                    {!isMobile && (
                        <div className="flex-none px-6 py-5 border-b border-slate-200 bg-white relative z-10">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center text-primary">
                                    <Printer className="w-5 h-5" />
                                </div>
                                Печать
                            </h2>
                        </div>
                    )}

                    {/* Scrollable Settings */}
                    <div className="md:flex-1 md:min-h-0 md:overflow-y-auto px-6 py-6 space-y-5 md:custom-scrollbar relative">
                        {/* Paper Size */}
                        <div className="space-y-2.5">
                            <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Размер этикетки</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['58x40', '58x60', '75x120', 'a4', 'custom'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setPaperSize(size as PaperSize)}
                                        className={cn(
                                            "w-full h-11 rounded-[var(--radius-inner)] text-xs font-bold border-2 transition-all duration-200 flex items-center justify-center leading-none",
                                            paperSize === size
                                                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                                                : "bg-white text-slate-500 border-slate-200 hover:border-slate-200 hover:bg-slate-50"
                                        )}
                                    >
                                        {size === 'custom' ? 'Свой' : size.replace('x', ' × ')}
                                    </button>
                                ))}
                            </div>

                            {paperSize === 'custom' && (
                                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(Number(e.target.value))}
                                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border-2 border-transparent rounded-[var(--radius-inner)] text-sm font-bold focus:outline-none focus:border-primary/20 focus:bg-white transition-all outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MM</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(Number(e.target.value))}
                                            className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border-2 border-transparent rounded-[var(--radius-inner)] text-sm font-bold focus:outline-none focus:border-primary/20 focus:bg-white transition-all outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MM</span>
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
                                    <button
                                        key={style.id}
                                        onClick={() => setLayoutStyle(style.id as LayoutStyle)}
                                        className={cn(
                                            "w-full h-11 rounded-[var(--radius-inner)] border-2 font-bold text-xs transition-all flex items-center justify-center",
                                            layoutStyle === style.id ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-900/10" : "bg-white border-slate-200 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        {style.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Unified Characteristics Toggles */}
                        <div className={cn("space-y-2.5 transition-opacity", layoutStyle === 'minimal' && "opacity-40 pointer-events-none")}>
                            <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Характеристики</label>
                            <div className="-mx-2 grid grid-cols-2 gap-x-1 gap-y-0.5">
                                <ToggleItem label="Артикул товара" checked={showArticle} onChange={setShowArticle} compact />
                                <ToggleItem label="Цена с/с" checked={showCostPrice} onChange={setShowCostPrice} compact />
                                <ToggleItem label="Продажная цена" checked={showSellingPrice} onChange={setShowSellingPrice} compact />
                                <ToggleItem label="Штрихкод / QR-код" checked={showBarcode} onChange={setShowBarcode} compact />
                                <ToggleItem label="Состав материала" checked={showComposition} onChange={setShowComposition} compact />
                                {item.brandCode && <ToggleItem label="Бренд" checked={showBrand} onChange={setShowBrand} compact />}
                                {item.qualityCode && <ToggleItem label="Качество" checked={showQuality} onChange={setShowQuality} compact />}
                                {item.materialCode && <ToggleItem label="Материал" checked={showMaterial} onChange={setShowMaterial} compact />}
                                {item.sizeCode && <ToggleItem label="Размер" checked={showSize} onChange={setShowSize} compact />}
                                {item.attributeCode && <ToggleItem label="Цвет" checked={showColor} onChange={setShowColor} compact />}

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

                                <ToggleItem label="Категория" checked={showCategory} onChange={setShowCategory} compact />
                                {branding?.printLogoUrl && <ToggleItem label="Логотип" checked={showLogo} onChange={setShowLogo} compact />}
                            </div>
                        </div>

                        {/* Custom Text */}
                        <div className={cn("space-y-2.5 transition-opacity", layoutStyle === 'minimal' && "opacity-40 pointer-events-none")}>
                            <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Дополнительная строка</label>
                            <input
                                type="text"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder="Например: Сделано в России"
                                disabled={layoutStyle === 'minimal'}
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-[var(--radius-inner)] text-sm font-bold focus:outline-none focus:border-primary/20 focus:bg-white transition-all outline-none"
                            />
                        </div>

                        {/* Layout Settings */}
                        <div className="space-y-2.5 pb-2">
                            <label className="text-sm font-bold text-slate-900 ml-1 mb-1.5 block">Расположение контента</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setIsLandscape(!isLandscape)}
                                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-[var(--radius-inner)] border-2 border-slate-900 bg-slate-900 text-white font-bold text-xs transition-all active:scale-[0.98]"
                                >
                                    <RotateCw className={cn("w-3.5 h-3.5 transition-transform duration-500", isLandscape && "rotate-90")} />
                                    {currentW > currentH ? 'Горизонтальный' : 'Вертикальный'}
                                </button>
                                <div className="flex bg-slate-50 p-1 rounded-[var(--radius-inner)] border-2 border-transparent">
                                    <button
                                        onClick={() => setAlignment('left')}
                                        className={cn(
                                            "flex-1 py-1.5 flex items-center justify-center rounded-[var(--radius-inner)] transition-all",
                                            alignment === 'left' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <AlignLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setAlignment('center')}
                                        className={cn(
                                            "flex-1 py-1.5 flex items-center justify-center rounded-[var(--radius-inner)] transition-all",
                                            alignment === 'center' ? "bg-white shadow-sm text-slate-900" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <AlignCenter className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isMobile && ActionFooter}
                </div>

                {/* RIGHT PANEL: PURE PREVIEW SECTION */}
                <div className="w-full md:flex-1 bg-[#929292] relative overflow-hidden h-auto min-h-[400px] md:h-auto md:min-h-[500px] border-t md:border-t-0 border-slate-200">
                    <div className="absolute inset-0 opacity-10 min-[768px]:opacity-10 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                    />

                    {!isMobile && (
                        <div className="absolute top-8 left-8 right-8 flex justify-end items-start z-50 pointer-events-none">
                            <button onClick={onClose} className="h-11 w-11 rounded-[var(--radius-inner)] bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 transition-all shadow-xl active:scale-95 group pointer-events-auto cursor-pointer">
                                <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    )}

                    <div
                        ref={setRefNode}
                        className="absolute inset-0 flex items-center justify-center overflow-hidden p-8"
                    >
                        <div
                            id="label-preview-content"
                            className="bg-white rounded-[var(--radius-inner)] shadow-2xl relative flex-shrink-0"
                            style={previewStyle}
                        >
                            {/* PREVIEW CONTENT */}
                            <div className={cn(
                                "flex flex-col min-h-0",
                                (layoutStyle === 'minimal' || alignment === 'center') ? "items-center text-center" : "items-start text-left"
                            )}>
                                {showCategory && item.category?.name && layoutStyle !== 'minimal' && (
                                    <div style={{ fontSize: `${7 * scale}px` }} className="font-bold text-slate-400 leading-none mb-0.5">
                                        {item.category.name}
                                    </div>
                                )}
                                <div style={{ fontSize: `${(layoutStyle === 'minimal' ? 14 : 14.5) * scale * finalNameScale}px`, hyphens: 'none' } as React.CSSProperties} className="font-bold text-black leading-[1.05] break-words">
                                    {item.name}
                                </div>
                                {showLogo && branding?.printLogoUrl && (
                                    <div className="mt-1 mb-1">
                                        <img
                                            src={branding.printLogoUrl}
                                            alt="Brand Logo"
                                            style={{ height: `${(paperSize === 'a4' ? 24 : 10) * scale}mm`, maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                                {layoutStyle === 'minimal' && item.sizeCode && (
                                    <div style={{ fontSize: `${12 * scale * finalAttrScale}px` }} className="font-bold text-slate-900 mt-1 bg-slate-50 px-2 py-0.5 rounded-[var(--radius-inner)] border border-slate-200">
                                        Размер: {getAttrLabel('size', item.sizeCode)}
                                    </div>
                                )}
                                {showArticle && item.sku && layoutStyle !== 'minimal' && (
                                    <div style={{ fontSize: `${8 * scale}px` }} className="font-mono font-bold text-slate-500 mt-1">
                                        APT: {item.sku}
                                    </div>
                                )}
                            </div>

                            {layoutStyle !== 'minimal' && (
                                <div className={cn(
                                    "flex-1 min-h-0 overflow-hidden py-1 flex flex-col justify-center",
                                    alignment === 'center' ? "items-center" : "items-start"
                                )}>
                                    {layoutStyle === 'inline' ? (
                                        <div
                                            style={{ fontSize: `${9 * scale * finalAttrScale}px` }}
                                            className={cn(
                                                "flex flex-wrap gap-x-2 gap-y-0.5 font-bold text-slate-700 leading-tight",
                                                alignment === 'center' ? "justify-center" : "justify-start"
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
                                            "grid gap-x-4 gap-y-0.5",
                                            useTwoColumns ? "grid-cols-2" : "grid-cols-1",
                                            alignment === 'center' ? "justify-items-center" : "justify-items-start"
                                        )}>
                                            {visibleParams.map((param) => (
                                                <div key={param.slug} style={{ fontSize: `${(currentH > currentW ? (paperSize === '75x120' ? 9 : 11) : 9) * scale * finalAttrScale}px` }} className={cn(
                                                    "flex gap-1.5 font-bold text-slate-700 leading-tight",
                                                    alignment === 'center' ? "justify-center text-center" : "justify-start text-left"
                                                )}>
                                                    {layoutStyle !== 'side-by-side' && <span className="text-slate-400 font-medium shrink-0">{param.label}:</span>}
                                                    <span className="break-words" style={{ hyphens: 'auto' } as React.CSSProperties}>{param.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {hasComposition && (
                                        <div
                                            style={{ fontSize: `${(currentH > currentW ? (paperSize === '75x120' ? 8.5 : 10) : 8.5) * scale * finalAttrScale}px`, paddingBottom: `${0.5 * scale}mm` }}
                                            className={cn(
                                                "font-bold text-slate-700 leading-tight border-b border-slate-200 mt-1 w-full break-words",
                                                alignment === 'center' ? "text-center" : "text-left"
                                            )}
                                        >
                                            <span className="text-slate-400 font-medium">Состав: </span>
                                            {Object.entries(item.materialComposition || {})
                                                .map(([name, percent]) => `${name} ${percent}%`)
                                                .join(', ')}
                                        </div>
                                    )}
                                    {customText && (
                                        <div
                                            style={{ fontSize: `${8 * scale * finalAttrScale}px`, paddingTop: `${0.5 * scale}mm` }}
                                            className={cn(
                                                "font-bold text-black border-t border-slate-200 mt-0.5 w-full break-words",
                                                alignment === 'center' ? "text-center" : "text-left"
                                            )}
                                        >
                                            {customText}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={cn(
                                "pt-1.5 border-t border-slate-200 flex gap-2 shrink-0",
                                (layoutStyle === 'side-by-side' || layoutStyle === 'inline' || heightNum <= 60 || paperSize === '75x120') ? "flex-row justify-between items-end w-full px-1" : "flex-col items-center",
                                layoutStyle === 'minimal' && "flex-1 justify-center items-center border-none pt-2"
                            )}>
                                <div className="flex flex-col gap-0.5 items-start">
                                    {showCostPrice && item.costPrice !== null && (
                                        <div style={{ fontSize: `${(paperSize === 'a4' || paperSize === '75x120' ? 14 : 10) * scale * finalPriceScale}px` }} className="font-bold text-slate-500 leading-none whitespace-nowrap">
                                            с/с: {new Intl.NumberFormat('ru-RU').format(Number(item.costPrice))} {currencySymbol}
                                        </div>
                                    )}
                                    {showSellingPrice && item.sellingPrice !== null && (
                                        <div style={{ fontSize: `${(paperSize === 'a4' || paperSize === '75x120' ? 24 : (currentH > currentW ? 19 : (paperSize === '58x60' ? 14 : 16))) * scale * finalPriceScale}px` }} className="font-black text-black leading-none whitespace-nowrap">
                                            {showCostPrice && <span className="text-[0.6em] font-bold text-slate-400 mr-1 uppercase">Прод:</span>}
                                            {new Intl.NumberFormat('ru-RU').format(Number(item.sellingPrice))} <span style={{ fontSize: `${(paperSize === 'a4' || paperSize === '75x120' ? 12 : (currentH > currentW ? 11 : 9)) * scale * finalPriceScale}px` }} className="font-bold text-slate-400">{currencySymbol}</span>
                                        </div>
                                    )}
                                </div>
                                {(showBarcode || layoutStyle === 'minimal') && (
                                    <QRCodeSVG
                                        value={item.sku || item.id}
                                        size={Math.round((
                                            layoutStyle === 'minimal'
                                                ? (
                                                    (isLandscape ? widthNum : heightNum) >= 110 ? 160 :
                                                        (isLandscape ? widthNum : heightNum) >= 80 ? 120 :
                                                            (isLandscape ? widthNum : heightNum) >= 55 ? 90 : 75
                                                )
                                                : (paperSize === 'a4' ? 160 : (paperSize === '75x120' ? 85 : (paperSize === '58x60' ? 40 : (paperSize === '58x40' ? ((layoutStyle === 'side-by-side' || layoutStyle === 'inline') ? (currentH > currentW ? 38 : 22) : (currentH > currentW ? 45 : 28)) : (currentH > currentW ? 45 : 32)))))
                                        ) * qrDensityFactor)}
                                        level="M"
                                        className="opacity-100"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-200 pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-900 flex items-center gap-2">
                            Масштаб: {Math.round(previewScale * 100)}%
                            <span className="w-1 h-3 bg-slate-200 rounded-full" />
                            {isLandscape ? getSizeDimensions(paperSize).height : getSizeDimensions(paperSize).width}
                            <span className="text-slate-400">×</span>
                            {isLandscape ? getSizeDimensions(paperSize).width : getSizeDimensions(paperSize).height}
                        </span>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
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
            <CustomSwitch checked={checked} onCheckedChange={onChange} small={compact} />
        </label>
    );
}

function CustomSwitch({ checked, onCheckedChange, small }: { checked: boolean; onCheckedChange: (v: boolean) => void; small?: boolean }) {
    return (
        <button
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "rounded-full transition-all duration-300 relative",
                checked ? "bg-emerald-500" : "bg-slate-200",
                small ? "w-8 h-5" : "w-10 h-6"
            )}
        >
            <div className={cn(
                "absolute bg-white rounded-full transition-all duration-300 shadow-sm",
                small ? "top-0.5 left-0.5 w-4 h-4" : "top-1 left-1 w-4 h-4",
                checked ? (small ? "translate-x-3" : "translate-x-4") : "translate-x-0"
            )} />
        </button>
    );
}
