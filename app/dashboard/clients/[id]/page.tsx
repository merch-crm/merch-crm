import { notFound } from "next/navigation";
import { getClientDetails } from "../actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, Instagram, Send, Package, ShoppingBag, CreditCard, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function ClientPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const { data: client, error } = await getClientDetails(resolvedParams.id);

    if (error || !client) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-6">
                    <Link href="/dashboard/clients" className="text-slate-400 hover:text-indigo-600 p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {client.company || "Частное лицо"} • Добавлен {format(new Date(client.createdAt), "d MMMM yyyy", { locale: ru })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    {/* Actions can reside here later */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Баланс / Долг</span>
                    </div>
                    <div className={`text-2xl font-black ${(client.stats?.balance || 0) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(client.stats?.balance || 0)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Send className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Источник привлечения</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{client.acquisitionSource || "Не указан"}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Orders History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Всего заказов</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">{client.stats?.count || 0}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <CreditCard className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Общая сумма</span>
                            </div>
                            <div className="text-2xl font-black text-indigo-600">{Math.round(Number(client.stats?.total || 0)).toLocaleString()} ₽</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <Calendar className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider">Последний заказ</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900">
                                {client.orders && client.orders.length > 0
                                    ? format(new Date(client.orders[0].createdAt), "d MMM yyyy", { locale: ru })
                                    : "Нет заказов"}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Package className="w-5 h-5 mr-3 text-indigo-500" />
                                История заказов
                            </h3>
                        </div>
                        {client.orders && client.orders.length > 0 ? (
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Номер</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Дата</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Статус</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Сумма</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {client.orders.map((order: any) => (
                                        <tr key={order.id} className="text-sm hover:bg-slate-50/50 transition-colors cursor-pointer block sm:table-row" onClick={() => { }}>
                                            {/* Row click needs client component or Link wrapper, for now simpler */}
                                            <td className="px-6 py-5 font-bold text-slate-900">
                                                <Link href={`/dashboard/orders/${order.id}`} className="hover:text-indigo-600 underline decoration-indigo-200 underline-offset-4">
                                                    ORD-{order.orderNumber?.split('-')[2] || order.id.slice(0, 6)}
                                                </Link>
                                            </td>
                                            <td className="px-6 py-5 text-slate-500">
                                                {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right font-bold text-slate-900">
                                                {order.totalAmount} ₽
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center text-slate-500">
                                История заказов пуста
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar: Contact Info */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <User className="w-5 h-5 mr-3 text-indigo-500" />
                                Контакты
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center py-6 border-b border-slate-100">
                                <Avatar className="w-24 h-24 mb-4 ring-4 ring-slate-50">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                                    <AvatarFallback>{client.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-xl font-bold text-slate-900 text-center">{client.name}</div>
                                <div className="text-sm text-slate-500 text-center mt-1">{client.clientType === 'b2b' ? 'Компания' : 'Частное лицо'}</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center text-sm font-medium text-slate-700">
                                    <Phone className="w-4 h-4 mr-3 text-indigo-500" />
                                    {client.phone}
                                </div>
                                {client.email && (
                                    <div className="flex items-center text-sm font-medium text-slate-700">
                                        <Mail className="w-4 h-4 mr-3 text-indigo-500" />
                                        {client.email}
                                    </div>
                                )}
                                <div className="flex gap-4 pt-1">
                                    {client.telegram && (
                                        <a href={`https://t.me/${client.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-blue-500 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                            <Send className="w-3 h-3 mr-2" /> Telegram
                                        </a>
                                    )}
                                    {client.instagram && (
                                        <a href={`https://instagram.com/${client.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-pink-500 bg-pink-50 px-3 py-2 rounded-xl hover:bg-pink-100 transition-colors">
                                            <Instagram className="w-3 h-3 mr-2" /> Instagram
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Адрес</div>
                                <div className="flex items-start text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                                    {client.city ? `${client.city}, ` : ''}{client.address || "Адрес не указан"}
                                </div>
                            </div>

                            {client.comments && (
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Комментарий</div>
                                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                                        &quot;{client.comments}&quot;
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
