"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InventoryItem, AttributeType, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";
import { useLabelPrinterLogic } from "./label-printer/hooks/useLabelPrinterLogic";
import { LabelPrinterSettings } from "./label-printer/label-printer-settings";
import { LabelPrinterPreview } from "./label-printer/label-printer-preview";

interface LabelPrinterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: InventoryItem;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
}

export function LabelPrinterDialog({ isOpen, onClose, item, attributeTypes, allAttributes }: LabelPrinterDialogProps) {
    const logic = useLabelPrinterLogic({ item, attributeTypes, allAttributes, isOpen });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden bg-white rounded-3xl flex flex-col [&>button]:hidden">
                <DialogTitle className="sr-only">Печать этикеток</DialogTitle>
                <DialogDescription className="sr-only">Настройка параметров печати этикеток для товара</DialogDescription>

                <div className="flex flex-1 min-h-0 h-full">
                    {/* LEFT PANEL: Settings & ACTIONS */}
                    <LabelPrinterSettings
                        settings={{
                            dimensions: logic.dimensions,
                            content: logic.contentSettings,
                            ui: logic.uiState
                        }}
                        setters={{
                            setDimensions: logic.setDimensions,
                            setContentSettings: logic.setContentSettings,
                            setUiState: logic.setUiState,
                            setExtraAttributesToggles: logic.setExtraAttributesToggles
                        }}
                        data={{
                            resolvedParams: logic.resolvedParams,
                            extraAttributesToggles: logic.extraAttributesToggles,
                            currentW: logic.currentW,
                            currentH: logic.currentH
                        }}
                        availability={{
                            hasBrand: !!item.brandCode,
                            hasQuality: !!item.qualityCode,
                            hasMaterial: !!item.materialCode,
                            hasSize: !!item.sizeCode,
                            hasAttribute: !!item.attributeCode
                        }}
                        onPrint={logic.handlePrint}
                    />

                    {/* RIGHT PANEL: PURE PREVIEW SECTION */}
                    <LabelPrinterPreview
                        item={item}
                        settings={{
                            ui: logic.uiState,
                            content: logic.contentSettings,
                            dimensions: logic.dimensions
                        }}
                        params={{
                            visible: logic.visibleParams,
                            hasComposition: logic.hasComposition
                        }}
                        scales={{
                            base: logic.scale,
                            name: logic.finalNameScale,
                            attr: logic.finalAttrScale,
                            price: logic.finalPriceScale
                        }}
                        layout={{
                            qrDensity: logic.qrDensityFactor,
                            useTwoColumns: logic.useTwoColumns,
                            previewStyle: logic.previewStyle,
                            previewScale: logic.previewScale,
                            currentH: logic.currentH,
                            currentW: logic.currentW,
                            widthNum: logic.widthNum,
                            heightNum: logic.heightNum
                        }}
                        actions={{
                            setRefNode: logic.setRefNode,
                            getSizeDimensions: logic.getSizeDimensions,
                            getAttrLabel: logic.getAttrLabel,
                            onClose: onClose
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
