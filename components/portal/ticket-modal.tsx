"use client";

import React, { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createTicket } from "@/app/(main)/dashboard/portal/actions";

interface TicketModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TicketModal({ isOpen, onClose }: TicketModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "normal" as "low" | "normal" | "high" | "critical",
        category: "equipment" as "equipment" | "materials" | "design" | "other"
    });
    
    const [status, setStatus] = useState({
        submitting: false,
        success: false,
        error: null as string | null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(prev => ({ ...prev, submitting: true, error: null }));

        try {
            const res = await createTicket(formData);

            if (res.success) {
                setStatus(prev => ({ ...prev, success: true }));
                setTimeout(() => {
                    onClose();
                    setStatus(prev => ({ ...prev, success: false }));
                    setFormData({
                        title: "",
                        description: "",
                        priority: "normal",
                        category: "equipment"
                    });
                }, 2000);
            } else {
                setStatus(prev => ({ ...prev, error: res.error || "Ошибка при создании тикета" }));
            }
        } catch (_err) {
            setStatus(prev => ({ ...prev, error: "Произошла непредвиденная ошибка" }));
        } finally {
            setStatus(prev => ({ ...prev, submitting: false }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl">
                {status.success ? (
                    <div className="p-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6 shadow-inner">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Заявка принята!</h2>
                        <p className="text-slate-500 font-medium">Мастер скоро рассмотрит ваше обращение.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-8 space-$1-3">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Создать тикет</DialogTitle>
                                <DialogDescription className="text-slate-500 font-bold">
                                    Опишите проблему или запрос на помощь. Мы постараемся ответить как можно быстрее.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-$1-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 ml-1">Тема обращения</label>
                                    <Input 
                                        placeholder="Например: Не работает термопресс №2" 
                                        className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-1">Категория</label>
                                        <Select 
                                            value={formData.category} 
                                            onChange={(val) => setFormData(prev => ({ ...prev, category: val as typeof formData.category }))}
                                            options={[
                                                { id: "equipment", title: "Тех. поломка" },
                                                { id: "materials", title: "Расходники" },
                                                { id: "design", title: "Макеты" },
                                                { id: "other", title: "Прочее" }
                                            ]}
                                            triggerClassName="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-400 ml-1">Приоритет</label>
                                        <Select 
                                            value={formData.priority} 
                                            onChange={(val) => setFormData(prev => ({ ...prev, priority: val as typeof formData.priority }))}
                                            options={[
                                                { id: "low", title: "Низкий" },
                                                { id: "normal", title: "Средний" },
                                                { id: "high", title: "Высокий" },
                                                { id: "critical", title: "Критично" }
                                            ]}
                                            triggerClassName="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 ml-1">Подробности</label>
                                    <Textarea 
                                        placeholder="Краткое описание проблемы или нужных материалов..." 
                                        className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>

                            {status.error && (
                                <div className="flex items-center gap-2 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {status.error}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-8 bg-slate-50/50 border-t border-slate-100">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={onClose}
                                className="rounded-2xl font-bold text-slate-500"
                                disabled={status.submitting}
                            >
                                Отмена
                            </Button>
                            <Button 
                                type="submit" 
                                className="btn-dark rounded-2xl font-black px-8 h-12 shadow-lg shadow-slate-900/10"
                                disabled={status.submitting}
                            >
                                {status.submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Создаем...
                                    </>
                                ) : (
                                    "Отправить заявку"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
