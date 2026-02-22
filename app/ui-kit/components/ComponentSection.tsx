'use client';

import { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import { ComponentDefinition } from '../lib/component-registry';
import { ComponentCard } from './ComponentCard';

interface ComponentSectionProps {
    component: ComponentDefinition;
}

export function ComponentSection({ component }: ComponentSectionProps) {
    const [copied, setCopied] = useState(false);

    const copyImport = () => {
        navigator.clipboard.writeText(component.importStatement);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id={component.id} className="mb-16 scroll-mt-24">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{component.name}</h2>
                        <p className="text-slate-500 mt-1 text-sm leading-relaxed">{component.description}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0 mt-1">
                        {component.category}
                    </span>
                </div>

                {/* Import & File path */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-950 text-slate-300 px-3 py-2 rounded-lg font-mono text-xs">
                        <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <code className="truncate max-w-[400px]">{component.importStatement}</code>
                        <button
                            onClick={copyImport}
                            className="p-1 rounded hover:bg-slate-800 transition-colors ml-1 shrink-0"
                            title="Копировать import"
                        >
                            {copied
                                ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                                : <Copy className="w-3.5 h-3.5 text-slate-500" />
                            }
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>📁</span>
                        <code className="text-slate-500">{component.filePath}</code>
                    </div>
                </div>
            </div>

            {/* Divider with count */}
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs text-slate-400 font-medium">{component.variants.length} вариантов</span>
                <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Variants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {component.variants.map((variant, index) => (
                    <ComponentCard key={index} variant={variant} />
                ))}
            </div>
        </section>
    );
}
