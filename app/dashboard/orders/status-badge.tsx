import { Badge } from "@/components/ui/badge";

export default function StatusBadge({ status }: { status: string }) {
    // Map existing statuses to new Badge variants
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "purple" | "gray"> = {
        new: "info", // Blue
        layout_pending: "warning", // Amber
        layout_approved: "purple", // Purple
        in_printing: "warning", // Amber/Orange
        done: "success", // Green
        cancelled: "destructive", // Red
    };

    const labels: Record<string, string> = {
        new: "Новый",
        layout_pending: "Ждет макет",
        layout_approved: "Макет ОК",
        in_printing: "В печати",
        done: "Готов",
        cancelled: "Отменен",
    };

    const variant = variantMap[status] || "secondary";

    return (
        <Badge variant={variant} className="rounded-md font-normal">
            {labels[status] || status}
        </Badge>
    );
}
