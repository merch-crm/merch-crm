"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle2, AlertCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { updateProductionStageAction } from "./actions";
import { useRouter } from "next/navigation";
import { DefectDialog } from "./defect-dialog";
import { ImageLightbox } from "@/components/image-lightbox";
import { Maximize } from "lucide-react";
import { pluralize } from "@/lib/pluralize";

interface OrderItem {
    id: string;
    description: string;
    quantity: number;
    order: {
        id: string;
        orderNumber: string;
        client: { name: string | null };
        priority: string | null;
        attachments?: { id: string; fileUrl: string; fileName: string }[];
    };
    stagePrepStatus: string;
    stagePrintStatus: string;
    stageApplicationStatus: string;
    stagePackagingStatus: string;
}

interface ProductionBoardProps {
    items: OrderItem[];
}

type Stage = 'prep' | 'print' | 'application' | 'packaging';
type StageStatus = 'pending' | 'in_progress' | 'done' | 'failed';

const stages: { id: Stage; label: string; icon: LucideIcon; color: string }[] = [
    { id: 'prep', label: 'Подготовка', icon: Package, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'print', label: 'Печать', icon: Clock, color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { id: 'application', label: 'Нанесение', icon: AlertCircle, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'packaging', label: 'Упаковка', icon: CheckCircle2, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

export function ProductionBoard({ items }: ProductionBoardProps) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    const getItemsByStage = (stage: Stage): OrderItem[] => {
        return items.filter(item => {
            const statusKey = `stage${stage.charAt(0).toUpperCase() + stage.slice(1)}Status` as keyof OrderItem;
            return item[statusKey] === 'in_progress' || item[statusKey] === 'pending';
        });
    };

    const handleStageUpdate = async (itemId: string, stage: Stage, newStatus: StageStatus) => {
        setLoading(itemId);
        const result = await updateProductionStageAction(itemId, stage, newStatus);
        setLoading(null);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {stages.map((stage) => {
                const stageItems = getItemsByStage(stage.id);
                const Icon = stage.icon;

                return (
                    <div key={stage.id} className="glass-panel p-5 min-h-[500px] flex flex-col">
                        {/* Column Header */}
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                            <div className={cn("w-10 h-10 rounded-[12px] flex items-center justify-center", stage.color)}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>
                                <p className="text-xs text-slate-400 font-medium">{stageItems.length} {pluralize(stageItems.length, 'позиция', 'позиции', 'позиций')}</p>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="flex-1 space-y-3 overflow-y-auto">
                            {stageItems.length === 0 ? (
                                <div className="flex items-center justify-center h-32 text-slate-300 text-sm">
                                    Нет задач
                                </div>
                            ) : (
                                stageItems.map((item) => {
                                    const isUrgent = item.order.priority === 'high' || item.order.priority === 'urgent';
                                    const statusKey = `stage${stage.id.charAt(0).toUpperCase() + stage.id.slice(1)}Status` as keyof OrderItem;
                                    const currentStatus = item[statusKey] as string;

                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "bg-white rounded-[var(--radius)] p-4 border transition-all hover:shadow-md cursor-pointer group",
                                                isUrgent ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
                                            )}
                                        >
                                            {/* Order Info */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-slate-400 mb-1">
                                                        {item.order.orderNumber}
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-900 truncate">
                                                        {item.order.client.name || "Без имени"}
                                                    </div>
                                                </div>
                                                {isUrgent && (
                                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0 ml-2 mt-1" />
                                                )}
                                            </div>

                                            {/* Mockup Preview */}
                                            {item.order.attachments && item.order.attachments.length > 0 && (
                                                <div className="mb-3 relative group/mockup overflow-hidden rounded-[8px] bg-slate-50 border border-slate-100 aspect-video">
                                                    <Image
                                                        src={item.order.attachments[0].fileUrl}
                                                        alt="Mockup"
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover/mockup:scale-110"
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLightboxImage(item.order.attachments?.[0]?.fileUrl || null);
                                                        }}
                                                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/mockup:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-2"
                                                    >
                                                        <Maximize className="w-3.5 h-3.5" />
                                                        Открыть во весь экран
                                                    </button>
                                                </div>
                                            )}

                                            {/* Item Description */}
                                            <div className="text-xs text-slate-600 mb-3 line-clamp-2">
                                                {item.description}
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <Package className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500">{item.quantity} {pluralize(item.quantity, 'штука', 'штуки', 'штук')}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                                {currentStatus === 'pending' && (
                                                    <button
                                                        onClick={() => handleStageUpdate(item.id, stage.id, 'in_progress')}
                                                        disabled={loading === item.id}
                                                        className="flex-1 px-3 py-1.5 bg-primary/5 text-primary rounded-[8px] text-xs font-bold hover:bg-primary/10 transition-all disabled:opacity-50"
                                                    >
                                                        {loading === item.id ? '...' : 'Начать'}
                                                    </button>
                                                )}
                                                {currentStatus === 'in_progress' && (
                                                    <button
                                                        onClick={() => handleStageUpdate(item.id, stage.id, 'done')}
                                                        disabled={loading === item.id}
                                                        className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-[8px] text-xs font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
                                                    >
                                                        {loading === item.id ? '...' : 'Завершить'}
                                                    </button>
                                                )}
                                                <DefectDialog
                                                    orderItemId={item.id}
                                                    maxQuantity={item.quantity}
                                                    itemName={item.description}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}

            <ImageLightbox
                src={lightboxImage || ""}
                isOpen={!!lightboxImage}
                onClose={() => setLightboxImage(null)}
            />
        </div>
    );
}
