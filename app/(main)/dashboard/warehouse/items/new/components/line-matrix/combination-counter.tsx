"use client";

import { Package, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface CombinationCounterProps {
    count: number;
}

export function CombinationCounter({ count }: CombinationCounterProps) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-900">
                Будет создано позиций:{" "}
                <span className="text-2xl">{count}</span>
            </span>
            <Tooltip content="Количество = произведение выбранных значений по каждому атрибуту">
                <Info className="w-4 h-4 text-blue-400 cursor-help" />
            </Tooltip>
        </div>
    );
}
