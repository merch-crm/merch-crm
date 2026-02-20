"use client";
import React, { useState, useCallback, useMemo } from "react";
import { InventoryItem, AttributeType, InventoryAttribute } from "../types";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useBranding } from "@/components/branding-provider";
import { useToast } from "@/components/ui/toast";
import { Printer } from "lucide-react";
import { PrinterConfig, DisplayOptions } from "./label-printer/label-printer-types";
import { LabelPrinterSettings } from "./label-printer/LabelPrinterSettings";
import { LabelPrinterPreview } from "./label-printer/LabelPrinterPreview";
import { LabelPrinterActions } from "./label-printer/LabelPrinterActions";
import { getPrintSize, getSizeDimensions } from "./label-printer/label-printer-utils";

interface LabelPrinterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
}

export function LabelPrinterDialog({ isOpen, onClose, item, attributeTypes, allAttributes }: LabelPrinterDialogProps) {
    const isMobile = useMediaQuery("(max-width: 1100px)") ?? false;
    const branding = useBranding();
    const { toast } = useToast();

    const [config, setConfig] = useState<PrinterConfig>({
        paperSize: '58x40',
        customWidth: 100,
        customHeight: 100,
        alignment: 'center',
        layoutStyle: 'side-by-side',
        isLandscape: false,
        quantity: 1,
        customText: ""
    });

    const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
        article: true,
        costPrice: false,
        sellingPrice: true,
        barcode: true,
        composition: true,
        brand: false,
        size: true,
        material: false,
        color: true,
        quality: false,
        category: false,
        logo: false,
        extra: {}
    });

    const getAttrLabel = useCallback((typeSlug: string, value: string | number | boolean | null | undefined): string => {
        if (!value) return "";
        const attr = allAttributes.find(a => a.type === typeSlug && a.value === value);
        return attr ? attr.name : String(value);
    }, [allAttributes]);

    const resolvedParams = useMemo(() => {
        if (!item) return [];
        const skuTechnicalSlugs = ["quality", "brand", "material", "size", "color"];
        const coreParams = [
            { label: "Бренд", slug: "brand", code: item.brandCode, show: displayOptions.brand },
            { label: "Качество", slug: "quality", code: item.qualityCode, show: displayOptions.quality },
            { label: "Материал", slug: "material", code: item.materialCode, show: displayOptions.material },
            { label: "Размер", slug: "size", code: item.sizeCode, show: displayOptions.size },
            { label: "Цвет", slug: "color", code: item.attributeCode, show: displayOptions.color },
        ].filter(p => p.code);

        const extraParams = Object.entries(item.attributes || {})
            .filter(([key, val]) => val !== undefined && val !== "" && val !== null && typeof val !== 'object' && key !== 'thumbnailSettings' && !skuTechnicalSlugs.includes(key))
            .map(([slug, value]) => ({
                label: attributeTypes.find(t => t.slug === slug)?.name || slug,
                slug,
                code: value,
                show: displayOptions.extra[slug] ?? true
            }));

        return [...coreParams, ...extraParams]
            .map(p => ({ ...p, value: getAttrLabel(p.slug, p.code) }))
            .filter(p => p.value);
    }, [item, displayOptions, attributeTypes, getAttrLabel]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast("Браузер заблокировал всплывающее окно", "error");
            return;
        }

        const dims = getSizeDimensions(config.paperSize, config.customWidth, config.customHeight);
        const styles = `
            @page { size: ${getPrintSize(config.paperSize, config.isLandscape, config.customWidth, config.customHeight)}; margin: 0; }
            body { margin: 0; padding: 0; }
            .label-container { width: ${config.isLandscape ? dims.height : dims.width}; height: ${config.isLandscape ? dims.width : dims.height}; page-break-inside: avoid; display: flex; flex-direction: column; padding: 4mm; box-sizing: border-box; }
        `;

        const content = document.getElementById('label-preview-content')?.innerHTML;
        let allContent = '';
        for (let i = 0; i < config.quantity; i++) {
            allContent += `<div class="label-container" style="text-align: ${config.alignment}">${content}</div>`;
        }

        printWindow.document.write(`<html><head><style>${styles}</style></head><body>${allContent}<script>window.onload=()=>window.print()</script></body></html>`);
        printWindow.document.close();
    };

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Печать" showVisualTitle={false} hideClose={true} footer={isMobile ? <LabelPrinterActions config={config} setConfig={setConfig} handlePrint={handlePrint} /> : undefined} desktopBreakpoint={1280} className="sm:max-w-[1240px]">
            <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
                <div className="w-full md:w-[380px] lg:w-[420px] bg-white border-r border-slate-200 flex flex-col shrink-0">
                    {!isMobile && (
                        <div className="px-6 py-5 border-b border-slate-200 bg-white">
                            <div className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                <Printer className="w-5 h-5 text-primary" />
                                Печать
                            </div>
                        </div>
                    )}
                    <LabelPrinterSettings
                        config={config}
                        setConfig={setConfig}
                        displayOptions={displayOptions}
                        setDisplayOptions={setDisplayOptions}
                        item={item}
                        resolvedParams={resolvedParams}
                        branding={branding}
                    />
                    {!isMobile && <LabelPrinterActions config={config} setConfig={setConfig} handlePrint={handlePrint} />}
                </div>
                <LabelPrinterPreview
                    config={config}
                    displayOptions={displayOptions}
                    item={item}
                    resolvedParams={resolvedParams}
                    getAttrLabel={getAttrLabel}
                    branding={branding}
                    onClose={onClose}
                    isMobile={isMobile}
                />
            </div>
        </ResponsiveModal>
    );
}
