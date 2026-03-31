"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Copy, ChevronDown } from "lucide-react";
import { DevicePreview } from "./DevicePreview";

interface CSSProperty {
    property: string;
    value: string;
}

interface ClassInfo {
    name: string;
    description?: string;
    properties: CSSProperty[];
}

interface ComponentShowcaseProps {
    title: string;
    description?: string;
    componentName: string;
    importPath: string;
    classes: ClassInfo[];
    children: React.ReactNode;
    // Отдельный контент для разных устройств (опционально)
    desktopContent?: React.ReactNode;
    tabletContent?: React.ReactNode;
    mobileContent?: React.ReactNode;
}

export function ComponentShowcase({
    title,
    description,
    componentName,
    importPath,
    classes,
    children,
    desktopContent,
    tabletContent,
    mobileContent,
}: ComponentShowcaseProps) {
    const [copied, setCopied] = useState<string | null>(null);
    const [showProperties, setShowProperties] = useState(false);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="crm-card p-0 overflow-hidden">
            {/* Заголовок */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        {description && (
                            <p className="text-sm text-slate-500 mt-1">{description}</p>
                        )}
                    </div>
                    <button
                        onClick={() => copyToClipboard(`import { ${componentName} } from "${importPath}"`, "import")}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-xs font-mono text-slate-600"
                    >
                        {copied === "import" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {importPath}
                    </button>
                </div>
            </div>

            {/* Превью в 3 размерах */}
            <div className="p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
                    <DevicePreview device="desktop">
                        {desktopContent || children}
                    </DevicePreview>
                    <DevicePreview device="tablet">
                        {tabletContent || children}
                    </DevicePreview>
                    <DevicePreview device="mobile">
                        {mobileContent || children}
                    </DevicePreview>
                </div>
            </div>

            {/* Классы и свойства */}
            <div className="border-t border-slate-100 card-breakout-remove-this-if-no-need mt-0">
                <button
                    onClick={() => setShowProperties(!showProperties)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <span className="text-sm font-bold text-slate-700">
                        CSS классы и свойства ({classes.length})
                    </span>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showProperties && "rotate-180")} />
                </button>

                {showProperties && (
                    <div className="px-6 pb-6 space-y-3">
                        {classes.map((cls, index) => (
                            <div key={index} className="rounded-xl border border-slate-200 overflow-hidden">
                                {/* Название класса */}
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <code className="px-2 py-1 rounded-md bg-slate-900 text-white text-xs font-mono">
                                            {cls.name}
                                        </code>
                                        {cls.description && (
                                            <span className="text-xs text-slate-500">{cls.description}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(cls.name, cls.name)}
                                        className="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                                    >
                                        {copied === cls.name ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                    </button>
                                </div>

                                {/* CSS свойства */}
                                {cls.properties.length > 0 && (
                                    <div className="divide-y divide-slate-100">
                                        {cls.properties.map((prop, propIndex) => (
                                            <div key={propIndex} className="flex items-center justify-between px-4 py-2 text-xs">
                                                <span className="font-mono text-slate-600">{prop.property}</span>
                                                <span className="font-mono text-primary font-medium">{prop.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
