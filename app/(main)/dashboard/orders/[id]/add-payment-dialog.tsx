"use client";

import { useState } from "react";
import { PlusCircle, Loader2, HandCoins } from "lucide-react";
import { addPayment } from "../actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";

interface AddPaymentDialogProps {
    orderId: string;
    remainingAmount: number;
}

export function AddPaymentDialog({ orderId, remainingAmount }: AddPaymentDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState<string>(remainingAmount > 0 ? String(remainingAmount) : "");
    const [method, setMethod] = useState<string>("cash");
    const [isAdvance, setIsAdvance] = useState(false);
    const [comment, setComment] = useState("");
    const { toast } = useToast();

    if (remainingAmount <= 0) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;

        setLoading(true);
        try {
            const res = await addPayment(orderId, Number(amount), method, isAdvance, comment);
            if (res.success) {
                toast("Оплата добавлена", "success");
                playSound("payment_received");
                setIsOpen(false);
                setAmount("");
                setComment("");
            } else {
                toast(res.error || "Ошибка", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка соединения", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[18px] bg-emerald-50 text-emerald-600 font-bold text-sm hover:bg-emerald-100 transition-all active:scale-[0.98] border border-emerald-100"
            >
                <PlusCircle className="w-4 h-4" />
                Внести оплату / Аванс
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                        <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <HandCoins className="w-5 h-5 text-emerald-500" />
                                Внесение оплаты
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-all"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Сумма (Остаток: {remainingAmount} ₽)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full h-12 px-4 rounded-[14px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-lg focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Способ оплаты</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: "cash", label: "Наличные" },
                                        { id: "bank", label: "Карта/Банк" },
                                        { id: "online", label: "Онлайн" },
                                        { id: "account", label: "Р/С" },
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setMethod(m.id)}
                                            className={`py-2.5 rounded-[12px] text-xs font-bold transition-all border ${method === m.id
                                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-[14px] border border-slate-100 cursor-pointer" onClick={() => setIsAdvance(!isAdvance)}>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isAdvance ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"}`}>
                                    {isAdvance && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className="text-xs font-bold text-slate-700 select-none">Это аванс / предоплата</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 ml-1">Комментарий</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full p-3 rounded-[14px] border border-slate-200 bg-slate-50 text-slate-900 font-medium text-xs focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none"
                                    rows={2}
                                    placeholder="Например: Предоплата 50%"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-[14px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isAdvance ? "Внести аванс" : "Внести оплату"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
