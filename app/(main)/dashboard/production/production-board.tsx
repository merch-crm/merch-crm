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
import { Button } from "@/components/ui/button";

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 overflow-x-auto pb-4 custom-scrollbar lg:overflow-visible">
            {stages.map((stage) => {
                const stageItems = getItemsByStage(stage.id);
                const Icon = stage.icon;

                return (
                    <div key={stage.id} className="crm-card min-h-[500px] flex flex-col">
                        {/* Column Header */}
                        <div className="flex items-center gap-3 md:gap-4 mb-5 pb-4 border-b border-slate-200">
                            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-[12px] md:rounded-[16px] flex items-center justify-center shrink-0", stage.color)}>
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">{stage.label}</h3>
                                <p className="text-xs md:text-sm text-slate-400 font-medium">{stageItems.length} {pluralize(stageItems.length, 'позиция', 'позиции', 'позиций')}</p>
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
                                                "bg-white rounded-[var(--radius)] p-4 md:p-5 border transition-all hover:shadow-lg cursor-pointer group touch-manipulation",
                                                isUrgent ? "border-rose-200 bg-rose-50/30" : "border-slate-200"
                                            )}
                                        >
                                            {/* Order Info */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs md:text-sm font-bold text-slate-400 mb-1">
                                                        {item.order.orderNumber}
                                                    </div>
                                                    <div className="text-sm md:text-lg font-bold text-slate-900 truncate leading-tight">
                                                        {item.order.client.name || "Без имени"}
                                                    </div>
                                                </div>
                                                {isUrgent && (
                                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0 ml-2 mt-1" />
                                                )}
                                            </div>

                                            {/* Mockup Preview */}
                                            {item.order.attachments && item.order.attachments.length > 0 && (
                                                <div className="mb-3 relative group/mockup overflow-hidden rounded-[8px] bg-slate-50 border border-slate-200 aspect-video">
                                                    <Image
                                                        src={item.order.attachments[0].fileUrl}
                                                        alt="Mockup"
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover/mockup:scale-110"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setLightboxImage(item.order.attachments?.[0]?.fileUrl || null);
                                                        }}
                                                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/mockup:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold gap-2 p-0 h-auto hover:bg-slate-900/50 hover:text-white"
                                                    >
                                                        <Maximize className="w-3.5 h-3.5" />
                                                        Открыть во весь экран
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Item Description */}
                                            <div className="text-xs md:text-sm font-medium text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                                                {item.description}
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <Package className="w-4 h-4 text-slate-400" />
                                                <span className="text-xs md:text-sm font-bold text-slate-600">{item.quantity} {pluralize(item.quantity, 'штука', 'штуки', 'штук')}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                                {currentStatus === 'pending' && (
                                                    <Button
                                                        variant="default"
                                                        onClick={(e) => { e.stopPropagation(); handleStageUpdate(item.id, stage.id, 'in_progress'); }}
                                                        disabled={loading === item.id}
                                                        className="flex-1 h-11 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                                    >
                                                        {loading === item.id ? '...' : 'Начать'}
                                                    </Button>
                                                )}
                                                {currentStatus === 'in_progress' && (
                                                    <Button
                                                        variant="default"
                                                        onClick={(e) => { e.stopPropagation(); handleStageUpdate(item.id, stage.id, 'done'); }}
                                                        disabled={loading === item.id}
                                                        className="flex-1 h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                                    >
                                                        {loading === item.id ? '...' : 'Завершить'}
                                                    </Button>
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
