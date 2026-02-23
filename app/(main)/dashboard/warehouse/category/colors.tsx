export const COLORS = [
    { name: "primary", class: "bg-primary" },
    { name: "rose", class: "bg-rose-500" },
    { name: "emerald", class: "bg-emerald-500" },
    { name: "amber", class: "bg-amber-400" },
    { name: "lime", class: "bg-lime-500" },
    { name: "blue", class: "bg-blue-600" },
    { name: "slate", class: "bg-slate-500" },
    { name: "orange", class: "bg-orange-500" },
    { name: "sky", class: "bg-sky-500" },
    { name: "fuchsia", class: "bg-fuchsia-500" },
];

export const getHexColor = (color: string | null | undefined): string => {
    if (!color) return "#64748b"; // slate-500 default

    // If it's already a hex
    if (color.startsWith("#")) return color;

    // Map of predefined names to hex (matching our tailwind config/spirit)
    const colorMap: Record<string, string> = {
        primary: "#7c3aed",
        blue: "#3b82f6",
        emerald: "#10b981",
        amber: "#f59e0b",
        rose: "#f43f5e",
        purple: "#a855f7",
        fuchsia: "#e879f9",
        orange: "#fb923c",
        lime: "#a3e635",
        sky: "#38bdf8",
        cyan: "#22d3ee",
        slate: "#64748b",
        red: "#ef4444",
    };

    return colorMap[color] || "#64748b";
};

export const CLOTHING_COLORS = [
    { name: "Белый", code: "WHT", hex: "#FFFFFF" },
    { name: "Черный", code: "BLK", hex: "#000000" },
    { name: "Молочный", code: "MILK", hex: "#F5F5DC" },
    { name: "Шоколад", code: "CHOC", hex: "#7B3F00" },
    { name: "Графит", code: "GRAF", hex: "#383838" },
    { name: "Баблгам", code: "BUB", hex: "#FFC1CC" },
];
