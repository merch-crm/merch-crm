"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, X, MapPin, Building, AlignLeft, RefreshCw, AlertCircle, Check } from "lucide-react";
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
    const [type, setType] = useState<"warehouse" | "production" | "office">("warehouse");

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
        setType("warehouse");
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={handleClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-[var(--radius-outer)] shadow-2xl border-none animate-in zoom-in-95 duration-300 flex flex-col my-auto shrink-0 max-h-[92vh] overflow-visible">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm border border-orange-200/50">
                            <MapPin className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Новый склад</h2>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">Регистрация нового места хранения товаров</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form action={handleSubmit} noValidate className="px-6 pb-6 pt-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 overflow-visible">
                    <input type="hidden" name="responsibleUserId" value={responsibleUserId} />
                    <input type="hidden" name="type" value={type} />

                    <div className="flex gap-4">
                        <div className="space-y-1.5 flex-1">
                            <label className="text-sm font-bold text-slate-500 ml-1">
                                Название склада <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <input
                                name="name"
                                placeholder="Центральный склад"
                                className={cn(
                                    "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-white text-sm font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm",
                                    fieldErrors.name
                                        ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900"
                                        : "border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900"
                                )}
                                onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                            />
                            {fieldErrors.name && (
                                <p className="text-[9px] font-bold text-rose-500 ml-1">
                                    {fieldErrors.name}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5 w-32 shrink-0">
                            <label className="text-sm font-bold text-slate-500 ml-1">Тип</label>
                            <PremiumSelect
                                options={[
                                    { id: "warehouse", title: "Склад", icon: <Building className="w-4 h-4" /> },
                                    { id: "production", title: "Производство", icon: <RefreshCw className="w-4 h-4" /> },
                                    { id: "office", title: "Офис", icon: <Building className="w-4 h-4" /> }
                                ]}
                                value={type}
                                onChange={(val: any) => setType(val)}
                                variant="default"
                            />
                        </div>
                    </div>



                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-500 ml-1">
                            Адрес расположения <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input
                                name="address"
                                placeholder="Ул. Промышленная, д. 15..."
                                className={cn(
                                    "w-full h-11 pl-11 pr-4 rounded-[var(--radius-inner)] border bg-white text-sm font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm",
                                    fieldErrors.address
                                        ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900"
                                        : "border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900"
                                )}
                                onChange={() => setFieldErrors(prev => ({ ...prev, address: "" }))}
                            />
                        </div>
                        {fieldErrors.address && (
                            <p className="text-[9px] font-bold text-rose-500 ml-1">
                                {fieldErrors.address}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-500 ml-1">Ответственный сотрудник</label>
                        <PremiumSelect
                            options={userOptions}
                            value={responsibleUserId}
                            onChange={setResponsibleUserId}
                            placeholder="Кто будет отвечать за склад?"
                            showSearch
                        />
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 transition-all cursor-pointer group relative hover:bg-white hover:border-primary/20 hover:shadow-md hover:shadow-slate-100 shadow-sm">
                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-white text-slate-400 border border-slate-200 group-hover:border-primary/20 group-hover:text-primary flex items-center justify-center transition-all shadow-sm">
                            <Plus className="w-5 h-5 rotate-45 stroke-[2.5]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 leading-none mb-1">Основной склад</p>
                            <p className="text-[11px] font-bold text-slate-500 leading-none">Будет выбран по умолчанию</p>
                        </div>
                        <input
                            type="checkbox"
                            name="isDefault"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-20"
                        />
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 transition-all flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary shadow-inner">
                            <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-[var(--radius-inner)] bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
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
                    className="h-11 btn-dark rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm border-none"
                >
                    <Plus className="w-5 h-5" />
                    Добавить склад
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
            variant="btn-dark"
            type="submit"
            disabled={pending}
            className="w-full h-11 rounded-[var(--radius-inner)] font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
            {pending ? (
                <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Сохранение...
                </>
            ) : (
                <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Создать место
                </>
            )}
        </Button>
    );
}
