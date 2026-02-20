import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SegmentedControlOption<T extends string> {
    value: T;
    label: string;
    icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
    options: SegmentedControlOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    /** Background color for the container; default: bg-slate-100 */
    bgClassName?: string;
}

/**
 * Reusable segmented control (pill-switcher) component.
 * Replaces duplicated "B2C / B2B", "Пользователю / Отделу" toggle groups.
 *
 * Usage:
 * <SegmentedControl
 *   options={[{ value: "b2c", label: "Физлицо" }, { value: "b2b", label: "Юрлицо" }]}
 *   value={clientType}
 *   onChange={setClientType}
 * />
 */
export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
    bgClassName = "bg-slate-100",
}: SegmentedControlProps<T>) {
    return (
        <div className={cn("grid p-1 rounded-2xl", bgClassName, className)}
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
            {options.map((opt) => {
                const Icon = opt.icon;
                const isActive = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "px-4 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            isActive
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
