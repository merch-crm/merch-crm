"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, MapPin, User, Building, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStorageLocation } from "./actions";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";


interface AddStorageLocationDialogProps {
    users: { id: string; name: string }[];
    trigger?: React.ReactNode;
}

export function AddStorageLocationDialog({ users, trigger }: AddStorageLocationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleOpen = () => {
        setIsOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleClose = () => {
        setIsOpen(false);
        setError("");
        setFieldErrors({});
        document.body.style.overflow = 'unset';
    };

    async function handleSubmit(formData: FormData) {
        const name = formData.get("name") as string;
        const address = formData.get("address") as string;

        const newErrors: Record<string, string> = {};
        if (!name || name.trim().length < 2) newErrors.name = "Введите название склада";
        if (!address || address.trim().length < 5) newErrors.address = "Введите полный адрес";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        const res = await addStorageLocation(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            handleClose();
        }
    }

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={handleClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-[18px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 ">Новое место хранения</h2>
                        <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] mt-1">Добавление локации на склад</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[18px] bg-slate-50 transition-all hover:rotate-90"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form action={handleSubmit} noValidate className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  ml-1 flex items-center gap-1">
                            <Building className="w-3 h-3" /> Название <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                            name="name"
                            placeholder="Например: основной склад"
                            className={cn(
                                "input-premium w-full px-5 rounded-[var(--radius)] border bg-slate-50 text-sm font-bold outline-none transition-all",
                                fieldErrors.name
                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                                    : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                            )}
                            onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                        />
                        {fieldErrors.name && (
                            <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  ml-1 flex items-center gap-2">
                            <AlignLeft className="w-3 h-3" /> Описание
                        </label>
                        <input
                            name="description"
                            placeholder="Например: для хранения расходников"
                            className="input-premium w-full px-5 rounded-[var(--radius)] border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  ml-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Адрес <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                            name="address"
                            placeholder="Улица, номер дома..."
                            className={cn(
                                "input-premium w-full px-5 rounded-[var(--radius)] border bg-slate-50 text-sm font-bold outline-none transition-all",
                                fieldErrors.address
                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                                    : "border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5"
                            )}
                            onChange={() => setFieldErrors(prev => ({ ...prev, address: "" }))}
                        />
                        {fieldErrors.address && (
                            <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                {fieldErrors.address}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  ml-1 flex items-center gap-2">
                            <User className="w-3 h-3" /> Ответственный за хранение
                        </label>
                        <div className="relative group">
                            <select
                                name="responsibleUserId"
                                className="input-premium w-full px-5 rounded-[var(--radius)] border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            >
                                <option value="">Не назначен</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                                <Plus className="w-4 h-4 rotate-45" />
                            </div>
                        </div>
                    </div>


                    {error && (
                        <div className="p-3 rounded-[18px] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {error}
                        </div>
                    )}

                    <SubmitButton />
                </form>
            </div>
        </div>
    );

    return (
        <>
            {trigger ? (
                <div onClick={handleOpen} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <Button
                    onClick={handleOpen}
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[18px] px-6 gap-2 font-bold shadow-xl shadow-indigo-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Создать место хранения
                </Button>
            )}

            {isOpen && mounted && createPortal(modalContent, document.body)}
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[18px] font-bold text-sm  shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                </div>
            ) : "Создать место"}
        </Button>
    );
}
