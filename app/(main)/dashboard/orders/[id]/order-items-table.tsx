"use client";

import { Package } from "lucide-react";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { pluralize } from "@/lib/pluralize";


interface OrderItem {
    id: string;
    description: string | null;
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
    const safeItems = items || [];
    return (
        <div className="crm-card !p-0 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center">
                    <Package className="w-5 h-5 mr-3 text-primary" />
                    Позиции заказа
                </h3>
                <span className="text-xs font-bold text-slate-400">{safeItems.length} {pluralize(safeItems.length, 'позиция', 'позиции', 'позиций')}</span>
            </div>

            <ResponsiveDataView
                data={safeItems}
                renderTable={() => (
                    <table className="crm-table">
                        <thead className="crm-thead">
                            <tr>
                                <th className="crm-th">Наименование</th>
                                <th className="crm-th crm-td-number">Кол-во</th>
                                {showFinancials && (
                                    <>
                                        <th className="crm-th crm-td-number">Цена</th>
                                        <th className="crm-th crm-td-number">Сумма</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="crm-tbody">
                            {safeItems.map((item) => (
                                <tr key={item.id} className="crm-tr">
                                    <td className="crm-td font-semibold text-slate-900">{item.description || "Без названия"}</td>
                                    <td className="crm-td crm-td-number">{item.quantity} шт</td>
                                    {showFinancials && (
                                        <>
                                            <td className="crm-td crm-td-number">{item.price} {currencySymbol}</td>
                                            <td className="crm-td crm-td-number font-bold text-slate-900">{item.quantity * Number(item.price)} {currencySymbol}</td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        {showFinancials && (
                            <tfoot className="bg-slate-50/80">
                                {Number(discountAmount || 0) > 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-3 text-right text-xs font-bold text-slate-400 border-t border-slate-100">Скидка:</td>
                                        <td className="px-8 py-3 text-right text-sm text-rose-500 font-bold border-t border-slate-100">-{discountAmount} {currencySymbol}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan={3} className="px-8 py-6 text-right text-sm font-bold text-slate-500">Итого к оплате:</td>
                                    <td className="px-8 py-6 text-right text-2xl text-primary font-bold">{totalAmount} {currencySymbol}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                )}
                renderCard={(item) => (
                    <div key={item.id} className="crm-card  space-y-3">
                        <div className="text-sm font-bold text-slate-900">{item.description || "Без названия"}</div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                            <div className="text-xs text-slate-500">Количество: <span className="font-bold text-slate-700">{item.quantity} шт</span></div>
                            {showFinancials && (
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-bold">Сумма</div>
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
                            <span className="text-xs font-bold text-slate-400">Скидка:</span>
                            <span className="text-sm text-rose-500 font-bold">-{discountAmount} {currencySymbol}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500">Итого к оплате:</span>
                        <span className="text-2xl text-primary font-bold">{totalAmount} {currencySymbol}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
