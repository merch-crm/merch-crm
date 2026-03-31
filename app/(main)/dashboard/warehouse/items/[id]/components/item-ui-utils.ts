import React from "react";
import {
    Sparkles,
    Droplets,
    Search,
    Component,
    Globe,
    Waves,
    Weight,
    Package,
    Wrench,
    Maximize,
    Tag,
    Paperclip,
    Palette,
    Box,
    Hash,
    Layers,
} from "lucide-react";

export const getColorHex = (label: string) => {
    const colors: Record<string, string> = {
        "шоколад": "#3E2A24", "черный": "#020617", "белый": "#FFFFFF", "красный": "#E11D48", "синий": "#2563EB",
        "зеленый": "#16A34A", "желтый": "#EAB308", "серый": "#64748B", "розовый": "#DB2777", "оранжевый": "#EA580C",
        "фиолетовый": "#9333EA", "бежевый": "#D6D3D1", "хаки": "#454B1B", "бордовый": "#7F1D1D", "мята": "#4ADE80",
        "голубой": "#38BDF8", "песочный": "#C2B280", "оливка": "#808000", "горчица": "#EAB308", "графит": "#334155",
        "антрацит": "#1E293B", "бирюза": "#0D9488", "индиго": "#4F46E5", "баблгам": "#FF69B4", "молочный": "#FFFAF0",
        "кремовый": "#FFFDD0", "слоновая": "#FFFFF0", "коричневый": "#8B4513", "марсала": "#955251", "коралл": "#FF7F50",
        "лаванда": "#E6E6FA", "сирень": "#C8A2C8", "терракот": "#E2725B", "пудра": "#F5E6E3", "капучино": "#A67B5B",
        "карамель": "#FFD59A", "персик": "#FFCBA4", "малина": "#E30B5C", "вишня": "#DE3163", "изумруд": "#50C878",
        "морская волна": "#008B8B", "небесный": "#87CEEB", "сапфир": "#0F52BA", "лимон": "#FFF44F", "мокко": "#4A3728",
    };
    const lowerLabel = label.toLowerCase();
    for (const [key, hex] of Object.entries(colors)) {
        if (lowerLabel.includes(key)) return hex;
    }
    return null;
};

export const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
};

export const getParamConfig = (slug: string, hexColor?: string | null, name?: string, dataType?: string): { icon: React.ElementType, customHex?: string } => {
    const DATA_TYPE_ICONS: Record<string, React.ElementType> = {
        text: Component, unit: Paperclip, color: Palette, dimensions: Box, quantity: Hash,
        composition: Component, material: Layers, size: Maximize, brand: Tag,
        country: Globe, density: Waves, weight: Weight, volume: Droplets,
        package: Package, consumable: Wrench,
    };

    let icon: React.ElementType | undefined;

    // 1. Поиск по dataType (приоритет)
    if (dataType && DATA_TYPE_ICONS[dataType]) {
        icon = DATA_TYPE_ICONS[dataType];
    }

    // 2. Поиск по slug (fallback)
    if (!icon) {
        const configs: Record<string, React.ElementType> = {
            quality: Sparkles, brand: Tag, material: Layers, size: Maximize,
            color: Palette, composition: Component, country: Globe,
            density: Waves, weight: Weight, volume: Droplets,
            package: Package, consumable: Wrench,
        };
        icon = configs[slug];
    }

    // 3. Поиск по имени (fallback)
    if (!icon && name) {
        const lowerName = name.toLowerCase().trim();
        if (lowerName.includes("бренд")) icon = Tag;
        else if (lowerName.includes("качество")) icon = Sparkles;
        else if (lowerName.includes("материал") || lowerName.includes("состав") || lowerName.includes("ткань")) icon = Layers;
        else if (lowerName.includes("размер") || lowerName.includes("габарит")) icon = Maximize;
        else if (lowerName.includes("цвет") || lowerName.includes("оттенок")) icon = Palette;
        else if (lowerName.includes("страна") || lowerName.includes("производ")) icon = Globe;
        else if (lowerName.includes("плотность")) icon = Waves;
        else if (lowerName.includes("вес") || lowerName.includes("масса")) icon = Weight;
        else if (lowerName.includes("объем") || lowerName.includes("вместимость")) icon = Droplets;
        else if (lowerName.includes("упаковка")) icon = Package;
        else if (lowerName.includes("пол") || lowerName.includes("гендер")) icon = Component;
    }

    icon = icon || Search;

    if ((slug === 'color' || dataType === 'color' || (name && name.toLowerCase().includes('цвет'))) && hexColor) {
        return { icon, customHex: hexColor };
    }

    return { icon };
};
