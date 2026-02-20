import React from "react";
import {
    Sparkles,
    BadgeCheck,
    Shirt,
    Layers,
    Ruler,
    Droplets,
    Search,
} from "lucide-react";

export const getColorHex = (label: string) => {
    const colors: Record<string, string> = {
        "шоколад": "#3E2A24",
        "черный": "#020617",
        "белый": "#FFFFFF",
        "красный": "#E11D48",
        "синий": "#2563EB",
        "зеленый": "#16A34A",
        "желтый": "#EAB308",
        "серый": "#64748B",
        "розовый": "#DB2777",
        "оранжевый": "#EA580C",
        "фиолетовый": "#9333EA",
        "бежевый": "#D6D3D1",
        "хаки": "#454B1B",
        "бордовый": "#7F1D1D",
        "мята": "#4ADE80",
        "голубой": "#38BDF8",
        "песочный": "#C2B280",
        "оливка": "#808000",
        "горчица": "#EAB308",
        "графит": "#334155",
        "антрацит": "#1E293B",
        "бирюза": "#0D9488",
        "индиго": "#4F46E5",
        "баблгам": "#FF69B4",
        "молочный": "#FFFAF0",
        "кремовый": "#FFFDD0",
        "слоновая": "#FFFFF0",
        "коричневый": "#8B4513",
        "марсала": "#955251",
        "коралл": "#FF7F50",
        "лаванда": "#E6E6FA",
        "сирень": "#C8A2C8",
        "терракот": "#E2725B",
        "пудра": "#F5E6E3",
        "капучино": "#A67B5B",
        "карамель": "#FFD59A",
        "персик": "#FFCBA4",
        "малина": "#E30B5C",
        "вишня": "#DE3163",
        "изумруд": "#50C878",
        "морская волна": "#008B8B",
        "небесный": "#87CEEB",
        "сапфир": "#0F52BA",
        "лимон": "#FFF44F",
        "мокко": "#4A3728",
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

export const getParamConfig = (slug: string, hexColor?: string | null): { icon: React.ElementType, customHex?: string } => {
    const configs: Record<string, { icon: React.ElementType }> = {
        "quality": { icon: Sparkles },
        "brand": { icon: BadgeCheck },
        "material": { icon: Shirt },
        "size": { icon: Ruler },
        "color": { icon: Droplets },
        "composition": { icon: Layers },
    };

    const config = configs[slug] || { icon: Search };

    if (slug === 'color' && hexColor) {
        return { ...config, customHex: hexColor };
    }

    return config;
};
