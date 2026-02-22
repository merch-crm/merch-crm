"use client";

import { useEffect, useState, useCallback } from "react";
import {
    Mail, Phone, MapPin, Building2, ShoppingBag,
    Edit2, CreditCard, Clock, AlertCircle,
    MessageCircle, ExternalLink,
    Plus as PlusIcon
} from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useBranding } from "@/components/branding-provider";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Pagination } from "@/components/ui/pagination";
import StatusBadgeInteractive from "../orders/status-badge-interactive";

import { getClientDetails } from "./actions/core.actions";;
import type { ClientDetails, ClientProfileOrder } from "@/lib/types";
import type { OrderStatus } from "@/lib/types/order";

interface ClientDetailPopupProps {
    clientId: string;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    showFinancials?: boolean;
}

export function ClientDetailPopup({ clientId, isOpen, onClose, onEdit, showFinancials = true }: ClientDetailPopupProps) {
    const { currencySymbol } = useBranding();
    const [client, setClient] = useState<ClientDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [ordersPage, setOrdersPage] = useState(1);
    const router = useRouter();

    const loadClient = useCallback(async (id: string) => {
        setLoading(true);
        const result = await getClientDetails(id);
        if (result.success) {
            setClient(result.data || null);
        } else {
            setClient(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen && clientId) {
            Promise.resolve().then(() => setLoading(true));
            loadClient(clientId);
        }
    }, [isOpen, clientId, loadClient]);

    if (!isOpen) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title={loading ? "Загрузка..." : (client?.name || undefined)}
            description="Детальная информация о клиенте"
            className="max-w-4xl"
        >
            <div className="flex flex-col h-full bg-white">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm font-medium text-slate-400">Загружаем данные клиента...</p>
                    </div>
                ) : client ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-6 overflow-y-auto max-h-[80vh]">
                        {/* Left Column: Basic Info - 4 cols */}
                        <div className="md:col-span-5 space-y-3">
                            {/* Entity Header */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge className="bg-primary/5 text-primary border-none font-bold text-xs px-2">
                                                {client.clientType === 'b2b' ? 'Организация' : 'Частное лицо'}
                                            </Badge>
                                        </div>
                                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{client.name}</h2>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 group">
                                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 tracking-tight">Телефон</p>
                                            <p className="text-sm font-bold text-slate-700">{client.phone || "---"}</p>
                                        </div>
                                    </div>

                                    {client.email && (
                                        <div className="flex items-center gap-3 group">
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 tracking-tight">Email</p>
                                                <p className="text-sm font-bold text-slate-700">{client.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {client.city && (
                                        <div className="flex items-center gap-3 group">
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 tracking-tight">Адрес</p>
                                                <p className="text-sm font-bold text-slate-700">{client.city}{client.address ? `, ${client.address}` : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags / Social */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-400 mb-4 px-1">Дополнительно</h3>
                                <div className="space-y-3">
                                    {client.telegram && (
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-100 group transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                                    <MessageCircle className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-blue-700">{client.telegram}</span>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-blue-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 px-1">
                                        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-600 font-bold px-3 py-1">
                                            Создан {formatDate(client.createdAt, "dd.MM.yyyy")}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 text-slate-600 font-bold px-3 py-1">
                                            Источник: {client.acquisitionSource || "---"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button className="flex-1 rounded-2xl h-12 bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-lg shadow-primary/20" onClick={() => router.push(`/dashboard/orders?clientId=${client.id}`)}>
                                    <PlusIcon className="w-4 h-4 mr-2" /> Сделать заказ
                                </Button>
                                {onEdit && (
                                    <Button variant="outline" className="rounded-2xl h-12 border-slate-200 text-slate-600 font-bold hover:bg-slate-50" onClick={onEdit}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Active Stuff - 8 cols */}
                        <div className="md:col-span-7 space-y-3">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-primary/5 rounded-3xl p-5 border border-primary/10 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary border border-primary/10">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-extrabold text-primary">Всего заказов</span>
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{client.stats.count}</p>
                                </div>
                                {showFinancials && (
                                    <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-100 shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 border border-emerald-100">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-extrabold text-emerald-600">LTV</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 leading-tight">
                                            {Math.round(Number(client.stats.total))} <span className="text-lg font-bold text-slate-400">{currencySymbol}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Orders List */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-full min-h-[400px]">
                                <div className="flex items-center justify-between mb-6 px-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">История заказов</h3>
                                    </div>
                                    <Badge className="bg-slate-100 text-slate-600 border-none font-bold">{(client.orders?.length || 0)}</Badge>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                                    {client.orders && client.orders
                                        .slice((ordersPage - 1) * 3, ordersPage * 3)
                                        .map((order: ClientProfileOrder) => (
                                            <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-primary/30 transition-all hover:bg-white hover:shadow-md group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">#{order.orderNumber || order.id.slice(0, 8)}</div>
                                                        <div className="text-xs font-bold text-slate-400 mt-0.5">Заказ за {formatDate(order.createdAt, "dd.MM.yyyy")}</div>
                                                    </div>
                                                    <StatusBadgeInteractive
                                                        orderId={order.id}
                                                        status={order.status as OrderStatus}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-900">
                                                            {showFinancials && `${order.totalPrice || 0} ${currencySymbol}`}
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-400 tracking-tight">
                                                            {formatDate(order.createdAt, "d MMMM yyyy")}
                                                        </p>
                                                    </div>
                                                    <div className="px-2 py-1 rounded-md bg-slate-50 text-xs font-bold text-slate-500 border border-slate-100">
                                                        {order.status || "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {client.orders?.length === 0 && (
                                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                            У этого клиента еще нет заказов
                                        </div>
                                    )}
                                </div>

                                {((client.orders?.length || 0) > 3) && (
                                    <div className="mt-4 pt-4 border-t border-slate-200">
                                        <Pagination
                                            totalItems={client.orders?.length || 0}
                                            pageSize={3}
                                            currentPage={ordersPage}
                                            onPageChange={setOrdersPage}
                                            itemNames={['заказ', 'заказа', 'заказов']}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50">
                        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold text-lg">Клиент не найден</p>
                        <p className="text-slate-400 text-sm mt-1">Возможно, он был удален или перемещен</p>
                    </div>
                )}
            </div>
        </ResponsiveModal>
    );
}
