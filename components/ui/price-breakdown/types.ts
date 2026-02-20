import * as React from "react";

export type PriceLineType =
    | "base"           // Базовая стоимость
    | "blank"          // Бланк (товар)
    | "print"          // Нанесение
    | "embroidery"     // Вышивка
    | "engraving"      // Гравировка
    | "discount"       // Скидка
    | "markup"         // Наценка
    | "shipping"       // Доставка
    | "packaging"      // Упаковка
    | "service"        // Услуга
    | "subtotal"       // Промежуточный итог
    | "total"          // Итого
    | "custom";        // Кастомная строка

export interface PriceLine {
    id: string;
    type: PriceLineType;
    label: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
    isNegative?: boolean;
    icon?: React.ReactNode;
    details?: PriceLine[];
    highlighted?: boolean;
}

export interface PriceBreakdownProps {
    lines: PriceLine[];
    title?: string;
    currency?: string;
    showQuantity?: boolean;
    showUnitPrice?: boolean;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    className?: string;
}

export interface PriceRowProps {
    icon: React.ReactNode;
    colorClasses: { text: string; bg: string };
    label: string;
    description?: string;
    amount: number;
    currency: string;
    isNegative?: boolean;
    highlighted?: boolean;
    onClick?: () => void;
    hasDetails?: boolean;
    showDetails?: boolean;
    quantityInfo?: string;
}

export interface PriceLineItemProps {
    line: PriceLine;
    currency: string;
    showQuantity: boolean;
    showUnitPrice: boolean;
    nested?: boolean;
}

export interface PriceBreakdownCompactProps {
    lines: PriceLine[];
    currency?: string;
    className?: string;
}

export interface ProductPriceCalculatorProps {
    blankPrice: number;
    blankName?: string;
    quantity: number;
    printOptions?: Array<{
        id: string;
        name: string;
        pricePerUnit: number;
        setupPrice?: number;
        colors?: number;
        positions?: number;
    }>;
    discount?: { type: "percent" | "fixed"; value: number; label?: string };
    shipping?: number;
    currency?: string;
    onQuantityChange?: (quantity: number) => void;
    className?: string;
}

export interface PriceComparisonProps {
    quantities: number[];
    calculatePrice: (quantity: number) => number;
    currentQuantity?: number;
    onSelectQuantity?: (quantity: number) => void;
    currency?: string;
    className?: string;
}

export interface PrintDetailsProps {
    method: "screen" | "digital" | "embroidery" | "engraving" | "transfer" | "sublimation";
    colors?: number;
    positions?: number;
    size?: { width: number; height: number };
    pricePerUnit: number;
    setupPrice?: number;
    quantity: number;
    currency?: string;
    className?: string;
}
