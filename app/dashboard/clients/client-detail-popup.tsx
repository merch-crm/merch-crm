"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone, MapPin, ShoppingBag, Send, Instagram, Trash2, AlertTriangle, Pencil, Check } from "lucide-react";
import { getClientDetails, deleteClient, updateClientComments } from "./actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusBadgeInteractive from "../orders/status-badge-interactive";
import { EditClientDialog } from "./edit-client-dialog";
import { Pagination } from "@/components/ui/pagination";

export function ClientDetailPopup({ clientId, isOpen, onClose, showFinancials }: { clientId: string, isOpen: boolean, onClose: () => void, showFinancials?: boolean }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [ordersPage, setOrdersPage] = useState(1);

    const [isEditingComments, setIsEditingComments] = useState(false);
    const [tempComments, setTempComments] = useState("");
    const [isSavingComments, setIsSavingComments] = useState(false);

    useEffect(() => {
        if (isOpen && clientId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoading(true);
            setDeleteError("");
            setConfirmDelete(false);
            getClientDetails(clientId).then(res => {
                if (res.data) {
                    setClient(res.data);
                    setTempComments(res.data.comments || "");
                }
                setLoading(false);
            });
        }
    }, [isOpen, clientId, refreshKey]);

    const handleSaveComments = async () => {
        setIsSavingComments(true);
        const res = await updateClientComments(clientId, tempComments);
        if (!res.error) {
            setIsEditingComments(false);
            setClient({ ...client, comments: tempComments });
        }
        setIsSavingComments(false);
    };

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
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => setShowEditDialog(true)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Редактировать клиента"
                                                    >
                                                        <Pencil className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(true)}
                                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Удалить клиента"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
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
                                        <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-3">Статистика</div>
                                        <div className="flex flex-wrap justify-end gap-5">
                                            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 min-w-[100px] text-left transition-all hover:shadow-md">
                                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Заказов</div>
                                                <div className="text-2xl font-black text-slate-900 leading-none">{client.stats.count}</div>
                                            </div>
                                            {showFinancials && (
                                                <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 min-w-[140px] text-left transition-all hover:shadow-md">
                                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Сумма</div>
                                                    <div className="text-2xl font-black text-emerald-600 leading-none">
                                                        {client.stats.total} <span className="text-lg font-bold ml-0.5">₽</span>
                                                    </div>
                                                </div>
                                            )}
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
                                                {isDeleting ? "Удаление..." : "удалить"}
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
                                                <li>
                                                    <a
                                                        href={`tel:${client.phone.replace(/\D/g, '')}`}
                                                        className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group"
                                                    >
                                                        <Phone className="w-4 h-4 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                                                        {client.phone}
                                                    </a>
                                                </li>
                                                {client.email && (
                                                    <li>
                                                        <a
                                                            href={`mailto:${client.email}`}
                                                            className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors group"
                                                        >
                                                            <Mail className="w-4 h-4 mr-3 text-indigo-500 group-hover:scale-110 transition-transform" />
                                                            {client.email}
                                                        </a>
                                                    </li>
                                                )}
                                                {client.telegram && (
                                                    <li>
                                                        <a
                                                            href={`https://t.me/${client.telegram.startsWith('@') ? client.telegram.slice(1) : client.telegram}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-sm font-medium text-slate-700 hover:text-blue-500 transition-colors group"
                                                        >
                                                            <Send className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                                                            {client.telegram}
                                                        </a>
                                                    </li>
                                                )}
                                                {client.instagram && (
                                                    <li>
                                                        <a
                                                            href={`https://instagram.com/${client.instagram.startsWith('@') ? client.instagram.slice(1) : client.instagram}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center text-sm font-medium text-slate-700 hover:text-pink-500 transition-colors group"
                                                        >
                                                            <Instagram className="w-4 h-4 mr-3 text-pink-500 group-hover:scale-110 transition-transform" />
                                                            {client.instagram}
                                                        </a>
                                                    </li>
                                                )}
                                            </ul>
                                        </section>

                                        <section>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Комментарии</h3>
                                                {!isEditingComments ? (
                                                    <button
                                                        onClick={() => setIsEditingComments(true)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Редактировать"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        <button
                                                            disabled={isSavingComments}
                                                            onClick={() => setIsEditingComments(false)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Отменить"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            disabled={isSavingComments}
                                                            onClick={handleSaveComments}
                                                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Сохранить"
                                                        >
                                                            {isSavingComments ? (
                                                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isEditingComments ? (
                                                <textarea
                                                    value={tempComments}
                                                    onChange={(e) => setTempComments(e.target.value)}
                                                    className="w-full bg-slate-50 rounded-xl p-4 border border-indigo-200 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none min-h-[100px] resize-none transition-all"
                                                    placeholder="Введите комментарий..."
                                                    autoFocus
                                                />
                                            ) : (
                                                <div
                                                    onClick={() => setIsEditingComments(true)}
                                                    className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600 whitespace-pre-wrap cursor-pointer hover:bg-slate-100/50 transition-colors group"
                                                >
                                                    {client.comments || "Нет комментариев"}
                                                    <div className="mt-2 text-[10px] text-slate-300 font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">Нажмите, чтобы редактировать</div>
                                                </div>
                                            )}
                                        </section>
                                    </div>

                                    {/* Right: Order History */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                                            История заказов
                                            <ShoppingBag className="w-4 h-4" />
                                        </h3>
                                        <div className="space-y-3">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {(client.orders || []).slice((ordersPage - 1) * 3, ordersPage * 3).map((order: any) => (
                                                <div key={order.id} className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-mono text-slate-400">#{order.id.slice(0, 8)}</span>
                                                        <StatusBadgeInteractive orderId={order.id} status={order.status} />
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900">
                                                                {order.items.length} поз. {showFinancials && `на ${order.totalAmount} ₽`}
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

                                        {client.orders.length > 3 && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                                <Pagination
                                                    totalItems={client.orders.length}
                                                    pageSize={3}
                                                    currentPage={ordersPage}
                                                    onPageChange={setOrdersPage}
                                                    itemName="заказов"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-20 text-center text-red-500">Ошибка при загрузке клиента</div>
                    )}
                </div>
            </div>
            {showEditDialog && (
                <div className="z-[70] relative">
                    <EditClientDialog
                        client={client}
                        isOpen={showEditDialog}
                        onClose={() => {
                            setShowEditDialog(false);
                            setRefreshKey(prev => prev + 1);
                        }}
                    />
                </div>
            )}
        </div>
    );
}
