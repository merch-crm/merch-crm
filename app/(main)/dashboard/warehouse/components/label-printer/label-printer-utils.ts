import { PaperSize } from "./label-printer-types";

export const getSizeDimensions = (size: PaperSize, customWidth: number, customHeight: number) => {
    switch (size) {
        case '58x40': return { width: '58mm', height: '40mm' };
        case '58x60': return { width: '58mm', height: '60mm' };
        case '75x120': return { width: '75mm', height: '120mm' };
        case 'a4': return { width: '210mm', height: '297mm' };
        case 'custom': return { width: `${customWidth}mm`, height: `${customHeight}mm` };
        default: return { width: '58mm', height: '40mm' };
    }
};

export const getPrintSize = (size: PaperSize, landscape: boolean, customWidth: number, customHeight: number) => {
    if (size === 'a4') return 'A4';
    const dims = getSizeDimensions(size, customWidth, customHeight);
    return landscape ? `${dims.height} ${dims.width}` : `${dims.width} ${dims.height}`;
};

export const getBaseScale = (size: PaperSize) => {
    switch (size) {
        case '58x40': return 1.0;
        case '58x60': return 1.4;
        case '75x120': return 2.4;
        case 'a4': return 5.5;
        default: return 1.0;
    }
};

export const getScales = (density: number, size: PaperSize) => {
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
