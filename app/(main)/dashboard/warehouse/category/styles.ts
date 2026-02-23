import { getHexColor } from "./colors";

/**
 * Lightens/Darkens a hex color
 */
export const adjustHexOpacity = (hex: string, opacity: number): string => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Generates a gradient from a base hex color
 */
export const getDynamicGradient = (color: string | null | undefined) => {
    const hex = getHexColor(color);
    return {
        background: `linear-gradient(135deg, ${hex} 0%, ${adjustHexOpacity(hex, 0.8)} 100%)`,
        boxShadow: `0 10px 25px -5px ${adjustHexOpacity(hex, 0.3)}`
    };
};

export const getColorStyles = (color: string | null | undefined) => {
    const hex = getHexColor(color);

    if (color && !color.startsWith("#")) {
        const c = color;
        const styles: Record<string, string> = {
            "slate": "bg-slate-50 border border-slate-200 text-slate-600",
            "red": "bg-rose-50 border border-rose-100 text-rose-500",
            "orange": "bg-orange-50 border border-orange-100 text-orange-500",
            "amber": "bg-amber-50 border border-amber-100 text-amber-500",
            "yellow": "bg-yellow-50 border border-yellow-100 text-yellow-500",
            "lime": "bg-lime-50 border border-lime-100 text-lime-600",
            "green": "bg-emerald-50 border border-emerald-100 text-emerald-500",
            "emerald": "bg-emerald-50 border border-emerald-100 text-emerald-500",
            "teal": "bg-teal-50 border border-teal-100 text-teal-600",
            "cyan": "bg-cyan-50 border border-cyan-100 text-cyan-500",
            "sky": "bg-sky-50 border border-sky-100 text-sky-500",
            "blue": "bg-blue-50 border border-blue-100 text-blue-500",
            "primary": "bg-primary/5 border border-primary/10 text-primary",
            "indigo": "bg-primary/5 border border-primary/10 text-primary",
            "violet": "bg-violet-50 border border-violet-100 text-violet-500",
            "purple": "bg-purple-50 border border-purple-100 text-purple-500",
            "fuchsia": "bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-500",
            "pink": "bg-pink-50 border border-pink-100 text-pink-500",
            "rose": "bg-rose-50 border border-rose-100 text-rose-500",
        };
        if (styles[c]) return { className: styles[c], style: {} };
    }

    // Dynamic fallback for custom hex
    return {
        className: "border",
        style: {
            backgroundColor: adjustHexOpacity(hex, 0.05),
            borderColor: adjustHexOpacity(hex, 0.1),
            color: hex
        }
    };
};

/**
 * Returns dynamic styles for category cards based on hex color.
 */
export const getCategoryCardStyles = (color: string | null | undefined) => {
    const hex = getHexColor(color);
    return {
        glow: {
            backgroundColor: hex,
            opacity: 0.4
        },
        gradient: {
            backgroundImage: `linear-gradient(to bottom, ${adjustHexOpacity(hex, 0.25)} 0%, transparent 100%)`
        },
        icon: {
            background: `linear-gradient(135deg, ${hex} 0%, ${adjustHexOpacity(hex, 0.8)} 100%)`,
            boxShadow: `0 8px 16px -4px ${adjustHexOpacity(hex, 0.3)}`
        }
    };
};

/**
 * @deprecated Use getDynamicGradient or getCategoryCardStyles for hex support.
 */
export const getGradientStyles = (color: string | null | undefined) => {
    const c = color || "slate";
    const styles: Record<string, string> = {
        primary: "from-[#5d00ff] to-[#8b4aff] shadow-indigo-500/25",
        blue: "from-blue-500 to-indigo-500 shadow-blue-500/25",
        emerald: "from-emerald-500 to-teal-500 shadow-emerald-500/25",
        amber: "from-amber-500 to-orange-500 shadow-orange-500/25",
        rose: "from-rose-500 to-pink-500 shadow-rose-500/25",
        purple: "from-purple-500 to-violet-500 shadow-purple-500/25",
        fuchsia: "from-fuchsia-500 to-purple-500 shadow-fuchsia-500/25",
        orange: "from-orange-500 to-red-500 shadow-orange-500/25",
        lime: "from-lime-500 to-green-500 shadow-lime-500/25",
        sky: "from-sky-500 to-blue-500 shadow-sky-500/25",
        cyan: "from-cyan-500 to-sky-500 shadow-cyan-500/25",
        slate: "from-slate-500 to-slate-700 shadow-slate-500/25",
    };
    return styles[c] || styles["slate"];
};
