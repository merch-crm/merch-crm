"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Calendar,
    Phone,
    MessageCircle,
    Plus,
    Edit2,
    Info,
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn, safeExternalOpen } from "@/lib/utils";
import { useBranding } from "@/components/branding-provider";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { useToast } from "@/components/ui/toast";
import { getClientDetails } from "./actions/core.actions";
import { ClientContactsList } from "./components/client-contacts-list";
import { setClientLoyaltyLevel } from "./actions/loyalty.actions";
import { recalculateClientStats } from "./actions/stats.actions";
import { calculateClientRFM } from "./actions/rfm.actions";
import { getClientConversations } from "../communications/actions";
import type { ClientProfile } from "@/lib/types";

import { OverviewTab } from "./components/profile/overview-tab";
import { OrdersTab } from "./components/profile/orders-tab";
import { ActivityTab } from "./components/profile/activity-tab";

export interface ClientChatPreview {
    id: string;
    channelType: string;
    channelColor?: string | null;
    channelName: string | null;
    lastMessageAt?: string | null | Date;
    lastMessagePreview?: string | null;
    unreadCount: number | null;
}

interface ClientProfileDrawerProps {
    clientId: string;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    showFinancials?: boolean;
    userRoleName?: string | null;
}

type TabType = "general" | "contacts" | "orders" | "activity";

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
    const [clientChats, setClientChats] = useState<ClientChatPreview[]>([]);
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
            getClientConversations(clientId).then(res => {
                if (res.success) setClientChats(res.data || []);
            });
        }
    }, [isOpen, clientId, loadClientProfile]);

    const handleLoyaltyChange = async (levelId: string | null, setManually: boolean) => {
        if (!client) return;
        const result = await setClientLoyaltyLevel(client.id, levelId, setManually);
        if (result.success) {
            toast("Уровень обновлён", "success");
            loadClientProfile(client.id);
        } else {
            toast(result.error || "Ошибка", "error");
        }
    };

    const handleRecalculate = async () => {
        if (!client?.id) return;
        setLoading(true);
        await recalculateClientStats(client.id);
        await calculateClientRFM(client.id);
        await loadClientProfile(client.id);
        setLoading(false);
        toast("Статистика обновлена", "success");
    };

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
                <div className="px-6 pb-0 border-b border-slate-200 flex-shrink-0">
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

                    <div className="flex gap-3">
                        {(["general", "contacts", "orders", "activity"] as const).map((tab) => {
                            if (tab === "contacts" && client?.clientType !== "b2b") return null;

                            return (
                                <button
                                    type="button"
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={cn("pb-3 text-xs font-medium transition-all relative",
                                        activeTab === tab
                                            ? "text-primary"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {tab === "general" && "Общая информация"}
                                    {tab === "contacts" && "Контакты"}
                                    {tab === "orders" && "Заказы"}
                                    {tab === "activity" && "Активность"}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full mt-auto" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3">
                            <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-medium text-slate-400">Загрузка данных...</p>
                        </div>
                    ) : client ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {activeTab === "general" && (
                                <OverviewTab
                                    client={client}
                                    userRoleName={userRoleName}
                                    onLoyaltyChange={handleLoyaltyChange}
                                    onRecalculate={handleRecalculate}
                                    clientChats={clientChats}
                                />
                            )}

                            {activeTab === "contacts" && client.clientType === "b2b" && (
                                <ClientContactsList
                                    clientId={client.id}
                                    clientType={client.clientType as "b2c" | "b2b"}
                                />
                            )}

                            {activeTab === "orders" && (
                                <OrdersTab
                                    client={client}
                                    showFinancials={showFinancials}
                                    currencySymbol={currencySymbol || "₽"}
                                />
                            )}

                            {activeTab === "activity" && (
                                <ActivityTab client={client} />
                            )}

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
