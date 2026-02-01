import { notFound } from "next/navigation";
import { getOrderById } from "../actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StatusSelect from "./status-select";
import PrioritySelect from "./priority-select";
import { ArrowLeft, Calendar, User, Phone, MapPin, Mail, Instagram, Send, Package, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import OrderAttachments from "./order-attachments";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { RefundDialog } from "./refund-dialog";
import { Wallet, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import OrderActions from "./order-actions";

interface OrderItem {
    id: string;
    description: string;
    quantity: number;
    price: string;
}

interface OrderPayment {
    id: string;
    amount: string;
    comment: string | null;
    isAdvance: boolean;
    createdAt: string | Date;
    method: string;
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

    const canDelete = user?.role?.name === "Администратор" || user?.department?.name === "Руководство";
    const canArchive = canDelete || ["Отдел продаж"].includes(user?.department?.name || "");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[18px] border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-6">
                    <Link href="/dashboard/orders" className="text-slate-400 hover:text-primary p-2.5 rounded-[18px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900">Заказ #{order.id.slice(0, 8)}</h1>
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-bold  tracking-wider">Internal ID</span>
                        </div>
                        <p className="text-slate-500 text-sm mt-1">
                            Создан {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <OrderActions
                        orderId={order.id}
                        isArchived={order.isArchived}
                        canDelete={canDelete}
                        canArchive={canArchive}
                    />
                    <div className="w-px h-12 bg-slate-100 mx-2" />
                    <div className="flex gap-4">
                        <div className="w-48">
                            <label className="text-sm font-bold text-slate-500 ml-1">Приоритет</label>
                            <PrioritySelect orderId={order.id} currentPriority={order.priority || 'normal'} />
                        </div>
                        <div className="w-56">
                            <label className="text-sm font-bold text-slate-500 ml-1">Статус заказа</label>
                            <StatusSelect orderId={order.id} currentStatus={order.status} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Reason Alert */}
            {order.status === 'cancelled' && order.cancelReason && (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-[18px] p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                            <XCircle className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-rose-900 mb-1">Заказ отменен</h3>
                            <p className="text-sm text-rose-700 font-medium leading-relaxed">{order.cancelReason}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--crm-grid-gap)]">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Package className="w-5 h-5 mr-3 text-primary" />
                                Позиции заказа
                            </h3>
                            <span className="text-xs font-bold text-slate-400">{order.items.length} поз.</span>
                        </div>
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400  tracking-wider">Наименование</th>
                                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400  tracking-wider">Кол-во</th>
                                    {showFinancials && (
                                        <>
                                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400  tracking-wider">Цена</th>
                                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400  tracking-wider">Сумма</th>
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
                                        <td colSpan={3} className="px-8 py-6 text-right text-sm font-bold text-slate-500  tracking-wider">Итого к оплате:</td>
                                        <td className="px-8 py-6 text-right text-2xl text-primary font-bold">{order.totalAmount} ₽</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Attachments Section */}
                    <OrderAttachments orderId={order.id} attachments={order.attachments || []} />
                </div>

                {/* Sidebar: Client & Info */}
                <div className="space-y-4">
                    {/* Client Card */}
                    <div className="bg-white rounded-[18px] border border-slate-200 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <User className="w-5 h-5 mr-3 text-primary" />
                                Клиент
                            </h3>
                            <Link href={`/dashboard/clients?id=${order.client.id}`} className="text-xs font-bold text-primary hover:text-primary/80">Профиль</Link>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="text-xl font-bold text-slate-900 mb-1">{order.client.name}</div>
                                {order.client.company && (
                                    <div className="text-sm font-bold text-primary  tracking-wider">{order.client.company}</div>
                                )}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                {["Печатник", "Дизайнер"].includes(user?.role?.name || "") ? (
                                    <div className="flex items-center text-sm font-medium text-slate-400 cursor-not-allowed">
                                        <Phone className="w-4 h-4 mr-3 text-slate-300" />
                                        HIDDEN
                                    </div>
                                ) : (
                                    <a href={`tel:${order.client.phone}`} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                                        <Phone className="w-4 h-4 mr-3 text-primary" />
                                        {order.client.phone}
                                    </a>
                                )}
                                {order.client.email && (
                                    <a href={`mailto:${order.client.email}`} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                                        <Mail className="w-4 h-4 mr-3 text-primary" />
                                        {order.client.email}
                                    </a>
                                )}
                                <div className="flex gap-4 pt-1">
                                    {order.client.telegram && (
                                        <div className="flex items-center text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-[18px]">
                                            <Send className="w-3 h-3 mr-1.5" /> Telegram
                                        </div>
                                    )}
                                    {order.client.instagram && (
                                        <div className="flex items-center text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-[18px]">
                                            <Instagram className="w-3 h-3 mr-1.5" /> Instagram
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="text-sm font-bold text-slate-500 ml-1">Адрес доставки</div>
                                <div className="flex items-start text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 mr-3 text-slate-300 shrink-0" />
                                    {order.client.address || "Адрес не указан"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Block (Visible to Admin/Sales) */}
                    {showFinancials && (
                        <div className="bg-white rounded-[18px] border border-slate-200 p-8 shadow-sm">
                            <h3 className="font-bold text-slate-900 flex items-center mb-6">
                                <Wallet className="w-5 h-5 mr-3 text-primary" />
                                Финансы
                            </h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Общая сумма:</span>
                                    <span className="font-bold text-slate-900">{order.totalAmount} ₽</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Оплачено:</span>
                                    <span className="font-bold text-emerald-600">
                                        {order.payments?.reduce((acc: number, p: OrderPayment) => acc + Number(p.amount), 0).toFixed(2) || 0} ₽
                                    </span>
                                </div>
                                <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-900  tracking-wider">Остаток:</span>
                                    <span className="text-xl font-bold text-rose-600">
                                        {(Number(order.totalAmount) - (order.payments?.reduce((acc: number, p: OrderPayment) => acc + Number(p.amount), 0) || 0)).toFixed(2)} ₽
                                    </span>
                                </div>

                                {/* Payment History */}
                                {order.payments && order.payments.length > 0 && (
                                    <div className="mt-8 space-y-3">
                                        <div className="text-sm font-bold text-slate-500 ml-1 mb-2 flex items-center">
                                            <Receipt className="w-3 h-3 mr-2" />
                                            История платежей
                                        </div>
                                        {order.payments.map((p: OrderPayment) => (
                                            <div key={p.id} className="flex justify-between items-center p-3 rounded-[18px] bg-slate-50 border border-slate-200">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-slate-900 truncate">{p.comment || (p.isAdvance ? "Предоплата" : "Платеж")}</div>
                                                    <div className="text-[10px] text-slate-400">{format(new Date(p.createdAt), "dd.MM.yy HH:mm")} • {p.method}</div>
                                                </div>
                                                <div className={cn("text-xs font-bold shrink-0 ml-2", Number(p.amount) < 0 ? "text-rose-600" : "text-slate-900")}>
                                                    {p.amount} ₽
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-6">
                                    <RefundDialog
                                        orderId={order.id}
                                        maxAmount={order.payments?.reduce((acc: number, p: OrderPayment) => acc + Number(p.amount), 0) || 0}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="bg-slate-900 rounded-[18px] p-8 shadow-xl text-white">
                        <h3 className="font-bold mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-3 text-primary" />
                            Детали заказа
                        </h3>
                        <div className="space-y-5 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Приоритет</span>
                                <span className={`px-2 py-1 rounded-[18px] text-xs font-bold  tracking-wider ${order.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-300'
                                    }`}>
                                    {order.priority === 'high' ? 'Высокий' : order.priority === 'low' ? 'Низкий' : 'Обычный'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400 font-medium">Мягкий дедлайн</span>
                                <span className="font-bold flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    {order.deadline ? format(new Date(order.deadline), 'dd.MM.yyyy') : 'Не указан'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-5 border-t border-slate-800">
                                <span className="text-slate-400 font-medium">Ответственный</span>
                                <div className="flex items-center font-bold">
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] mr-2 overflow-hidden">
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
