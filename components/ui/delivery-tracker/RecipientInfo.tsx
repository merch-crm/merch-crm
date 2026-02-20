"use client";

import * as React from "react";
import { MapPin, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecipientInfoProps } from "./types";

export function RecipientInfo({ name, phone, address, className }: RecipientInfoProps) {
    if (!name && !phone && !address) return null;

    return (
        <div className={cn("p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2", className)}>
            <p className="text-xs font-bold text-slate-500 mb-3">Получатель</p>
            {name && (
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{name}</span>
                </div>
            )}
            {phone && (
                <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">{phone}</span>
                </div>
            )}
            {address && (
                <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <span className="text-sm text-slate-600">{address}</span>
                </div>
            )}
        </div>
    );
}
