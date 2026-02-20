"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { StatusBadgeProps } from "./types";
import { STATUS_CONFIG } from "./constants";

export function StatusBadge({ status, label, size = "md", className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md font-bold",
                config.bgColor,
                config.color,
                sizeClasses[size],
                className
            )}
        >
            <span className="scale-90">{config.icon}</span>
            {label}
        </div>
    );
}
