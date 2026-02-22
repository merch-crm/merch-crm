"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Truck,
    Check,
    Calendar,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DeliveryTrackerProps } from "./types";
import { PROVIDER_CONFIG, STATUS_CONFIG, PROGRESS_STEPS } from "./constants";
import { CopyTrackingButton } from "./CopyTrackingButton";
import { DeliveryEventItem } from "./DeliveryEventItem";

export function DeliveryTracker({
    delivery,
    onRefresh,
    isLoading = false,
    className,
}: DeliveryTrackerProps) {
    const [showAllEvents, setShowAllEvents] = React.useState(false);
    const providerConfig = PROVIDER_CONFIG[delivery.provider];
    const statusConfig = STATUS_CONFIG[delivery.status];

    const visibleEvents = showAllEvents ? delivery.events : delivery.events.slice(0, 4);
    const hasMoreEvents = delivery.events.length > 4;

    const currentStepIndex = PROGRESS_STEPS.indexOf(delivery.status);

    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white overflow-hidden", className)}>
            {/* Хедер */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", providerConfig.bgColor)}>
                            <Truck className={cn("w-6 h-6", providerConfig.color)} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-bold", providerConfig.color)}>
                                    {delivery.providerName || providerConfig.name}
                                </span>
                                <a
                                    href={providerConfig.trackingUrl(delivery.trackingNumber)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-slate-100 transition-colors"
                                    title="Открыть на сайте ТК"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                </a>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <code className="text-sm font-mono text-slate-900">{delivery.trackingNumber}</code>
                                <CopyTrackingButton tracking={delivery.trackingNumber} />
                            </div>
                        </div>
                    </div>

                    {/* Статус */}
                    <div className={cn("px-3 py-1.5 rounded-lg flex items-center gap-1.5", statusConfig.bgColor)}>
                        {statusConfig.icon}
                        <span className={cn("text-xs font-bold", statusConfig.color)}>
                            {delivery.statusLabel || statusConfig.label}
                        </span>
                    </div>
                </div>

                {/* Прогресс-бар */}
                {currentStepIndex >= 0 && delivery.status !== "returned" && delivery.status !== "lost" && (
                    <div className="mt-4 flex items-center gap-1">
                        {PROGRESS_STEPS.map((step, index) => (
                            <div
                                key={step}
                                className={cn(
                                    "flex-1 h-1.5 rounded-full transition-colors",
                                    index <= currentStepIndex ? "bg-emerald-500" : "bg-slate-200"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Маршрут */}
            {(delivery.senderCity || delivery.receiverCity) && (
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3 text-sm">
                        {delivery.senderCity && (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                                    <span className="text-slate-600">{delivery.senderCity}</span>
                                </div>
                                <div className="flex-1 border-t border-dashed border-slate-300 relative">
                                    <Truck className="w-4 h-4 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50" />
                                </div>
                            </>
                        )}
                        {delivery.receiverCity && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="font-medium text-slate-900">{delivery.receiverCity}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Информация о доставке */}
            <div className="p-4 border-b border-slate-100 grid grid-cols-2 gap-3">
                {delivery.estimatedDelivery && (
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Ожидаемая дата</p>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">
                                {format(delivery.estimatedDelivery, "d MMMM", { locale: ru })}
                            </span>
                        </div>
                    </div>
                )}
                {delivery.actualDelivery && (
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Доставлен</p>
                        <div className="flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-600">
                                {format(delivery.actualDelivery, "d MMMM, HH:mm", { locale: ru })}
                            </span>
                        </div>
                    </div>
                )}
                {delivery.weight && (
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Вес</p>
                        <span className="text-sm font-medium text-slate-900">{delivery.weight} кг</span>
                    </div>
                )}
                {delivery.dimensions && (
                    <div>
                        <p className="text-xs text-slate-500 mb-1">Габариты</p>
                        <span className="text-sm font-medium text-slate-900">
                            {delivery.dimensions.length}×{delivery.dimensions.width}×{delivery.dimensions.height} см
                        </span>
                    </div>
                )}
            </div>

            {/* История */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-900">История перемещений</p>
                    {onRefresh && (
                        <button
                            type="button"
                            onClick={onRefresh}
                            disabled={isLoading}
                            className="p-1.5 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={cn("w-4 h-4 text-slate-400", isLoading && "animate-spin")} />
                        </button>
                    )}
                </div>

                <div className="space-y-0">
                    {visibleEvents.map((event, index) => (
                        <DeliveryEventItem
                            key={event.id}
                            event={event}
                            isFirst={index === 0}
                            isLast={index === visibleEvents.length - 1}
                        />
                    ))}
                </div>

                {/* Показать ещё */}
                {hasMoreEvents && (
                    <button
                        type="button"
                        onClick={() => setShowAllEvents(!showAllEvents)}
                        className="w-full mt-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1 transition-colors"
                    >
                        {showAllEvents ? (
                            <>
                                <ChevronUp className="w-4 h-4" />
                                Свернуть
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Показать ещё {delivery.events.length - 4}
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Футер */}
            {delivery.lastUpdate && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Обновлено{" "}
                        <span className="font-medium">
                            {formatDistanceToNow(delivery.lastUpdate, { addSuffix: true, locale: ru })}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
