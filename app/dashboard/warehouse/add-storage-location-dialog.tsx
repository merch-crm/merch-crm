"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, MapPin, Building, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStorageLocation } from "./actions";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";


interface AddStorageLocationDialogProps {
    users: { id: string; name: string }[];
    trigger?: React.ReactNode;
}

export function AddStorageLocationDialog({ users, trigger }: AddStorageLocationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [responsibleUserId, setResponsibleUserId] = useState("");

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
        setResponsibleUserId("");
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

    const userOptions: PremiumSelectOption[] = users.map(u => ({
        id: u.id,
        title: u.name,
        description: "Сотрудник компании"
    }));

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={handleClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between mb-8 shrink-0">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-normaler uppercase leading-none">Новый склад</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-3">Добавление локации</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all active:scale-95"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 flex-1 pb-2">
                    <form action={handleSubmit} noValidate className="space-y-6">
                        <input type="hidden" name="responsibleUserId" value={responsibleUserId} />

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Building className="w-3 h-3" /> Название <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <input
                                name="name"
                                placeholder="Например: основной склад"
                                className={cn(
                                    "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-base font-bold outline-none transition-all",
                                    fieldErrors.name
                                        ? "border-rose-300 bg-rose-50/50 text-rose-900"
                                        : "border-slate-100 focus:bg-white focus:border-primary"
                                )}
                                onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                            />
                            {fieldErrors.name && (
                                <p className="text-[10px] font-bold text-rose-500 ml-1">
                                    {fieldErrors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Описание
                            </label>
                            <input
                                name="description"
                                placeholder="Например: для хранения расходников"
                                className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-base font-bold focus:bg-white focus:border-primary outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Адрес <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <input
                                name="address"
                                placeholder="Улица, номер дома..."
                                className={cn(
                                    "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-base font-bold outline-none transition-all",
                                    fieldErrors.address
                                        ? "border-rose-300 bg-rose-50/50 text-rose-900"
                                        : "border-slate-100 focus:bg-white focus:border-primary"
                                )}
                                onChange={() => setFieldErrors(prev => ({ ...prev, address: "" }))}
                            />
                            {fieldErrors.address && (
                                <p className="text-[10px] font-bold text-rose-500 ml-1">
                                    {fieldErrors.address}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <PremiumSelect
                                label="Ответственный"
                                options={userOptions}
                                value={responsibleUserId}
                                onChange={setResponsibleUserId}
                                placeholder="Не назначен"
                                showSearch
                            />
                        </div>

                        <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-white transition-all cursor-pointer group relative">
                            <div className="w-12 h-12 rounded-xl bg-white text-slate-400 border border-slate-100 group-hover:border-primary/20 flex items-center justify-center transition-all">
                                <Plus className="w-6 h-6 rotate-45" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[11px] font-black text-slate-900 leading-none mb-1 uppercase tracking-widest">ОСНОВНОЙ СКЛАД</p>
                                <p className="text-[10px] font-bold text-slate-400 leading-none">Приоритетное место хранения</p>
                            </div>
                            <input
                                type="checkbox"
                                name="isDefault"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-20"
                            />
                            <div className="w-7 h-7 rounded-full border-2 border-slate-200 transition-all flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </div>


                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <SubmitButton />
                        </div>
                    </form>
                </div>
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
                    className="h-12 btn-primary rounded-[var(--radius)] px-6 gap-2 font-bold shadow-xl shadow-primary/20 transition-all active:scale-95"
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
            className="w-full h-16 btn-primary rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
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
