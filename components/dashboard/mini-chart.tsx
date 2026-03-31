"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MiniChartProps {
    data: number[];
    type?: "line" | "bar";
    color?: string;
    height?: number;
    className?: string;
}

export function MiniChart({
    data,
    type = "line",
    color = "rgb(59, 130, 246)",
    height = 40,
    className,
}: MiniChartProps) {
    const normalizedData = useMemo(() => {
        if ((data || []).length === 0) return [];
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        return (data || []).map((value) => ((value - min) / range) * 100);
    }, [data]);

    if ((data || []).length === 0) {
        return null;
    }

    if (type === "bar") {
        return (
            <div
                className={cn("flex items-end gap-1", className)}
                style={{ height }}
            >
                {normalizedData.map((value, index) => (
                    <div
                        key={index}
                        className="flex-1 rounded-t"
                        style={{
                            height: `${Math.max(value, 5)}%`,
                            backgroundColor: color,
                            opacity: 0.7 + (index / normalizedData.length) * 0.3,
                        }}
                    />
                ))}
            </div>
        );
    }

    // Line chart using SVG
    const width = 100;
    const points = normalizedData.map((value, index) => {
        const x = (index / (normalizedData.length - 1)) * width;
        const y = height - (value / 100) * height;
        return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;
    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className={cn("w-full", className)}
            style={{ height }}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
            </defs>
            <path
                d={areaD}
                fill={`url(#gradient-${color})`}
            />
            <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
