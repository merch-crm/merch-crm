"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Mail, Phone, MapPin, Building2, Calendar,
    TrendingUp, ShoppingBag, Edit2, ExternalLink,
    MessageCircle, Plus, Info, Activity, User, Link as LinkIcon
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn, safeExternalOpen } from "@/lib/utils";
import { useBranding } from "@/components/branding-provider";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useToast } from "@/components/ui/toast";
import { InfoRow } from "@/components/ui/info-row";
import { EmptyState } from "@/components/ui/empty-state";
import { ModernStatCard } from "@/components/ui/stat-card";
import { getClientDetails } from "./actions/core.actions";
import type { ClientProfile } from "@/lib/types";

// Local interfaces removed in favor of @/lib/types

interface ClientProfileDrawerProps {
    clientId: string;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    showFinancials?: boolean;
    userRoleName?: string | null;
}

type TabType = "general" | "orders" | "activity";

/**
 * Safe date formatter to prevent "Invalid time value" errors
 */
const safeFormat = (dateStr: string | null | undefined, formatStr: string) => {
    if (!dateStr) return "---";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "---";
        return formatDate(date, formatStr);
    } catch {
        return "---";
    }
};

export function ClientProfileDrawer({ clientId, isOpen, onClose, onEdit, showFinancials = true, userRoleName }: ClientProfileDrawerProps) {
    const { currencySymbol } = useBranding();
    const [client, setClient] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const router = useRouter();
    const { toast } = useToast();

    const loadClientProfile = useCallback(async (id: string) => {
        setLoading(true);
        const result = await getClientDetails(id);
        if (result.success) {
            setClient(result.data || null);
        } else {
            setClient(null);
            toast(result.error, "error");
        }
        setLoading(false);
    }, [toast]);

    useEffect(() => {
        if (isOpen && clientId) {
            loadClientProfile(clientId);
        }
    }, [isOpen, clientId, loadClientProfile]);

    const fullName = client ? `${client.lastName} ${client.firstName} ${client.patronymic || ""}`.trim() : "";

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={loading ? "Загрузка..." : fullName}
            description="Профиль клиента"
            className="max-w-2xl max-h-[90vh]"
        >
            <div className="flex flex-col h-full bg-white">
                {/* Header Actions & Tabs */}
                <div className="px-6 pb-0 border-b border-slate-200 flex-shrink-0">
                    {/* Quick Action Bar */}
                    {!loading && client && client.id && (
                        <div className="flex flex-wrap gap-2 mb-6 mt-2">
                            {!["Печатник", "Дизайнер"].includes(userRoleName || "") && (
                                <Button
                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs"
                                    onClick={() => {
                                        safeExternalOpen(`tel:${client.phone}`, "Телефон", toast, true);
                                    }}
                                >
                                    <Phone className="w-3.5 h-3.5 mr-2" /> Позвонить
                                </Button>
                            )}
                            {client.telegram && (
                                <Button
                                    className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs"
                                    onClick={() => {
                                        safeExternalOpen(`https://t.me/${client.telegram?.replace('@', '')}`, "Telegram", toast);
                                    }}
                                >
                                    <MessageCircle className="w-3.5 h-3.5 mr-2" /> Telegram
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="h-9 px-4 border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50"
                                onClick={() => router.push(`/dashboard/orders?clientId=${client.id}`)}
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> Создать заказ
                            </Button>
                            {onEdit && (
                                <Button
                                    onClick={onEdit}
                                    variant="outline"
                                    className="h-9 px-4 border-primary/20 text-primary rounded-xl font-bold text-xs hover:bg-primary/5"
                                >
                                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Редактировать
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-3">
                        {(["general", "orders", "activity"] as const).map((tab) => (
                            <button type="button"
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-3 text-xs font-medium transition-all relative",
                                    activeTab === tab
                                        ? "text-primary"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab === "general" && "Общая информация"}
                                {tab === "orders" && "Заказы"}
                                {tab === "activity" && "Активность"}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full mt-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3">
                            <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-medium text-slate-400">Загрузка данных...</p>
                        </div>
                    ) : client ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {activeTab === "general" && (
                                <div className="space-y-3">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <ModernStatCard
                                            icon={ShoppingBag}
                                            label="Заказы"
                                            value={client.totalOrders}
                                            colorScheme="primary"
                                        />

                                        {showFinancials && (
                                            <ModernStatCard
                                                icon={TrendingUp}
                                                label="LTV"
                                                value={Math.round(client.totalSpent)}
                                                suffix={currencySymbol}
                                                colorScheme="emerald"
                                            />
                                        )}
                                    </div>

                                    {/* Basic Info */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 px-1">
                                            <Info className="w-4 h-4 text-slate-400" />
                                            <h3 className="text-xs font-semibold text-slate-400">Основная информация</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <InfoRow
                                                icon={Phone}
                                                label="Телефон"
                                                value={["Печатник", "Дизайнер"].includes(userRoleName || "") ? "HIDDEN" : client.phone}
                                                variant="minimal"
                                            />
                                            {client.email && (
                                                <InfoRow icon={Mail} label="Email" value={client.email} variant="minimal" />
                                            )}
                                            {client.city && (
                                                <InfoRow
                                                    icon={MapPin}
                                                    label="География"
                                                    value={`${client.city}${client.address ? `, ${client.address}` : ''}`}
                                                    variant="minimal"
                                                />
                                            )}
                                            {client.company && (
                                                <InfoRow icon={Building2} label="Компания" value={client.company} variant="minimal" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Social & Meta */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <LinkIcon className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-xs font-semibold text-slate-400">Ссылки</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {client.telegram && (
                                                    <Badge variant="outline" className="h-8 pl-1 pr-3 rounded-full border-blue-100 bg-blue-50 text-blue-600 gap-2 font-semibold cursor-pointer hover:bg-blue-100 transition-all" onClick={() => {
                                                        safeExternalOpen(`https://t.me/${client.telegram?.replace('@', '')}`, "Telegram", toast);
                                                    }}>
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white"><MessageCircle className="w-3 h-3" /></div>
                                                        Telegram
                                                    </Badge>
                                                )}
                                                {client.instagram && (
                                                    <Badge variant="outline" className="h-8 pl-1 pr-3 rounded-full border-pink-100 bg-pink-50 text-pink-600 gap-2 font-semibold cursor-pointer hover:bg-pink-100 transition-all" onClick={() => {
                                                        safeExternalOpen(`https://instagram.com/${client.instagram?.replace('@', '')}`, "Instagram", toast);
                                                    }}>
                                                        <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white"><ExternalLink className="w-3 h-3" /></div>
                                                        Instagram
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-xs font-semibold text-slate-400">Менеджер</h3>
                                            </div>
                                            <InfoRow
                                                icon={User}
                                                label="Ответственный"
                                                value={client.manager?.name || "Не назначен"}
                                                variant="minimal"
                                            />
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    {client.comments && (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <MessageCircle className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-xs font-semibold text-slate-400">Примечания</h3>
                                            </div>
                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-slate-700 leading-relaxed font-medium text-sm">
                                                {client.comments}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "orders" && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-xs font-semibold text-slate-400">Список последних заказов</h3>
                                        <Badge className="bg-slate-100 text-slate-600 border-none font-bold">{client.orders?.length || 0}</Badge>
                                    </div>
                                    {client.orders?.length > 0 ? (
                                        <div className="space-y-2">
                                            {client.orders?.map((order) => (
                                                <a
                                                    key={order.id}
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 transition-all group shadow-sm hover:bg-white hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-all">
                                                            <ShoppingBag className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">Заказ #{order.orderNumber || order.id.slice(0, 8)}</p>
                                                            <p className="text-xs font-medium text-slate-400 mt-0.5">
                                                                {safeFormat(order.createdAt?.toString(), "d MMM yyyy")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {showFinancials && (
                                                            <span className="text-sm font-bold text-slate-900">{Math.round(order.totalPrice || 0)} {currencySymbol}</span>
                                                        )}
                                                        <Badge className="bg-primary/5 text-primary border-none font-bold text-xs px-2 py-0.5">{order.status}</Badge>
                                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={ShoppingBag}
                                            title="Нет завершенных заказов"
                                            className="py-8"
                                        />
                                    )}
                                </div>
                            )}

                            {activeTab === "activity" && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <Activity className="w-4 h-4 text-slate-400" />
                                        <h3 className="text-xs font-semibold text-slate-400">Лента событий</h3>
                                    </div>
                                    {client.activity?.length > 0 ? (
                                        <div className="relative pl-6 space-y-3 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                            {client.activity?.map((log) => (
                                                <div key={log.id} className="relative group">
                                                    <div className="absolute -left-[23px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center z-10">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-bold text-slate-900">{log.action}</p>
                                                            <p className="text-xs font-medium text-slate-400">{safeFormat(log.createdAt, "HH:mm, dd.MM.yyyy")}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                                                {log.user?.name?.[0] || 'S'}
                                                            </div>
                                                            <p className="text-xs font-bold text-slate-500">{log.user?.name || "Система"}</p>
                                                        </div>
                                                        {log.details ? (
                                                            <div className="mt-2 p-3 rounded-xl bg-slate-50 text-xs text-slate-500 font-medium overflow-hidden">
                                                                <pre className="whitespace-pre-wrap font-sans text-xs">{JSON.stringify(log.details as Record<string, unknown>, null, 2)}</pre>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={Activity}
                                            title="История изменений пуста"
                                            className="py-8"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Meta Bottom */}
                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Регистрация: {safeFormat(client.createdAt?.toString(), "d MMMM yyyy")}</span>
                                    </div>
                                    <span className="text-primary font-mono">ID: {client.id ? client.id.slice(0, 8) : "---"}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                            <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">Данные клиента не найдены</p>
                        </div>
                    )}
                </div>
            </div>
        </ResponsiveModal>
    );
}
