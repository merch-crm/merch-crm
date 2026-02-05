"use client";

import { useState } from "react";
import { Plus, MapPin, Building, RefreshCw, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStorageLocation } from "./actions";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { PremiumSelect, PremiumSelectOption } from "@/components/ui/premium-select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";


interface AddStorageLocationDialogProps {
    users: { id: string; name: string }[];
    trigger?: React.ReactNode;
    className?: string;
    isOpen?: boolean; // Controlled
    onOpenChange?: (open: boolean) => void; // Controlled
}

export function AddStorageLocationDialog({ users, trigger, className, isOpen: controlledIsOpen, onOpenChange }: AddStorageLocationDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = (open: boolean) => {
        if (onOpenChange) onOpenChange(open);
        else setInternalIsOpen(open);
    };
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [responsibleUserId, setResponsibleUserId] = useState("");
    const [type, setType] = useState<"warehouse" | "production" | "office">("warehouse");

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
            setIsOpen(false);
            setError("");
            setFieldErrors({});
            setResponsibleUserId("");
            setType("warehouse");
        }
    }

    const userOptions: PremiumSelectOption[] = users.map((u: { id: string; name: string }) => ({
        id: u.id,
        title: u.name,
        description: "Сотрудник компании"
    }));

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)} className="cursor-pointer">
                    {trigger}
                </div>
            ) : (
                <Button
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-[18px] p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5 transition-all active:scale-95",
                        className
                    )}
                >
                    <Plus className="w-5 h-5 text-white shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Добавить склад</span>
                </Button>
            )}

            <ResponsiveModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Новый склад" showVisualTitle={false}>
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm border border-orange-200/50">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Новый склад</h2>
                                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Регистрация нового места хранения товаров</p>
                            </div>
                        </div>
                    </div>

                    <form id="add-location-form" action={handleSubmit} noValidate className="px-6 pb-4 pt-4 flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1 overflow-visible">
                        <input type="hidden" name="responsibleUserId" value={responsibleUserId} />
                        <input type="hidden" name="type" value={type} />



                        <div className="flex gap-4">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    Название склада <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <input
                                    name="name"
                                    placeholder="Центральный склад"
                                    className={cn(
                                        "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm",
                                        fieldErrors.name
                                            ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900"
                                            : "border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900"
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
                                <label className="text-sm font-bold text-slate-700 ml-1">Тип</label>
                                <PremiumSelect
                                    options={[
                                        { id: "warehouse", title: "Склад", icon: <Building className="w-4 h-4" /> },
                                        { id: "production", title: "Производство", icon: <RefreshCw className="w-4 h-4" /> },
                                        { id: "office", title: "Офис", icon: <Building className="w-4 h-4" /> }
                                    ]}
                                    value={type}
                                    onChange={(val) => setType(val as "warehouse" | "production" | "office")}
                                    variant="default"
                                    align="end"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Адрес расположения <span className="text-rose-500 font-bold">*</span>
                            </label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="address"
                                    placeholder="Ул. Промышленная, д. 15..."
                                    className={cn(
                                        "w-full h-11 pl-11 pr-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold outline-none transition-all placeholder:text-slate-300 shadow-sm",
                                        fieldErrors.address
                                            ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900"
                                            : "border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900"
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
                            <label className="text-sm font-bold text-slate-700 ml-1">Ответственный сотрудник</label>
                            <PremiumSelect
                                options={userOptions}
                                value={responsibleUserId}
                                onChange={setResponsibleUserId}
                                placeholder="Кто будет отвечать за склад?"
                                showSearch
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 transition-all cursor-pointer group relative hover:bg-white hover:border-primary/20 hover:shadow-md hover:shadow-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-white text-slate-400 border border-slate-200 group-hover:border-primary/20 group-hover:text-primary flex items-center justify-center transition-all shadow-sm">
                                <Plus className="w-5 h-5 rotate-45 stroke-[2.5]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900 leading-none mb-1">Основной склад</p>
                                <p className="text-[11px] font-bold text-slate-700 leading-none">Будет выбран по умолчанию</p>
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

                    </form>

                    <div className="sticky bottom-0 z-10 p-5 sm:p-6 pt-3 flex items-center justify-end lg:justify-between gap-3 shrink-0 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex h-11 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-[var(--radius-inner)] items-center justify-center"
                        >
                            Отмена
                        </button>
                        <SubmitButton />
                    </div>
                </div>
            </ResponsiveModal >
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="btn-dark"
            type="submit"
            form="add-location-form"
            disabled={pending}
            className="h-11 flex-1 lg:flex-none lg:w-auto lg:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3"
        >
            {pending ? (
                <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Сохранение...
                </>
            ) : (
                <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    Сохранить
                </>
            )}
        </Button>
    );
}
