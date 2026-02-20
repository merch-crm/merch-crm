import React from "react";

interface PreviewCardProps {
    itemName: string;
    sku: string;
}

export function PreviewCard({ itemName, sku }: PreviewCardProps) {
    return (
        <div className="p-6 bg-white rounded-[var(--radius)] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-2">
            <div className="mb-2">
                <h4 className="text-base font-bold text-slate-900">Превью позиции</h4>
                <p className="text-xs font-bold text-slate-700 opacity-60 mt-1">Визуальный контроль данных</p>
            </div>

            <div className="space-y-4">
                <div className="text-xl font-bold leading-tight text-slate-900">
                    {itemName || 'Название будет здесь'}
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-700 ml-1">Артикул (SKU)</div>
                    <div className="text-lg font-mono font-bold break-all text-slate-900">
                        {sku || '---'}
                    </div>
                </div>
            </div>

            <p className="text-xs text-slate-700 font-bold leading-relaxed opacity-60 pt-2">
                Генерация данных в реальном времени
            </p>
        </div>
    );
}
