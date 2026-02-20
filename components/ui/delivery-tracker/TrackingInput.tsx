"use client";

import * as React from "react";
import { Navigation, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { TrackingInputProps, DeliveryProvider } from "./types";
import { PROVIDER_CONFIG } from "./constants";

export function TrackingInput({ onTrack, isLoading = false, className }: TrackingInputProps) {
    const [provider, setProvider] = React.useState<DeliveryProvider>("cdek");
    const [tracking, setTracking] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tracking.trim()) {
            onTrack(provider, tracking.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
            <div className="flex gap-2 items-end">
                <div className="w-[160px]">
                    <label className="text-xs font-bold text-slate-400 ml-1 mb-1 block">Перевозчик</label>
                    <Select
                        value={provider}
                        onChange={(val) => setProvider(val as DeliveryProvider)}
                        options={Object.entries(PROVIDER_CONFIG).map(([key, config]) => ({
                            id: key,
                            title: config.name
                        }))}
                    />
                </div>
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="Введите трек-номер"
                        className="w-full h-11 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!tracking.trim() || isLoading}
                    className="h-11 px-6 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                        <Navigation className="w-4 h-4" />
                    )}
                    Отследить
                </button>
            </div>
        </form>
    );
}
