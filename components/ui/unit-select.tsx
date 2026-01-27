"use client";

import * as React from "react";
import { PremiumSelect, PremiumSelectOption } from "./premium-select";

interface UnitOption {
    id: string;
    name: string;
}

interface UnitSelectProps {
    value: string;
    onChange: (value: string) => void;
    options?: UnitOption[];
    className?: string;
    name?: string;
    disabled?: boolean;
}

const DEFAULT_OPTIONS: UnitOption[] = [
    { id: "шт.", name: "шт." },
    { id: "kg", name: "кг" },
    { id: "m", name: "м" },
    { id: "l", name: "л" },
];

export function UnitSelect({ value, onChange, options = DEFAULT_OPTIONS, className, name, disabled }: UnitSelectProps) {
    const premiumOptions = React.useMemo(() =>
        options.map(opt => ({
            id: opt.name, // id is actually the value we want to store/display
            title: opt.name,
        } as PremiumSelectOption))
        , [options]);

    return (
        <div className={className}>
            {name && <input type="hidden" name={name} value={value} />}
            <PremiumSelect
                options={premiumOptions}
                value={value}
                onChange={onChange}
                disabled={disabled}
                placeholder="Выберите..."
                compact
                autoLayout
            />
        </div>
    );
}



