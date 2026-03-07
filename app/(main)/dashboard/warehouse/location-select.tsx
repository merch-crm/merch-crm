"use client";

import { useMemo } from "react";
import { MapPin, Warehouse, Printer, Briefcase } from "lucide-react";
import { StorageLocation } from "./storage-locations-tab";
import { Select, SelectOption } from "@/components/ui/select";

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
    error?: boolean;
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
    stocks,
    error
}: LocationSelectProps) {
    const getIcon = (type?: string) => {
        switch (type) {
            case "warehouse": return <Warehouse className="w-4 h-4 opacity-50" />;
            case "production": return <Printer className="w-4 h-4 opacity-50" />;
            case "office": return <Briefcase className="w-4 h-4 opacity-50" />;
            default: return <MapPin className="w-4 h-4 opacity-50" />;
        }
    };

    const safeOptions = useMemo(() => {
        return locations
            .filter(l => l.id !== excludeId)
            .map(loc => {
                const qty = stocks?.get(loc.id);
                return {
                    id: loc.id,
                    title: loc.name,
                    icon: getIcon(loc.type),
                    badge: qty !== undefined ? `${qty} шт` : undefined,
                } as SelectOption;
            });
    }, [locations, excludeId, stocks]);

    return (
        <div className={className}>
            {label && (
                <label className="text-sm font-bold text-slate-700 ml-1 block mb-2">
                    {label}
                </label>
            )}
            <Select
                options={safeOptions}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                autoLayout={false}
                showSearch={locations.length > 5}
                error={error}
            />
        </div>
    );
}

