import { cn } from "@/lib/utils";

interface RoleColorPickerProps {
    defaultValue?: string;
}

export const ROLE_COLORS = ["indigo", "slate", "red", "orange", "emerald", "blue", "purple", "rose", "cyan", "amber"];

export function RoleColorPicker({ defaultValue }: RoleColorPickerProps) {
    return (
        <div className="flex flex-wrap gap-2 p-3 md:p-4 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-inner">
            {ROLE_COLORS.map((c) => (
                <label key={c} className="relative cursor-pointer group">
                    <input
                        type="radio"
                        name="color"
                        value={c}
                        defaultChecked={defaultValue === c}
                        className="peer sr-only"
                    />
                    <div className={cn(
                        "w-8 h-8 rounded-[var(--radius-inner)] transition-all border-2 border-transparent peer-checked:border-white peer-checked:ring-2 shadow-sm group-hover:scale-110",
                        c === "indigo" ? "bg-primary peer-checked:ring-primary" :
                            c === "slate" ? "bg-slate-500 peer-checked:ring-slate-500" :
                                c === "red" ? "bg-red-500 peer-checked:ring-red-500" :
                                    c === "orange" ? "bg-orange-500 peer-checked:ring-orange-500" :
                                        c === "emerald" ? "bg-emerald-500 peer-checked:ring-emerald-500" :
                                            c === "blue" ? "bg-blue-500 peer-checked:ring-blue-500" :
                                                c === "purple" ? "bg-purple-500 peer-checked:ring-purple-500" :
                                                    c === "rose" ? "bg-rose-500 peer-checked:ring-rose-500" :
                                                        c === "cyan" ? "bg-cyan-500 peer-checked:ring-cyan-500" :
                                                            "bg-amber-500 peer-checked:ring-amber-500"
                    )} />
                </label>
            ))}
        </div>
    );
}
