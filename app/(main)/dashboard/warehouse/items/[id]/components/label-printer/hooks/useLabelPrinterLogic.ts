import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/toast";
import { escapeHtml } from "@/lib/utils";
import { InventoryItem, AttributeType, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";

export type PaperSize = '58x40' | '58x60' | '75x120' | 'a4' | 'custom';
export type LayoutStyle = 'standard' | 'side-by-side' | 'inline' | 'minimal';

export interface LabelDimensions {
    paperSize: PaperSize;
    customWidth: number;
    customHeight: number;
    isLandscape: boolean;
}

export interface LabelContentSettings {
    showArticle: boolean;
    showPrice: boolean;
    showBarcode: boolean;
    showComposition: boolean;
    showBrand: boolean;
    showSize: boolean;
    showMaterial: boolean;
    showColor: boolean;
    showQuality: boolean;
    showCategory: boolean;
    customText: string;
}

export interface LabelUiState {
    alignment: 'center' | 'left';
    layoutStyle: LayoutStyle;
    quantity: number;
}

export interface ResolvedParam {
    label: string;
    slug: string;
    code: string | number | boolean | null | undefined;
    show: boolean;
    value: string;
}

export interface UseLabelPrinterLogicProps {
    item: InventoryItem;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    isOpen: boolean;
}

export function useLabelPrinterLogic({ item, attributeTypes, allAttributes, isOpen }: UseLabelPrinterLogicProps) {
    const { toast } = useToast();

    // =============== STATE ===============
    const [dimensions, setDimensions] = useState({
        paperSize: '58x40' as PaperSize,
        customWidth: 100,
        customHeight: 100,
        isLandscape: false
    });

    const [contentSettings, setContentSettings] = useState({
        showArticle: true,
        showPrice: true,
        showBarcode: true,
        showComposition: true,
        showBrand: false,
        showSize: true,
        showMaterial: false,
        showColor: true,
        showQuality: false,
        showCategory: false,
        customText: ""
    });

    const [extraAttributesToggles, setExtraAttributesToggles] = useState<Record<string, boolean>>({});

    const [uiState, setUiState] = useState({
        alignment: 'center' as 'center' | 'left',
        layoutStyle: 'side-by-side' as LayoutStyle,
        quantity: 1
    });

    // Dynamic Preview Sizing
    const [refNode, setRefNode] = useState<HTMLDivElement | null>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // =============== EFFECTS ===============
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

    useEffect(() => {
        if (isOpen) {
            setUiState(prev => ({ ...prev, quantity: 1 }));
        }
    }, [isOpen]);

    // =============== COMPUTATIONS ===============
    const getAttrLabel = useCallback((typeSlug: string, value: string | number | null | undefined): string => {
        if (!value) return "";
        const attr = allAttributes.find(a => a.type === typeSlug && a.value === value);
        return attr ? attr.name : String(value);
    }, [allAttributes]);

    const resolvedParams = useMemo(() => {
        if (!item) return [];
        const skuTechnicalSlugs = ["quality", "brand", "material", "size", "color"];

        const coreParams = [
            { label: "Бренд", slug: "brand", code: item.brandCode, show: contentSettings.showBrand },
            { label: "Качество", slug: "quality", code: item.qualityCode, show: contentSettings.showQuality },
            { label: "Материал", slug: "material", code: item.materialCode, show: contentSettings.showMaterial },
            { label: "Размер", slug: "size", code: item.sizeCode, show: contentSettings.showSize },
            { label: "Цвет", slug: "color", slugType: "color", code: item.attributeCode, show: contentSettings.showColor },
        ].filter(p => p.code);

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
    }, [item, contentSettings, attributeTypes, extraAttributesToggles, getAttrLabel]);

    const getSizeDimensions = useCallback((size: PaperSize) => {
        switch (size) {
            case '58x40': return { width: '58mm', height: '40mm' };
            case '58x60': return { width: '58mm', height: '60mm' };
            case '75x120': return { width: '75mm', height: '120mm' };
            case 'a4': return { width: '210mm', height: '297mm' };
            case 'custom': return { width: `${dimensions.customWidth}mm`, height: `${dimensions.customHeight}mm` };
            default: return { width: '58mm', height: '40mm' };
        }
    }, [dimensions.customWidth, dimensions.customHeight]);

    const getPrintSize = useCallback((size: PaperSize, landscape: boolean) => {
        if (size === 'a4') return 'A4';
        const dims = getSizeDimensions(size);
        return landscape ? `${dims.height} ${dims.width}` : `${dims.width} ${dims.height}`;
    }, [getSizeDimensions]);

    const labelDims = getSizeDimensions(dimensions.paperSize === 'custom' ? '58x40' : dimensions.paperSize);
    const widthNum = dimensions.paperSize === 'custom' ? dimensions.customWidth : parseInt(labelDims.width);
    const heightNum = dimensions.paperSize === 'custom' ? dimensions.customHeight : parseInt(labelDims.height);

    const currentW = dimensions.isLandscape ? heightNum : widthNum;
    const currentH = dimensions.isLandscape ? widthNum : heightNum;

    const visibleParams = resolvedParams.filter(p => p.show);
    const hasComposition = contentSettings.showComposition && item.materialComposition && Object.keys(item.materialComposition).length > 0;

    const contentDensity =
        visibleParams.length * 2.0 +
        (hasComposition ? 8 : 0) +
        (item.name ? item.name.length / 8 : 0) +
        (contentSettings.customText ? 5 : 0) +
        (contentSettings.showArticle ? 2 : 0) +
        (contentSettings.showCategory ? 2 : 0);

    const getScales = useCallback((density: number, size: PaperSize) => {
        if (density > 28) return { name: 0.4, attr: 0.35, price: 0.6 };
        if (density > 22) return { name: 0.5, attr: 0.45, price: 0.7 };
        if (density > 16) return { name: 0.65, attr: 0.6, price: 0.8 };
        if (density > 10) return { name: 0.8, attr: 0.75, price: 0.9 };

        if (density > 8) return { name: 1.05, attr: 1.0, price: 1.05 };

        const isVertical = size === '58x60' || size === '75x120';
        if (density < 4) return { name: isVertical ? 2.4 : 2.0, attr: isVertical ? 2.2 : 1.9, price: 2.0 };
        if (density < 7) return { name: isVertical ? 1.8 : 1.6, attr: isVertical ? 1.6 : 1.45, price: 1.6 };

        return { name: 1.4, attr: 1.3, price: 1.4 };
    }, []);

    const { name: nameScale, attr: attrScale, price: priceScale } = getScales(contentDensity, dimensions.paperSize);

    const globalScaleFactor = contentDensity > 25 ? 0.8 : 1;
    const finalNameScale = nameScale * globalScaleFactor;
    const finalAttrScale = attrScale * globalScaleFactor;
    const finalPriceScale = priceScale * globalScaleFactor;

    const qrDensityFactor = contentDensity < 5 ? 1.1 : (contentDensity < 8 ? 1.0 : 0.85);

    const useTwoColumns = (widthNum >= 120 && visibleParams.length >= 4) ||
        uiState.layoutStyle === 'side-by-side' ||
        (currentW > currentH && visibleParams.length >= 3);

    const getPreviewScale = useCallback(() => {
        if (containerSize.width === 0 || containerSize.height === 0) return 0.5;
        const w = dimensions.isLandscape ? heightNum : widthNum;
        const h = dimensions.isLandscape ? widthNum : heightNum;
        const pxW = w * 3.78;
        const pxH = h * 3.78;
        const padding = 120;
        const availableW = containerSize.width - padding;
        const availableH = containerSize.height - padding;
        return Math.min(availableW / pxW, availableH / pxH);
    }, [containerSize.width, containerSize.height, dimensions.isLandscape, heightNum, widthNum]);

    const previewScale = getPreviewScale();

    const getBaseScale = useCallback((size: PaperSize) => {
        switch (size) {
            case '58x40': return 1.0;
            case '58x60': return 1.4;
            case '75x120': return 2.4;
            case 'a4': return 5.5;
            default: return 1.0;
        }
    }, []);
    const scale = getBaseScale(dimensions.paperSize);

    const handlePrint = useCallback(() => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast("Браузер заблокировал всплывающее окно. Разрешите всплывающие окна для печати.", "error");
            return;
        }

        const styles = `
            @page {
                size: ${getPrintSize(dimensions.paperSize, dimensions.isLandscape)};
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
                width: ${dimensions.isLandscape ? getSizeDimensions(dimensions.paperSize).height : getSizeDimensions(dimensions.paperSize).width};
                height: ${dimensions.isLandscape ? getSizeDimensions(dimensions.paperSize).width : getSizeDimensions(dimensions.paperSize).height};
                page-break-inside: avoid;
                display: grid;
                grid-template-rows: ${uiState.layoutStyle === 'minimal' ? 'auto 1fr' : 'min-content 1fr min-content'};
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
        for (let i = 0; i < uiState.quantity; i++) {
            allContent += `<div class="label-container" style="text-align: ${uiState.alignment}">${content || ''}</div>`;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>Печать этикеток - ${escapeHtml(item.name || "")}</title>
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
    }, [dimensions.paperSize, dimensions.isLandscape, getPrintSize, getSizeDimensions, uiState.layoutStyle, uiState.alignment, uiState.quantity, item.name, toast]);

    const previewStyle = useMemo(() => ({
        width: dimensions.isLandscape ? `${heightNum}mm` : `${widthNum}mm`,
        height: dimensions.isLandscape ? `${widthNum}mm` : `${heightNum}mm`,
        backgroundColor: 'white',
        color: 'black',
        display: 'grid',
        gridTemplateRows: uiState.layoutStyle === 'minimal' ? 'auto 1fr' : 'min-content 1fr min-content',
        rowGap: `${1 * scale}mm`,
        padding: dimensions.paperSize === 'a4' ? '12mm' : (dimensions.paperSize === '75x120' ? '6mm' : '4mm'),
        overflow: 'hidden' as const,
        textAlign: uiState.alignment as React.CSSProperties['textAlign'],
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box' as const,
        transform: `scale(${previewScale})`,
        transformOrigin: 'center center'
    }), [dimensions.isLandscape, heightNum, widthNum, uiState.layoutStyle, scale, dimensions.paperSize, uiState.alignment, previewScale]);

    return {
        // State
        dimensions, setDimensions,
        contentSettings, setContentSettings,
        extraAttributesToggles, setExtraAttributesToggles,
        uiState, setUiState,

        // Refs
        setRefNode,

        // Computed
        resolvedParams,
        visibleParams,
        hasComposition,
        widthNum,
        heightNum,
        currentW,
        currentH,
        previewScale,
        scale,
        finalNameScale,
        finalAttrScale,
        finalPriceScale,
        qrDensityFactor,
        useTwoColumns,
        previewStyle,
        getSizeDimensions,
        getAttrLabel,

        // Actions
        handlePrint
    };
}
