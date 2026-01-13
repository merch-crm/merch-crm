import { Badge } from "@/components/ui/badge";
import { Zap, Circle } from "lucide-react";

export default function PriorityBadge({ priority }: { priority: string }) {
    const isHigh = priority === "high";

    return (
        <Badge
            variant={isHigh ? "destructive" : "secondary"}
            className={`
                rounded-md font-bold text-[10px] uppercase tracking-wider gap-1.5 px-2 py-0.5
                ${isHigh ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100 font-medium'}
            `}
        >
            {isHigh ? (
                <>
                    <Zap className="w-3 h-3 fill-rose-600" />
                    Срочный
                </>
            ) : (
                <>
                    <Circle className="w-2.5 h-2.5 fill-slate-400 border-none" />
                    Обычный
                </>
            )}
        </Badge>
    );
}
