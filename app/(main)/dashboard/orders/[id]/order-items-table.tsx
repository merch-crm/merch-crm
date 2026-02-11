"use client";

import { Package, ChevronRight } from "lucide-react";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { cn } from "@/lib/utils";

interface OrderItem {
    id: string;
    description: string;
    quantity: number;
    price: string;
}

interface OrderItemsTableProps {
    items: OrderItem[];
    currencySymbol: string;
    showFinancials: boolean;
    totalAmount: string | number;
    discountAmount?: string | number | null;
}

export function OrderItemsTable({ items, currencySymbol, showFinancials, totalAmount, discountAmount }: OrderItemsTableProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center">
                    <Package className="w-5 h-5 mr-3 text-primary" />
                    Позиции заказа
                </h3>
                <span className="text-xs font-bold text-slate-400">{items.length} поз.</span>
            </div>

            <ResponsiveDataView
                data={items}
                renderTable={() => (
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 tracking-wider">Наименование</th>
                                <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 tracking-wider">Кол-во</th>
                                {showFinancials && (
                                    <>
                                        <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 tracking-wider">Цена</th>
                                        <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 tracking-wider">Сумма</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {items.map((item) => (
                                <tr key={item.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 text-slate-900 font-semibold">{item.description}</td>
                                    <td className="px-8 py-5 text-right text-slate-600 font-medium">{item.quantity} шт</td>
                                    {showFinancials && (
                                        <>
                                            <td className="px-8 py-5 text-right text-slate-600 font-medium">{item.price} {currencySymbol}</td>
                                            <td className="px-8 py-5 text-right text-slate-900 font-bold">{item.quantity * Number(item.price)} {currencySymbol}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        {showFinancials && (
                            <tfoot className="bg-slate-50/80">
                                {Number(discountAmount || 0) > 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-3 text-right text-xs font-bold text-slate-400 tracking-wider border-t border-slate-100">Скидка:</td>
                                        <td className="px-8 py-3 text-right text-sm text-rose-500 font-bold border-t border-slate-100">-{discountAmount} {currencySymbol}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan={3} className="px-8 py-6 text-right text-sm font-bold text-slate-500 tracking-wider">Итого к оплате:</td>
                                    <td className="px-8 py-6 text-right text-2xl text-primary font-bold">{totalAmount} {currencySymbol}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                )}
                renderCard={(item) => (
                    <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
                        <div className="text-sm font-bold text-slate-900">{item.description}</div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <div className="text-xs text-slate-500">Количество: <span className="font-bold text-slate-700">{item.quantity} шт</span></div>
                            {showFinancials && (
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-tight font-bold">Сумма</div>
                                    <div className="text-base font-bold text-primary">{item.quantity * Number(item.price)} {currencySymbol}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                mobileGridClassName="grid grid-cols-1 gap-3 p-4 bg-slate-50/30"
            />

            {showFinancials && (
                <div className="sm:hidden px-6 py-6 border-t border-slate-100 bg-slate-50/80">
                    {Number(discountAmount || 0) > 0 && (
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Скидка:</span>
                            <span className="text-sm text-rose-500 font-bold">-{discountAmount} {currencySymbol}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Итого к оплате:</span>
                        <span className="text-2xl text-primary font-bold">{totalAmount} {currencySymbol}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
