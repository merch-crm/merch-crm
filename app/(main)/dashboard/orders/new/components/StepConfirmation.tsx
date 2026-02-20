"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Client } from "@/lib/types";

interface OrderInventoryItem {
    id: string;
    name: string | null;
    quantity: number;
    unit: string | null;
    sellingPrice?: number | string | null;
    price?: number;
    orderQuantity?: number;
}

interface StepConfirmationProps {
    selectedClient: Client | null;
    selectedItems: OrderInventoryItem[];
    details: {
        priority: string;
        paymentMethod: string;
        appliedPromo: {
            id: string;
            code: string;
            discountType: string;
            value: string;
            message?: string;
            calculatedDiscount?: number;
        } | null;
    };
    currencySymbol: string;
}

export function StepConfirmation({
    selectedClient,
    selectedItems,
    details,
    currencySymbol
}: StepConfirmationProps) {
    const cartTotal = selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0);
    const discount = details.appliedPromo?.calculatedDiscount || 0;
    const finalTotal = Math.max(0, Math.round(cartTotal - discount));

    return (
        <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-xl font-bold text-foreground">Подтверждение заказа</h4>

            <div className="bg-muted/50 rounded-2xl p-6 space-y-4 border border-border">
                <div className="flex justify-between border-b border-border pb-4">
                    <span className="text-muted-foreground font-bold text-xs">Клиент</span>
                    <span className="font-bold">{selectedClient?.displayName || selectedClient?.fullName}</span>
                </div>
                <div className="space-y-2">
                    <span className="text-muted-foreground font-bold text-xs">Товары</span>
                    {selectedItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                            <span>{item.name} x {item.orderQuantity || 0}</span>
                            <span className="font-bold">{(item.price || 0) * (item.orderQuantity || 0)} {currencySymbol}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between pt-4 border-t border-border text-xl font-bold">
                    <span>Итого</span>
                    <div className="text-right">
                        {details.appliedPromo ? (
                            <>
                                <span className="text-sm text-muted-foreground line-through mr-2 font-bold opacity-60">
                                    {cartTotal} {currencySymbol}
                                </span>
                                <span className="text-primary">
                                    {finalTotal} {currencySymbol}
                                </span>
                            </>
                        ) : (
                            <span>{cartTotal} {currencySymbol}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground mb-1">Приоритет</p>
                    <p className="font-bold text-sm tracking-tight">{details.priority === 'low' ? 'Низкий' : details.priority === 'medium' ? 'Средний' : 'Высокий'}</p>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-muted-foreground mb-1">Оплата</p>
                    <p className="font-bold text-sm tracking-tight">
                        {details.paymentMethod === 'cash' ? 'Наличные' :
                            details.paymentMethod === 'bank' ? 'Безнал (Карта)' :
                                details.paymentMethod === 'online' ? 'Онлайн-касса' : 'Расчетный счет'}
                    </p>
                </div>
            </div>
        </div>
    );
}
