
export const DEPARTMENT_COLORS = [
    { name: "Синий", value: "indigo", bg: "bg-primary/5", text: "text-primary", border: "border-primary/20", ring: "ring-primary", badge: "bg-primary/10", badgeText: "text-primary" },
    { name: "Фиолетовый", value: "purple", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", ring: "ring-purple-500", badge: "bg-purple-100", badgeText: "text-purple-700" },
    { name: "Розовый", value: "rose", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", ring: "ring-rose-500", badge: "bg-rose-100", badgeText: "text-rose-700" },
    { name: "Оранжевый", value: "orange", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", ring: "ring-orange-500", badge: "bg-orange-100", badgeText: "text-orange-700" },
    { name: "Янтарный", value: "amber", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", ring: "ring-amber-500", badge: "bg-amber-100", badgeText: "text-amber-700" },
    { name: "Зеленый", value: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", ring: "ring-emerald-500", badge: "bg-emerald-100", badgeText: "text-emerald-700" },
    { name: "Голубой", value: "sky", bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100", ring: "ring-sky-500", badge: "bg-sky-100", badgeText: "text-sky-700" },
    { name: "Серый", value: "slate", bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", ring: "ring-slate-500", badge: "bg-slate-100", badgeText: "text-slate-700" },
];

export function getDepartmentColorHex(color: string) {
    const map: Record<string, string> = {
        indigo: "#5d00ff",
        purple: "#a855f7",
        rose: "#f43f5e",
        orange: "#f97316",
        amber: "#f59e0b",
        emerald: "#10b981",
        sky: "#0ea5e9",
        slate: "#64748b"
    };
    return map[color] || map.indigo;
}
