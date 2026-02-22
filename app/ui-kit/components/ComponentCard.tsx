'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { VariantExample } from '../lib/component-registry';

interface ComponentCardProps {
    variant: VariantExample;
}

export function ComponentCard({ variant }: ComponentCardProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const copyName = () => {
        navigator.clipboard.writeText(variant.name);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
            {/* Preview */}
            <div className="p-6 bg-slate-50/70 border-b border-slate-200 min-h-[100px] flex items-center justify-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {variant.render()}
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <code className="text-sm font-mono font-bold text-primary truncate">
                            {variant.name}
                        </code>
                        <button
                            onClick={copyName}
                            className="p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
                            title="Копировать"
                        >
                            {copied
                                ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                                : <Copy className="w-3.5 h-3.5 text-slate-400" />
                            }
                        </button>
                    </div>
                </div>

                {variant.description && (
                    <p className="text-xs text-slate-500 mb-2">{variant.description}</p>
                )}

                {variant.cssProperties.length > 0 && (
                    <>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mt-2 transition-colors"
                        >
                            {expanded
                                ? <ChevronUp className="w-3.5 h-3.5" />
                                : <ChevronDown className="w-3.5 h-3.5" />
                            }
                            CSS ({variant.cssProperties.length})
                        </button>

                        {expanded && (
                            <div className="mt-2 p-3 bg-slate-950 rounded-lg font-mono text-xs space-y-0.5">
                                {variant.cssProperties.map((prop, i) => (
                                    <div key={i} className="flex gap-1 flex-wrap">
                                        <span className="text-sky-400">{prop.property}</span>
                                        <span className="text-slate-500">:</span>
                                        <span className="text-amber-300">{prop.value}</span>
                                        <span className="text-slate-500">;</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
