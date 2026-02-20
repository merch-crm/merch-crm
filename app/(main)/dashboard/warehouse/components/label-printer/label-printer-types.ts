import { InventoryItem, AttributeType, InventoryAttribute, BrandingSettings } from "../../types";

export interface ResolvedParam {
    label: string;
    slug: string;
    code: string | number | boolean | null | undefined;
    show: boolean;
    value: string;
}

export type PaperSize = '58x40' | '58x60' | '75x120' | 'a4' | 'custom';
export type LayoutStyle = 'standard' | 'side-by-side' | 'inline' | 'minimal';

export interface PrinterConfig {
    paperSize: PaperSize;
    customWidth: number;
    customHeight: number;
    alignment: 'center' | 'left';
    layoutStyle: LayoutStyle;
    isLandscape: boolean;
    quantity: number;
    customText: string;
}

export interface DisplayOptions {
    article: boolean;
    costPrice: boolean;
    sellingPrice: boolean;
    barcode: boolean;
    composition: boolean;
    brand: boolean;
    size: boolean;
    material: boolean;
    color: boolean;
    quality: boolean;
    category: boolean;
    logo: boolean;
    extra: Record<string, boolean>;
}

export interface LabelPrinterProps {
    item: InventoryItem;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
}
