"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone, MapPin, ShoppingBag, Send, Instagram, Trash2, AlertTriangle } from "lucide-react";
import { getClientDetails, deleteClient } from "./actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusBadge from "../orders/status-badge";

export function ClientDetailPopup({ clientId, isOpen, onClose }: { clientId: string, isOpen: boolean, onClose: () => void }) {
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        if (isOpen && clientId) {
            setLoading(true);
            setDeleteError("");
            setConfirmDelete(false);
            getClientDetails(clientId).then(res => {
                if (res.data) setClient(res.data);
                setLoading(false);
            });
        }
    }, [isOpen, clientId]);

    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError("");
        const res = await deleteClient(clientId);
        if (res.error) {
            setDeleteError(res.error);
            setIsDeleting(false);
            setConfirmDelete(false);
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-slate-200">
                    <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-20 text-center text-slate-400">Загрузка данных...</div>
                    ) : client ? (
                        <div className="flex flex-col h-full max-h-[90vh]">
                            {/* Header */}
                            <div className="p-8 pr-16 border-b border-slate-100 bg-slate-50/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                                {client.lastName} {client.firstName} {client.patronymic}
                                            </h2>
                                            {!confirmDelete && (
                                                <button
                                                    onClick={() => setConfirmDelete(true)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Удалить клиента"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        {client.company && (
                                            <p className="text-lg font-medium text-indigo-600 mt-1">{client.company}</p>
                                        )}
                                        <p className="text-slate-500 text-sm mt-2 flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" /> {client.city || "Город не указан"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-2">Статистика</div>
                                        <div className="flex flex-wrap justify-end gap-3 sm:gap-4">
                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                <div className="text-slate-500 text-xs">Заказов</div>
                                                <div className="text-xl font-bold text-slate-900">{client.stats.count}</div>
                                            </div>
                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                <div className="text-slate-500 text-xs">Сумма</div>
                                                <div className="text-xl font-bold text-emerald-600">{client.stats.total} ₽</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {confirmDelete && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center text-red-700 text-sm font-medium">
                                            <AlertTriangle className="w-5 h-5 mr-3 text-red-500" />
                                            Вы уверены, что хотите удалить клиента? Все данные будут стерты.
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setConfirmDelete(false)}
                                                className="px-4 py-2 text-slate-600 hover:bg-white rounded-lg text-sm font-bold transition-colors"
                                                disabled={isDeleting}
                                            >
                                                Отмена
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Удаление..." : "Да, удалить"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {deleteError && (
                                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm flex items-start">
                                        <AlertTriangle className="w-5 h-5 mr-3 text-orange-500 shrink-0" />
                                        {deleteError}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Left: Contacts & Comments */}
                                    <div className="md:col-span-1 space-y-6">
                                        <section>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Контакты</h3>
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-sm font-medium text-slate-700">
                                                    <Phone className="w-4 h-4 mr-3 text-indigo-500" />
                                                    {client.phone}
                                                </li>
                                                {client.email && (
                                                    <li className="flex items-center text-sm font-medium text-slate-700">
                                                        <Mail className="w-4 h-4 mr-3 text-indigo-500" />
                                                        {client.email}
                                                    </li>
                                                )}
                                                {client.telegram && (
                                                    <li className="flex items-center text-sm font-medium text-slate-700">
                                                        <Send className="w-4 h-4 mr-3 text-blue-400" />
                                                        {client.telegram}
                                                    </li>
                                                )}
                                                {client.instagram && (
                                                    <li className="flex items-center text-sm font-medium text-slate-700">
                                                        <Instagram className="w-4 h-4 mr-3 text-pink-500" />
                                                        {client.instagram}
                                                    </li>
                                                )}
                                            </ul>
                                        </section>

                                        <section>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Комментарии</h3>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600 italic whitespace-pre-wrap">
                                                {client.comments || "Нет комментариев"}
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right: Order History */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                                            История заказов
                                            <ShoppingBag className="w-4 h-4" />
                                        </h3>
                                        <div className="space-y-3">
                                            {client.orders.map((order: any) => (
                                                <div key={order.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                                                        <StatusBadge status={order.status} />
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900">
                                                                {order.items.length} поз. на {order.totalAmount} ₽
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {format(new Date(order.createdAt), "dd MMM yyyy", { locale: ru })}
                                                            </div>
                                                        </div>
                                                        <a href={`/dashboard/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Подробнее</a>
                                                    </div>
                                                </div>
                                            ))}
                                            {client.orders.length === 0 && (
                                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                                    У этого клиента еще нет заказов
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 text-center text-red-500">Ошибка при загрузке клиента</div>
                    )}
                </div>
            </div>
        </div>
    );
}
