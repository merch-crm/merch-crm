"use client";

import { cn } from "@/lib/utils";

type DeviceType = "desktop" | "tablet" | "mobile";

interface DevicePreviewProps {
    children: React.ReactNode;
    device: DeviceType;
    className?: string;
}

const deviceConfig = {
    desktop: {
        width: 1200,
        label: "Desktop",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    tablet: {
        width: 768,
        label: "Tablet",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    },
    mobile: {
        width: 375,
        label: "Mobile",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
    },
};

export function DevicePreview({ children, device, className }: DevicePreviewProps) {
    const config = deviceConfig[device];

    return (
        <div className={cn("flex flex-col", className)}>
            {/* Заголовок устройства */}
            <div className="flex items-center gap-2 mb-3 text-slate-500">
                {config.icon}
                <span className="text-xs font-bold  ">{config.label}</span>
                <span className="text-xs text-slate-400">({config.width}px)</span>
            </div>

            {/* Рамка устройства */}
            <div
                className={cn(
                    "bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm",
                    device === "mobile" && "max-w-[375px]",
                    device === "tablet" && "max-w-[768px]",
                )}
            >
                <div className="p-4 overflow-x-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

// Компонент для отображения всех трёх устройств
interface ResponsiveShowcaseProps {
    children: React.ReactNode;
    title?: string;
}

export function ResponsiveShowcase({ children, title }: ResponsiveShowcaseProps) {
    return (
        <div className="space-y-6">
            {title && (
                <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                <DevicePreview device="desktop">{children}</DevicePreview>
                <DevicePreview device="tablet">{children}</DevicePreview>
                <DevicePreview device="mobile">{children}</DevicePreview>
            </div>
        </div>
    );
}
