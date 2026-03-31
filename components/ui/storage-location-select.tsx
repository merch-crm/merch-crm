"use client";

import * as React from "react";
import { MapPin, Warehouse, Printer, Briefcase } from "lucide-react";
import { Select, SelectOption } from "./select";
import { cn } from "@/lib/utils";

interface LocationOption {
    id: string;
    name: string;
    type?: "warehouse" | "production" | "office";
}

interface StorageLocationSelectProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    options: LocationOption[];
    stocks?: Map<string, number> | { storageLocationId: string, quantity: number }[];
    className?: string;
    placeholder?: string;
    name?: string;
}

export function StorageLocationSelect({ value, onChange, options, stocks, className, placeholder, name }: StorageLocationSelectProps) {
    const stocksMap = React.useMemo(() => {
        if (!stocks) return new Map<string, number>();
        if (stocks instanceof Map) return stocks;
        return new Map(stocks.map(s => [s.storageLocationId, s.quantity]));
    }, [stocks]);

    const getIcon = (type?: string) => {
        switch (type) {
            case "warehouse": return <Warehouse className="w-4 h-4" />;
            case "production": return <Printer className="w-4 h-4" />;
            case "office": return <Briefcase className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    const safeOptions = React.useMemo(() =>
        (Array.isArray(options) ? options : []).map(opt => {
            const qty = stocksMap.get(opt.id);
            return {
                id: opt.id,
                title: opt.name,
                badge: `${qty || 0} шт`,
                icon: getIcon(opt.type)
            } as SelectOption;
        })
        , [options, stocksMap]);

    return (
        <div className={cn("w-full", className)}>
            {name && <input type="hidden" name={name} value={value} />}
            <Select
                options={safeOptions}
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Выберите склад..."}
                variant="default"
                gridColumns={undefined}
                autoLayout={false}
            />
        </div>
    );
}


