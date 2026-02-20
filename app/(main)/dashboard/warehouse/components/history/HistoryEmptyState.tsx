import { Clock } from "lucide-react";

export function HistoryEmptyState() {
    return (
        <div className="table-empty py-20">
            <Clock />
            <p>История пуста</p>
            <span className="text-muted-foreground mt-2 max-w-[320px] font-bold leading-relaxed text-sm">Здесь будут отображаться все перемещения товаров, списания и поставки.</span>
        </div>
    );
}
