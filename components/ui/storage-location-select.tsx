"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { Select, SelectOption } from "./select";

interface LocationOption {
    id: string;
    name: string;
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

    const safeOptions = React.useMemo(() =>
        (Array.isArray(options) ? options : []).map(opt => {
            const qty = stocksMap.get(opt.id);
            return {
                id: opt.id,
                title: opt.name,
                badge: qty !== undefined ? `${qty} шт` : undefined,
                icon: <MapPin className="sr-only" />
            } as SelectOption;
        })
        , [options, stocksMap]);

    return (
        <div className={className}>
            {name && <input type="hidden" name={name} value={value} />}
            <Select
                options={safeOptions}
                value={value}
                onChange={onChange}
                placeholder={placeholder || "Выберите склад..."}
                variant="default"
                autoLayout
            />
        </div>
    );
}


