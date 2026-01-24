"use client";

import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

interface QRCodeProps {
    value: string;
    size?: number;
    className?: string;
    includeMargin?: boolean;
}

export function QRCode({ value, size = 128, className, includeMargin = false }: QRCodeProps) {
    if (!value) return null;

    return (
        <div className={cn("inline-flex items-center justify-center p-2 bg-white rounded-xl shadow-sm border border-slate-100", className)}>
            <QRCodeSVG
                value={value}
                size={size}
                level="M"
                includeMargin={includeMargin}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
        </div>
    );
}
