"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle2, AlertCircle, LucideIcon, Maximize } from "lucide-react";
import { ProductionTimer } from "./components/production-timer";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { updateProductionStageAction } from "./actions";
import { useRouter } from "next/navigation";
import { DefectDialog } from "./defect-dialog";
import { ModernImageGallery } from "@/components/ui/modern-image-gallery";

import { pluralize } from "@/lib/pluralize";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { OrderItem } from "./types";

export { type OrderItem };

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
    const { toast } = useToast();

    const getItemsByStage = (stage: Stage): OrderItem[] => {
        return (items || []).filter(item => {
            const statusKey = `stage${stage.charAt(0).toUpperCase() + stage.slice(1)}Status` as keyof OrderItem;
            return item[statusKey] === 'in_progress' || item[statusKey] === 'pending';
        });
    };

    const handleStageUpdate = async (itemId: string, stage: Stage, newStatus: StageStatus) => {
        setLoading(itemId);
        const result = await updateProductionStageAction(itemId, stage, newStatus);
        setLoading(null);

        if (!result.success) {
            toast(result.error, "error");
        } else {
            toast("Статус успешно обновлен", "success");
            router.refresh();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 overflow-x-auto pb-4 custom-scrollbar lg:overflow-visible">
            {stages.map((stage) => {
                const stageItems = getItemsByStage(stage.id);
                const Icon = stage.icon;

                return (
                    <div key={stage.id} className="crm-card min-h-[550px] flex flex-col !bg-slate-50/30">
                        {/* Column Header */}
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60 relative">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border", stage.color)}>
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-slate-900 truncate tracking-tight">{stage.label}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    <p className="text-xs text-slate-400 font-bold tracking-wider">
                                        {stageItems.length} {pluralize(stageItems.length, 'позиция', 'позиции', 'позиций')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                            {stageItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl m-2">
                                    <Icon className="w-8 h-8 mb-2 opacity-20" />
                                    <span className="text-xs font-bold opacity-40 text-center px-4">Нет задач</span>
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
                                                "bg-white rounded-[24px] p-5 border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer group touch-manipulation relative overflow-hidden",
                                                isUrgent ? "border-rose-200 shadow-rose-100/50" : "border-slate-100 shadow-slate-200/50"
                                            )}
                                        >
                                            {isUrgent && (
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />
                                            )}

                                            {/* Order Info */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1.5">
                                                        <span>{item.order.orderNumber}</span>
                                                        {isUrgent && (
                                                            <>
                                                                <span className="w-1 h-1 rounded-full bg-rose-300" />
                                                                <span className="text-rose-500">СРОЧНО</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="text-base font-bold text-slate-900 truncate leading-tight">
                                                        {item.order.client?.name || "Без имени"}
                                                    </div>
                                                </div>
                                                {isUrgent && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0 ml-2 mt-1 shadow-sm shadow-rose-500/50" />
                                                )}
                                            </div>

                                            {/* Mockup Preview */}
                                            {item.order.attachments && item.order.attachments.length > 0 && (
                                                <div className="mb-4 relative group/mockup overflow-hidden rounded-[20px] bg-slate-100 border border-slate-200 aspect-video shadow-inner">
                                                    <Image
                                                        src={item.order.attachments[0].fileUrl}
                                                        alt="Mockup"
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover/mockup:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/mockup:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-4">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={(e: React.MouseEvent) => {
                                                                e.stopPropagation();
                                                                setLightboxImage(item.order.attachments?.[0]?.fileUrl || null);
                                                            }}
                                                            className="text-white text-xs font-bold gap-2 p-0 h-auto hover:bg-transparent hover:text-white/80 active:scale-95 transition-all"
                                                        >
                                                            <Maximize className="w-4 h-4" />
                                                            <span>ПРОСМОТР</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Item Description */}
                                            <div className="text-sm font-medium text-slate-500 mb-4 line-clamp-2 leading-snug">
                                                {item.description || "Без описания"}
                                            </div>

                                            {/* Footer: Quantity & Status */}
                                            <div className="flex items-center justify-between mb-5">
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                    <Package className="w-4 h-4 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {item.quantity} {pluralize(item.quantity, 'штука', 'штуки', 'штук')}
                                                    </span>
                                                </div>
                                                
                                                <ProductionTimer 
                                                    orderItemId={item.id} 
                                                    stage={stage.id} 
                                                />

                                                <div className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded-lg border",
                                                    currentStatus === 'in_progress' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                                )}>
                                                    {currentStatus === 'in_progress' ? 'В работе' : 'Ожидание'}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                                {currentStatus === 'pending' && (
                                                    <Button
                                                        variant="default"
                                                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleStageUpdate(item.id, stage.id, 'in_progress'); }}
                                                        disabled={loading === item.id}
                                                        className="flex-1 h-12 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20 border-0"
                                                    >
                                                        {loading === item.id ? '...' : 'Начать'}
                                                    </Button>
                                                )}
                                                {currentStatus === 'in_progress' && (
                                                    <Button
                                                        variant="default"
                                                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleStageUpdate(item.id, stage.id, 'done'); }}
                                                        disabled={loading === item.id}
                                                        className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold active:scale-95 transition-all shadow-lg shadow-emerald-500/20 border-0"
                                                    >
                                                        {loading === item.id ? '...' : 'Завершить'}
                                                    </Button>
                                                )}
                                                <DefectDialog
                                                    orderItemId={item.id}
                                                    maxQuantity={item.quantity}
                                                    itemName={item.description || "Товар"}
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

            <ModernImageGallery
                images={[{ src: lightboxImage, label: "Вложение" }]}
                isOpen={!!lightboxImage}
                onClose={() => setLightboxImage(null)}
                itemName="Макет"
            />
        </div>
    );
}
