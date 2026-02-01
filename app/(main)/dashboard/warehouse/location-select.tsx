"use client";

import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { StorageLocation } from "./storage-locations-tab";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";

interface LocationSelectProps {
    locations: StorageLocation[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    excludeId?: string;
    label?: string;
    className?: string;
    stocks?: Map<string, number>;
}

export function LocationSelect({
    locations,
    value,
    onChange,
    placeholder = "Выберите склад",
    disabled,
    excludeId,
    label,
    className,
    stocks
}: LocationSelectProps) {
    const safeOptions = useMemo(() => {
        return locations
            .filter(l => l.id !== excludeId)
            .map(loc => {
                const qty = stocks?.get(loc.id);
                return {
                    id: loc.id,
                    title: loc.name,
                    icon: <MapPin className="w-4 h-4 opacity-50" />,
                    badge: qty !== undefined ? `${qty} шт` : undefined,
                } as PremiumSelectOption;
            });
    }, [locations, excludeId, stocks]);

    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-bold text-slate-500 ml-1 block mb-2">
                    {label}
                </label>
            )}
            <PremiumSelect
                options={safeOptions}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                autoLayout
                showSearch={locations.length > 5}
            />
        </div>
    );
}

