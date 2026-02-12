"use client";

import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Pipette, Hash } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
    label?: string;
    icon?: React.ReactNode;
    className?: string;
    presets?: string[];
}

const DEFAULT_PRESETS = [
    "#5d00ff", // Brand Primary
    "#0F172A", // Slate 900
    "#64748B", // Slate 500
    "#F43F5E", // Rose 500
    "#10B981", // Emerald 500
    "#F59E0B", // Amber 500
    "#3B82F6", // Blue 500
    "#8B5CF6", // Violet 500
    "#EC4899", // Pink 500
    "#FFFFFF", // White
];

export function ColorPicker({
    color,
    onChange,
    label,
    icon,
    className,
    presets = DEFAULT_PRESETS
}: ColorPickerProps) {
    const [inputValue, setInputValue] = useState(color);

    useEffect(() => {
        setInputValue(color);
    }, [color]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            onChange(value);
        }
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-2">
                    {icon}
                    {label}
                </label>
            )}
            <div className="flex items-center gap-3">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative w-11 h-11 shrink-0 p-0 rounded-xl hover:bg-transparent"
                        >
                            <div
                                className="w-full h-full rounded-xl border border-slate-200 shadow-sm transition-all group-hover:shadow-md group-hover:border-primary/30"
                                style={{ backgroundColor: color }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-xl">
                                <Pipette className="w-4 h-4 text-white drop-shadow-sm" />
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[240px] p-0 bg-white shadow-[0_10px_40px_-5px_rgba(0,0,0,0.15)] rounded-2xl border border-slate-200 overflow-hidden z-[1000]"
                        side="bottom"
                        align="start"
                        sideOffset={8}
                        collisionPadding={20}
                    >
                        <style dangerouslySetInnerHTML={{ __html: colorPickerStyles }} />

                        <div className="p-3.5 space-y-4">
                            <div className="custom-color-picker-wrapper">
                                <HexColorPicker
                                    color={color}
                                    onChange={onChange}
                                    className="!w-full !h-32"
                                />
                            </div>

                            <div className="space-y-3.5">
                                <div className="flex items-center gap-2 p-2 bg-slate-50/80 rounded-xl border border-slate-100 shadow-inner group/hex">
                                    <Hash className="w-3.5 h-3.5 text-slate-400 group-focus-within/hex:text-primary transition-colors" />
                                    <input
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        className="bg-transparent border-none outline-none font-mono text-[11px] font-bold text-slate-900 w-full uppercase tracking-wider"
                                        spellCheck={false}
                                    />
                                </div>

                                <div className="grid grid-cols-5 gap-2 px-0.5">
                                    {presets.map((p) => (
                                        <Button
                                            key={p}
                                            variant="ghost"
                                            onClick={() => onChange(p)}
                                            className={cn(
                                                "w-full h-auto aspect-square p-0 rounded-full border border-slate-100 shadow-sm transition-all hover:scale-110 active:scale-90 flex items-center justify-center bg-transparent hover:bg-transparent",
                                                color.toLowerCase() === p.toLowerCase() && "ring-2 ring-primary ring-offset-1"
                                            )}
                                            style={{ backgroundColor: p }}
                                        >
                                            {color.toLowerCase() === p.toLowerCase() && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" style={{ backgroundColor: p === "#FFFFFF" ? "#cbd5e1" : "white" }} />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                        <Hash className="w-4 h-4" />
                    </div>
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="#000000"
                        className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus-visible:bg-white focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/5 outline-none font-mono transition-all font-bold text-sm text-slate-900 shadow-sm"
                    />
                </div>
            </div>
        </div>
    );
}

const colorPickerStyles = `
    .custom-color-picker-wrapper .react-colorful {
        border-radius: 10px;
        border: none;
        width: 100% !important;
    }
    .custom-color-picker-wrapper .react-colorful__saturation {
        border-radius: 8px;
        border-bottom: none;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
    }
    .custom-color-picker-wrapper .react-colorful__hue {
        height: 12px;
        border-radius: 10px;
        margin-top: 12px;
    }
    .custom-color-picker-wrapper .react-colorful__pointer {
        width: 18px;
        height: 18px;
        border: 3px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05);
    }
    .custom-color-picker-wrapper .react-colorful__saturation-pointer {
        border-radius: 50%;
    }
`;

export function ColorPickerStyles() {
    return <style dangerouslySetInnerHTML={{ __html: colorPickerStyles }} />;
}
