import { notFound } from "next/navigation";
import { getClientDetails } from "../actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, Instagram, Send, Package, ShoppingBag, CreditCard, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";
import { OrderHistoryTable } from "./order-history-table";

export default async function ClientPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const { data: client, error } = await getClientDetails(resolvedParams.id);
    const branding = await getBrandingSettings();
    const currencySymbol = branding?.currencySymbol || "₽";

    if (error || !client) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-6">
                    <Link href="/dashboard/clients" className="text-slate-400 hover:text-primary p-2.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
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
                        <span className="text-xs font-bold  tracking-wider">Баланс / Долг</span>
                    </div>
                    <div className={`text-2xl font-bold ${(client.stats?.balance || 0) < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {Math.round(client.stats?.balance || 0).toLocaleString('ru-RU')} {currencySymbol}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-500 mb-2">
                        <Send className="w-5 h-5" />
                        <span className="text-xs font-bold  tracking-wider">Источник привлечения</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{client.acquisitionSource || "Не указан"}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--crm-grid-gap)]">
                {/* Main Content: Orders History */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="text-xs font-bold  tracking-wider">Всего заказов</span>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{client.stats?.count || 0}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <CreditCard className="w-5 h-5" />
                                <span className="text-xs font-bold  tracking-wider">Общая сумма</span>
                            </div>
                            <div className="text-2xl font-bold text-primary">{Math.round(Number(client.stats?.total || 0)).toLocaleString()} {currencySymbol}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <Calendar className="w-5 h-5" />
                                <span className="text-xs font-bold  tracking-wider">Последний заказ</span>
                            </div>
                            <div className="text-xl font-bold text-slate-900">
                                {client.orders && client.orders.length > 0
                                    ? format(new Date(client.orders[0].createdAt), "d MMM yyyy", { locale: ru })
                                    : "Нет заказов"}
                            </div>
                        </div>
                    </div>

                    <OrderHistoryTable orders={client.orders || []} currencySymbol={currencySymbol} />
                </div>

                {/* Sidebar: Contact Info */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <User className="w-5 h-5 mr-3 text-primary" />
                                Контакты
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center py-6 border-b border-slate-200">
                                <Avatar className="w-24 h-24 mb-4 ring-4 ring-slate-50">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                                    <AvatarFallback>{client.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-xl font-bold text-slate-900 text-center">{client.name}</div>
                                <div className="text-sm text-slate-500 text-center mt-1">{client.clientType === 'b2b' ? 'Компания' : 'Частное лицо'}</div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center text-sm font-medium text-slate-700">
                                    <Phone className="w-4 h-4 mr-3 text-primary" />
                                    {client.phone}
                                </div>
                                {client.email && (
                                    <div className="flex items-center text-sm font-medium text-slate-700">
                                        <Mail className="w-4 h-4 mr-3 text-primary" />
                                        {client.email}
                                    </div>
                                )}
                                <div className="flex gap-4 pt-1">
                                    {client.telegram && (
                                        <a href={`https://t.me/${client.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-blue-500 bg-blue-50 px-3 py-2 rounded-2xl hover:bg-blue-100 transition-colors">
                                            <Send className="w-3 h-3 mr-2" /> Telegram
                                        </a>
                                    )}
                                    {client.instagram && (
                                        <a href={`https://instagram.com/${client.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold text-pink-500 bg-pink-50 px-3 py-2 rounded-2xl hover:bg-pink-100 transition-colors">
                                            <Instagram className="w-3 h-3 mr-2" /> Instagram
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="text-[10px] font-bold text-slate-400  tracking-normal mb-2">Адрес</div>
                                <div className="flex items-start text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                                    {client.city ? `${client.city}, ` : ''}{client.address || "Адрес не указан"}
                                </div>
                            </div>

                            {client.comments && (
                                <div className="pt-4 border-t border-slate-200">
                                    <div className="text-[10px] font-bold text-slate-400  tracking-normal mb-2">Комментарий</div>
                                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
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
