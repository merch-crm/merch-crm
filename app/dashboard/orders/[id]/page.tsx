import { notFound } from "next/navigation";
import { getOrderById } from "../actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusSelect from "./status-select";
import PrioritySelect from "./priority-select";
import { ArrowLeft, Calendar, User, Phone, MapPin, Mail, Instagram, Send, Package, Clock } from "lucide-react";
import Link from "next/link";
import OrderAttachments from "./order-attachments";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

interface OrderItem {
    id: string;
    description: string;
    quantity: number;
    price: string;
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const { data: order, error } = await getOrderById(resolvedParams.id);

    if (error || !order) {
        notFound();
    }

    const session = await getSession();
    const user = session ? await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true, department: true }
    }) : null;

    const showFinancials =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-6">
                    <Link href="/dashboard/orders" className="text-slate-400 hover:text-indigo-600 p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">Заказ #{order.id.slice(0, 8)}</h1>
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">Internal ID</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Создан {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-48">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] block mb-2 px-1">Приоритет</label>
                        <PrioritySelect orderId={order.id} currentPriority={order.priority || 'normal'} />
                    </div>
                    <div className="w-56">
                        <label className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] block mb-2 px-1">Статус заказа</label>
                        <StatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Package className="w-5 h-5 mr-3 text-indigo-500" />
                                Позиции заказа
                            </h3>
                            <span className="text-xs font-bold text-slate-400">{order.items.length} поз.</span>
                        </div>
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Наименование</th>
                                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Кол-во</th>
                                    {showFinancials && (
                                        <>
                                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Цена</th>
                                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Сумма</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {order.items.map((item: OrderItem) => (
                                    <tr key={item.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5 text-slate-900 font-semibold">{item.description}</td>
                                        <td className="px-8 py-5 text-right text-slate-600 font-medium">{item.quantity} шт</td>
                                        {showFinancials && (
                                            <>
                                                <td className="px-8 py-5 text-right text-slate-600 font-medium">{item.price} ₽</td>
                                                <td className="px-8 py-5 text-right text-slate-900 font-bold">{item.quantity * Number(item.price)} ₽</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                            {showFinancials && (
                                <tfoot className="bg-slate-50/80">
                                    <tr>
                                        <td colSpan={3} className="px-8 py-6 text-right text-sm font-bold text-slate-500 uppercase tracking-wider">Итого к оплате:</td>
                                        <td className="px-8 py-6 text-right text-2xl text-indigo-600 font-black">{order.totalAmount} ₽</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Attachments Section */}
                    <OrderAttachments orderId={order.id} attachments={order.attachments || []} />
                </div>

                {/* Sidebar: Client & Info */}
                <div className="space-y-8">
                    {/* Client Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <User className="w-5 h-5 mr-3 text-indigo-500" />
                                Клиент
                            </h3>
                            <Link href={`/dashboard/clients?id=${order.client.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Профиль</Link>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="text-xl font-bold text-slate-900 mb-1">{order.client.name}</div>
                                {order.client.company && (
                                    <div className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{order.client.company}</div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <a href={`tel:${order.client.phone}`} className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                                    <Phone className="w-4 h-4 mr-3 text-indigo-500" />
                                    {order.client.phone}
                                </a>
                                {order.client.email && (
                                    <a href={`mailto:${order.client.email}`} className="flex items-center text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
                                        <Mail className="w-4 h-4 mr-3 text-indigo-500" />
                                        {order.client.email}
                                    </a>
                                )}
                                <div className="flex gap-4 pt-1">
                                    {order.client.telegram && (
                                        <div className="flex items-center text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
                                            <Send className="w-3 h-3 mr-1.5" /> Telegram
                                        </div>
                                    )}
                                    {order.client.instagram && (
                                        <div className="flex items-center text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-lg">
                                            <Instagram className="w-3 h-3 mr-1.5" /> Instagram
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Адрес доставки</div>
                                <div className="flex items-start text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                                    {order.client.address || "Адрес не указан"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-slate-900 rounded-2xl p-8 shadow-xl text-white">
                        <h3 className="font-bold mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-3 text-indigo-400" />
                            Детали заказа
                        </h3>
                        <div className="space-y-5 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Приоритет</span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${order.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                    {order.priority === 'high' ? 'Высокий' : order.priority === 'low' ? 'Низкий' : 'Обычный'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Мягкий дедлайн</span>
                                <span className="font-bold flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                                    {order.deadline ? format(new Date(order.deadline), 'dd.MM.yyyy') : 'Не указан'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-5 border-t border-slate-800">
                                <span className="text-slate-400 font-medium">Ответственный</span>
                                <div className="flex items-center font-bold">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] mr-2 overflow-hidden">
                                        {order.creator?.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={order.creator.avatar} alt={order.creator.name} className="w-full h-full object-cover" />
                                        ) : (
                                            order.creator?.name?.[0]
                                        )}
                                    </div>
                                    {order.creator?.name}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
