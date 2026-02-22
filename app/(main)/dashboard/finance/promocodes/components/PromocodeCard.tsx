import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit3, ToggleLeft, ToggleRight, Trash2, Calendar, Percent, Coins, Truck, Gift, Banknote } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Promocode } from "../types";

interface PromocodeCardProps {
    promo: Promocode;
    currencySymbol: string;
    onEdit: (promo: Promocode) => void;
    onToggle: (id: string, current: boolean) => void;
    onDelete: (id: string) => void;
}

export function PromocodeCard({ promo, currencySymbol, onEdit, onToggle, onDelete }: PromocodeCardProps) {
    return (
        <div
            className={cn(
                "group crm-card !p-5 !rounded-[12px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                !promo.isActive && "opacity-75"
            )}
        >
            {/* High-end decorative background */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

            <div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold border",
                            promo.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                        )}>
                            {promo.isActive ? "● Активен" : "○ Пауза"}
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(promo)}
                            className="p-1.5 text-slate-400 hover:text-primary transition-colors h-8 w-8"
                        >
                            <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggle(promo.id, promo.isActive)}
                            className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors h-8 w-8"
                        >
                            {promo.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(promo.id)}
                            className="p-1.5 rounded-[var(--radius-inner)] text-slate-400 btn-destructive-ghost h-8 w-8"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="text-xs font-bold text-slate-400 mb-1">Название / Код</div>
                    <div className="mb-4">
                        <div className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                            {promo.name || "Без названия"}
                        </div>
                        <div className="text-xs font-black text-slate-400">
                            {promo.code}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-4 border-b border-slate-200">
                        <div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Выгода</div>
                            <div className="text-lg font-bold text-primary">
                                {promo.discountType === 'percentage' ? `${promo.value}%` :
                                    promo.discountType === 'fixed' ? `${promo.value} ${currencySymbol}` :
                                        promo.discountType === 'free_shipping' ? `0 ${currencySymbol}` : "GIFT"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-300 mb-1">Лимит</div>
                            <div className="text-lg font-bold text-slate-900">
                                {promo.usageCount}<span className="text-slate-200"> / </span><span className="text-slate-400">{promo.usageLimit || "∞"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <div className="text-xs font-bold text-slate-300 mb-1">Сэкономлено клиентами</div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Banknote className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-lg font-bold text-slate-900">
                                {Number(promo.totalSaved).toLocaleString('ru-RU')} {currencySymbol}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    <span className="text-xs font-bold">
                        {promo.expiresAt
                            ? formatDate(promo.expiresAt, "dd.MM.yyyy")
                            : "Бессрочно"
                        }
                    </span>
                </div>
                <div className={cn(
                    "px-2 py-0.5 rounded text-xs font-bold",
                    promo.discountType === 'percentage' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        promo.discountType === 'fixed' ? "bg-blue-50 text-blue-600 border-blue-100" :
                            promo.discountType === 'gift' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                    <div className="flex items-center gap-1">
                        {promo.discountType === 'percentage' && <Percent className="w-2.5 h-2.5" />}
                        {promo.discountType === 'fixed' && <Coins className="w-2.5 h-2.5" />}
                        {promo.discountType === 'free_shipping' && <Truck className="w-2.5 h-2.5" />}
                        {promo.discountType === 'gift' && <Gift className="w-2.5 h-2.5" />}
                        {promo.discountType === 'percentage' ? "Процент" :
                            promo.discountType === 'fixed' ? "Фикс. сумма" :
                                promo.discountType === 'gift' ? "Подарок" : "Доставка"}
                    </div>
                </div>
            </div>

        </div>
    );
}
