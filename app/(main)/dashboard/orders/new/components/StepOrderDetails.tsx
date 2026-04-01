"use client";

import React from"react";
import { AlertCircle, CreditCard, Tag } from"lucide-react";
import { cn } from"@/lib/utils";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SwitchRow } from "@/components/ui/switch-row";
import { useIsClient } from "@/hooks/use-is-client";

interface StepOrderDetailsProps {
    details: {
        priority: string;
        isUrgent: boolean;
        deadline: string;
        advanceAmount: string;
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
    onUpdateDetails: (updates: Partial<StepOrderDetailsProps["details"]>) => void;
    promoInput: string;
    onPromoInputChange: (val: string) => void;
    onApplyPromo: () => void;
    isApplyingPromo: boolean;
    currencySymbol: string;
}

export function StepOrderDetails({
    details,
    onUpdateDetails,
    promoInput,
    onPromoInputChange,
    onApplyPromo,
    isApplyingPromo,
    currencySymbol
}: StepOrderDetailsProps) {
    const isClient = useIsClient();
    return (
        <div className="max-w-2xl space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-lg font-bold text-foreground">Детали заказа</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1">Приоритет</label>
                    <Select
                        value={details.priority}
                        onChange={(val: string) => onUpdateDetails({ priority: val })}
                        options={[
                            { id:"low", title:"Низкий" },
                            { id:"medium", title:"Средний" },
                            { id:"high", title:"Высокий" }
                        ]}
                        placeholder="Выберите приоритет"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="order-deadline" className="text-xs font-bold text-muted-foreground ml-1">Дедлайн</label>
                    <Input
                        id="order-deadline"
                        type="date"
                        min={isClient ? new Date().toISOString().split('T')[0] : undefined} // suppressHydrationWarning
                        value={details.deadline}
                        onChange={(e) => onUpdateDetails({ deadline: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1">Срочный заказ</label>
                    <SwitchRow
                        icon={AlertCircle}
                        title="Срочный заказ"
                        description=""
                        checked={details.isUrgent}
                        onCheckedChange={(val) => onUpdateDetails({ isUrgent: val })}
                        variant="success"
                        className={cn("h-12 px-4 transition-all duration-300",
                            details.isUrgent ?"bg-rose-50/50 border-rose-200" :"bg-slate-50 border-slate-200"
                        )}
                        iconClassName={cn("w-8 h-8 rounded-lg transition-colors duration-300",
                            details.isUrgent ?"bg-rose-100 text-rose-600 border-rose-200" :"bg-white text-slate-400 border-slate-100"
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground ml-1">Способ оплаты</label>
                    <Select
                        value={details.paymentMethod}
                        onChange={(val: string) => onUpdateDetails({ paymentMethod: val })}
                        options={[
                            { id:"cash", title:"Наличные" },
                            { id:"bank", title:"Безнал (Карта)" },
                            { id:"online", title:"Онлайн-касса" },
                            { id:"account", title:"Расчетный счет" }
                        ]}
                        placeholder="Выберите способ оплаты"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground ml-1">Предоплата ({currencySymbol})</label>
                <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                        id="order-advance"
                        type="number"
                        value={details.advanceAmount}
                        onChange={(e) => onUpdateDetails({ advanceAmount: e.target.value })}
                        className="pl-12"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-muted-foreground ml-1">Промокод</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Tag className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Введите промокод..."
                            value={promoInput}
                            onChange={(e) => onPromoInputChange(e.target.value)}
                            className="pl-12"
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={onApplyPromo}
                        disabled={isApplyingPromo || !promoInput}
                        variant="secondary"
                        className="h-12 px-6"
                    >
                        {isApplyingPromo ?"..." :"Применить"}
                    </Button>
                </div>
                {details.appliedPromo && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs font-bold text-emerald-700 flex items-center justify-between">
                            <span>Промокод: {details.appliedPromo.code}</span>
                            <span>
                                {details.appliedPromo.discountType === 'percentage' ? `-${details.appliedPromo.value}%` :
                                    details.appliedPromo.discountType === 'fixed' ? `-${details.appliedPromo.value} ${currencySymbol}` :
                                        details.appliedPromo.discountType === 'free_shipping' ?"БЕСПЛ. ДОСТАВКА" :"ПОДАРОК"}
                            </span>
                        </p>
                        {details.appliedPromo.message && (
                            <p className="text-xs text-emerald-600 font-medium mt-1 italic">{details.appliedPromo.message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
