import { notFound } from "next/navigation";
import { getClientDetails } from "../actions/core.actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import {
    ArrowLeft, Phone, Mail, MapPin, Instagram, Send,
    ShoppingBag, CreditCard, Calendar, Plus,
    History, Wallet, ExternalLink, MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getBrandingSettings } from "@/app/(main)/admin-panel/actions";
import { OrderHistoryTable } from "./order-history-table";
import { ClientTimeline } from "./client-timeline";
import { ClientProfileActions } from "./client-profile-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function ClientPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const result = await getClientDetails(resolvedParams.id);
    const branding = await getBrandingSettings();
    const currencySymbol = branding?.currencySymbol || "₽";

    if (!result.success || !result.data) {
        notFound();
    }

    const client = result.data;
    const balance = Math.round(client.stats?.balance || 0);

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/clients">
                        <Button variant="outline" size="icon" className="group rounded-2xl border-slate-200">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Карточка клиента</h1>
                        <p className="text-slate-400 text-xs font-bold mt-2 flex items-center gap-2">
                            ID: {client.id.slice(0, 8)} • <Badge variant="secondary" className="text-xs font-bold">{client.clientType === 'b2b' ? 'B2B' : 'B2C'}</Badge>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/orders/new?clientId=${client.id}`}>
                        <Button variant="btn-dark" className="rounded-2xl gap-2 shadow-lg shadow-slate-900/10 active:scale-95 transition-all">
                            <Plus className="w-4 h-4" />
                            Оформить заказ
                        </Button>
                    </Link>
                    <ClientProfileActions client={client} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
                    {/* Contact Profile Card */}
                    <div className="crm-card !p-0 overflow-hidden !rounded-[32px] border-none shadow-xl shadow-slate-200/50">
                        <div className="relative h-32 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                            <div className="absolute top-4 right-4">
                                <Badge className={balance < 0 ? "bg-rose-500" : "bg-emerald-500"}>
                                    {balance < 0 ? 'Должник' : 'Активен'}
                                </Badge>
                            </div>
                        </div>

                        <div className="px-8 pb-8 -mt-12 relative flex flex-col items-center">
                            <Avatar className="w-24 h-24 ring-8 ring-white shadow-2xl mb-4 bg-white">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}&backgroundColor=f8fafc`} />
                                <AvatarFallback className="text-2xl font-black">{client.name?.[0]}</AvatarFallback>
                            </Avatar>

                            <h2 className="text-xl font-black text-slate-900 text-center">{client.name}</h2>
                            <p className="text-slate-400 text-sm font-bold mt-1 text-center">
                                {client.company || "Частное лицо"}
                            </p>

                            <div className="w-full mt-8 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group hover:bg-white hover:border-primary/20 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                            <Phone className="w-4 h-4 text-primary" />
                                        </div>
                                        <span className="text-xs font-black text-slate-600 tracking-tight">{client.phone}</span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                                </div>

                                {client.email && (
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 group hover:bg-white hover:border-primary/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                                                <Mail className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            <span className="text-xs font-black text-slate-600 tracking-tight truncate max-w-[150px]">{client.email}</span>
                                        </div>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center gap-3 mt-6">
                                {client.telegram && (
                                    <a href={`https://t.me/${client.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                                        <Send className="w-5 h-5" />
                                    </a>
                                )}
                                {client.instagram && (
                                    <a href={`https://instagram.com/${client.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white transition-all shadow-sm">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}
                                <Button variant="outline" size="icon" className="w-10 h-10 rounded-full text-green-600 bg-green-50 border-none hover:bg-green-500 hover:text-white">
                                    <MessageCircle className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="crm-card !p-8 !rounded-[32px] space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate-300">Адрес доставки</span>
                            <div className="flex items-start gap-4 mt-3">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-900 leading-snug">
                                    {client.city ? `${client.city}, ` : ''}{client.address || "Адрес не указан"}
                                </p>
                            </div>
                        </div>

                        {client.comments && (
                            <div className="pt-6 border-t border-slate-100">
                                <span className="text-xs font-bold text-slate-300">Особые отметки</span>
                                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mt-3 text-xs font-bold text-amber-700 leading-relaxed italic">
                                    &ldquo;{client.comments}&rdquo;
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Источник</span>
                            <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-500 font-black">{client.acquisitionSource || "—"}</Badge>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-8 flex flex-col gap-4">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Заказов', value: client.stats?.count || 0, icon: ShoppingBag, color: 'text-blue-500' },
                            { label: 'Сумма', value: `${Math.round(client.stats?.total || 0).toLocaleString()} ${currencySymbol}`, icon: CreditCard, color: 'text-indigo-500' },
                            { label: 'Баланс', value: `${balance.toLocaleString()} ${currencySymbol}`, icon: Wallet, color: balance < 0 ? 'text-rose-500' : 'text-emerald-500' },
                            { label: 'Партнерство', value: format(new Date(client.createdAt), "MM/yy", { locale: ru }), icon: Calendar, color: 'text-slate-400' }
                        ].map((stat, i) => (
                            <div key={i} className="crm-card !p-5 !rounded-3xl border-none shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-2">
                                    <stat.icon className={cn("w-4 h-4", stat.color)} />
                                    <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                                </div>
                                <div className="text-lg font-black text-slate-900">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="w-full sm:w-auto mb-4">
                            <TabsTrigger value="orders" className="flex-1 sm:flex-none gap-2">
                                <ShoppingBag className="w-4 h-4" />
                                Заказы
                            </TabsTrigger>
                            <TabsTrigger value="activity" className="flex-1 sm:flex-none gap-2">
                                <History className="w-4 h-4" />
                                Активность
                            </TabsTrigger>
                            <TabsTrigger value="finance" className="flex-1 sm:flex-none gap-2">
                                <Wallet className="w-4 h-4" />
                                Финансы
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="orders" className="mt-0">
                            <OrderHistoryTable orders={client.orders || []} currencySymbol={currencySymbol} />
                        </TabsContent>

                        <TabsContent value="activity" className="mt-4">
                            <ClientTimeline activity={client.activity || []} />
                        </TabsContent>

                        <TabsContent value="finance" className="mt-0">
                            <div className="crm-card !p-12 text-center text-slate-500 rounded-3xl border-dashed">
                                <Wallet className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                <h3 className="text-lg font-black text-slate-900">Финансовый профиль</h3>
                                <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">Детальная история платежей и расчетов будет доступна в следующем обновлении CRM.</p>
                                <Button variant="outline" className="mt-6 rounded-2xl border-slate-200">Перейти в раздел Финансы</Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
