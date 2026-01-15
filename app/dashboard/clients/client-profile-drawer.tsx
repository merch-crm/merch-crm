"use client";

import { useEffect, useState } from "react";
import {
    X, Mail, Phone, MapPin, Building2, Calendar,
    TrendingUp, ShoppingBag, Edit2, ExternalLink,
    MessageCircle, Plus, Info, Activity, User, Link as LinkIcon
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Order {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    totalPrice: number;
}

interface ActivityLog {
    id: string;
    action: string;
    createdAt: string;
    user?: {
        name: string;
    } | null;
    details?: unknown;
}

interface ClientProfile {
    id: string;
    firstName: string;
    lastName: string;
    patronymic?: string | null;
    email: string | null;
    phone: string;
    city: string | null;
    address: string | null;
    company: string | null;
    comments: string | null;
    socialLink: string | null;
    telegram: string | null;
    instagram: string | null;
    createdAt: string;
    totalOrders: number;
    totalSpent: number;
    orders: Order[];
    activity: ActivityLog[];
    manager?: {
        name: string;
    } | null;
}

interface ClientProfileDrawerProps {
    clientId: string;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    showFinancials?: boolean;
}

type TabType = "general" | "orders" | "activity";

/**
 * Safe date formatter to prevent "Invalid time value" errors
 */
const safeFormat = (dateStr: string | null | undefined, formatStr: string, options: { locale: typeof ru }) => {
    if (!dateStr) return "---";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "---";
        return format(date, formatStr, options);
    } catch {
        return "---";
    }
};

export function ClientProfileDrawer({ clientId, isOpen, onClose, onEdit, showFinancials = true }: ClientProfileDrawerProps) {
    const [client, setClient] = useState<ClientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const router = useRouter();

    useEffect(() => {
        if (isOpen && clientId) {
            setLoading(true);
            fetch(`/api/clients/${clientId}/profile`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.id) {
                        setClient(data);
                    } else {
                        setClient(null);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setClient(null);
                    setLoading(false);
                });
        }
    }, [isOpen, clientId]);

    if (!isOpen) return null;

    const fullName = client ? `${client.lastName} ${client.firstName} ${client.patronymic || ""}`.trim() : "";

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-end">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="p-8 pb-0 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex-1">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{loading ? "Загрузка..." : fullName}</h2>
                            <p className="text-xs text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Профиль клиента</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all font-bold"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Quick Action Bar */}
                    {!loading && client && client.id && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            <Button
                                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                                onClick={() => window.open(`tel:${client.phone}`)}
                            >
                                <Phone className="w-3.5 h-3.5 mr-2" /> Позвонить
                            </Button>
                            {client.telegram && (
                                <Button
                                    className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-xs"
                                    onClick={() => window.open(`https://t.me/${client.telegram?.replace('@', '')}`, '_blank')}
                                >
                                    <MessageCircle className="w-3.5 h-3.5 mr-2" /> Telegram
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="h-10 px-4 border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50"
                                onClick={() => router.push(`/dashboard/orders?clientId=${client.id}`)}
                            >
                                <Plus className="w-3.5 h-3.5 mr-2" /> Создать заказ
                            </Button>
                            {onEdit && (
                                <Button
                                    onClick={onEdit}
                                    variant="outline"
                                    className="h-10 px-4 border-indigo-100 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-50"
                                >
                                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Редактировать
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="flex gap-8">
                        {(["general", "orders", "activity"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                                    activeTab === tab
                                        ? "text-indigo-600"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab === "general" && "Общая информация"}
                                {tab === "orders" && "Заказы"}
                                {tab === "activity" && "Активность"}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full mt-auto" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Загрузка данных...</p>
                        </div>
                    ) : client ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

                            {activeTab === "general" && (
                                <div className="space-y-8">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <ShoppingBag className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Заказы</span>
                                            </div>
                                            <p className="text-3xl font-black text-slate-900">{client.totalOrders}</p>
                                        </div>

                                        {showFinancials && (
                                            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                        <TrendingUp className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LTV</span>
                                                </div>
                                                <p className="text-3xl font-black text-slate-900">{Math.round(client.totalSpent)} ₽</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <Info className="w-4 h-4 text-slate-400" />
                                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Основная информация</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                <Phone className="w-5 h-5 text-slate-300" />
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Телефон</p>
                                                    <p className="text-sm font-black text-slate-900">{client.phone}</p>
                                                </div>
                                            </div>
                                            {client.email && (
                                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                    <Mail className="w-5 h-5 text-slate-300" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Email</p>
                                                        <p className="text-sm font-black text-slate-900">{client.email}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {client.city && (
                                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                    <MapPin className="w-5 h-5 text-slate-300" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">География</p>
                                                        <p className="text-sm font-black text-slate-900">{client.city}{client.address ? `, ${client.address}` : ''}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {client.company && (
                                                <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                                    <Building2 className="w-5 h-5 text-slate-300" />
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Компания</p>
                                                        <p className="text-sm font-black text-slate-900">{client.company}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Social & Meta */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <LinkIcon className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ссылки</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {client.telegram && (
                                                    <Badge variant="outline" className="h-8 pl-1 pr-3 rounded-full border-blue-100 bg-blue-50/50 text-blue-600 gap-2 font-bold cursor-pointer hover:bg-blue-100" onClick={() => window.open(`https://t.me/${client.telegram?.replace('@', '')}`, '_blank')}>
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white"><MessageCircle className="w-3 h-3" /></div>
                                                        Telegram
                                                    </Badge>
                                                )}
                                                {client.instagram && (
                                                    <Badge variant="outline" className="h-8 pl-1 pr-3 rounded-full border-pink-100 bg-pink-50/50 text-pink-600 gap-2 font-bold cursor-pointer hover:bg-pink-100" onClick={() => window.open(`https://instagram.com/${client.instagram?.replace('@', '')}`, '_blank')}>
                                                        <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white"><ExternalLink className="w-3 h-3" /></div>
                                                        Instagram
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Менеджер</h3>
                                            </div>
                                            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-slate-700">{client.manager?.name || "Не назначен"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments */}
                                    {client.comments && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <MessageCircle className="w-4 h-4 text-slate-400" />
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Примечания</h3>
                                            </div>
                                            <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 text-slate-700 leading-relaxed font-medium text-sm">
                                                {client.comments}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "orders" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Список последних заказов</h3>
                                        <Badge className="bg-slate-100 text-slate-600 border-none font-black">{client.orders.length}</Badge>
                                    </div>
                                    {client.orders.length > 0 ? (
                                        <div className="space-y-3">
                                            {client.orders.map(order => (
                                                <a
                                                    key={order.id}
                                                    href={`/dashboard/orders/${order.id}`}
                                                    className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all group shadow-sm"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                            <ShoppingBag className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Заказ #{order.orderNumber}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                                                                {safeFormat(order.createdAt, "d MMM yyyy", { locale: ru })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {showFinancials && (
                                                            <span className="text-sm font-black text-slate-900">{Math.round(order.totalPrice)} ₽</span>
                                                        )}
                                                        <Badge className="bg-indigo-50 text-indigo-600 border-none font-black text-[10px] uppercase">{order.status}</Badge>
                                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                            <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-slate-400">Нет завершенных заказов</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "activity" && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-1">
                                        <Activity className="w-4 h-4 text-slate-400" />
                                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Лента событий</h3>
                                    </div>
                                    {client.activity && client.activity.length > 0 ? (
                                        <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                            {client.activity.map((log) => (
                                                <div key={log.id} className="relative group">
                                                    <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center z-10">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-black text-slate-900">{log.action}</p>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{safeFormat(log.createdAt, "d MMM, HH:mm", { locale: ru })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                                {log.user?.name?.[0] || 'S'}
                                                            </div>
                                                            <p className="text-[10px] font-bold text-slate-500">{log.user?.name || "Система"}</p>
                                                        </div>
                                                        {log.details ? (
                                                            <div className="mt-2 p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 font-medium overflow-hidden">
                                                                <pre className="whitespace-pre-wrap font-sans text-xs">{JSON.stringify(log.details as Record<string, unknown>, null, 2)}</pre>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                                            <Activity className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                            <p className="text-sm font-bold text-slate-400">История изменений пуста</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Meta Bottom */}
                            <div className="pt-8 border-t border-slate-100">
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Регистрация: {safeFormat(client.createdAt, "d MMMM yyyy", { locale: ru })}</span>
                                    </div>
                                    <span className="text-indigo-600">ID: {client.id ? client.id.slice(0, 8) : "---"}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100">
                            <Info className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">Данные клиента не найдены</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
