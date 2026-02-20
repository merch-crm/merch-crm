"use client";

import { useState } from "react";
import { Plus, MapPin, Building, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { addStorageLocation } from "./storage-actions";;
import { cn } from "@/lib/utils";
import { Select, SelectOption } from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";


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
    const [isPending, setIsPending] = useState(false);

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

        setIsPending(true);
        setFieldErrors({});
        const res = await addStorageLocation(formData);
        if (!res?.success) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setError("");
            setFieldErrors({});
            setResponsibleUserId("");
            setType("warehouse");
        }
        setIsPending(false);
    }

    const userOptions: SelectOption[] = (users || []).map((u: { id: string; name: string }) => ({
        id: u.id,
        title: u.name,
        description: "Сотрудник компании"
    }));

    return (
        <>
            {trigger ? (
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setIsOpen(true);
                        }
                    }}
                    onClick={() => setIsOpen(true)}
                    className="cursor-pointer"
                >
                    {trigger}
                </div>
            ) : (
                <Button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={cn(
                        "h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5 transition-all active:scale-95",
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
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm border border-orange-200/50">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Новый склад</h2>
                                <p className="text-[11px] font-bold text-slate-700 mt-0.5">Регистрация нового места хранения товаров</p>
                            </div>
                        </div>
                    </div>

                    <form
                        id="add-location-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit(new FormData(e.currentTarget));
                        }}
                        noValidate
                        className="px-6 pb-4 pt-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 overflow-visible"
                    >
                        <input type="hidden" name="responsibleUserId" value={responsibleUserId} />
                        <input type="hidden" name="type" value={type} />



                        <div className="flex gap-3">
                            <div className="space-y-1.5 flex-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    Название склада <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <Input
                                    name="name"
                                    placeholder="Центральный склад"
                                    disabled={isPending}
                                    className={cn(
                                        "crm-dialog-field px-4",
                                        fieldErrors.name
                                            ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900"
                                            : ""
                                    )}
                                    onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                                    required
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs font-bold text-rose-500 ml-1">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5 w-32 shrink-0">
                                <label className="text-sm font-bold text-slate-700 ml-1">Тип</label>
                                <Select
                                    options={[
                                        { id: "warehouse", title: "Склад", icon: <Building className="w-4 h-4" /> },
                                        { id: "production", title: "Производство", icon: <RefreshCw className="w-4 h-4" /> },
                                        { id: "office", title: "Офис", icon: <Building className="w-4 h-4" /> }
                                    ]}
                                    value={type}
                                    disabled={isPending}
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
                                <Input
                                    name="address"
                                    placeholder="Ул. Промышленная, д. 15..."
                                    disabled={isPending}
                                    className={cn(
                                        "crm-dialog-field pl-11 pr-4",
                                        fieldErrors.address
                                            ? "border-rose-300 bg-rose-50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900"
                                            : ""
                                    )}
                                    onChange={() => setFieldErrors(prev => ({ ...prev, address: "" }))}
                                    required
                                />
                            </div>
                            {fieldErrors.address && (
                                <p className="text-xs font-bold text-rose-500 ml-1">
                                    {fieldErrors.address}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700 ml-1">Ответственный сотрудник</label>
                            <Select
                                options={userOptions}
                                value={responsibleUserId}
                                disabled={isPending}
                                onChange={setResponsibleUserId}
                                placeholder="Кто будет отвечать за склад?"
                                showSearch
                            />
                        </div>

                        <div className={cn(
                            "flex items-center gap-3 p-4 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 transition-all cursor-pointer group relative hover:bg-white hover:border-primary/20 hover:shadow-md hover:shadow-slate-100 shadow-sm",
                            isPending && "opacity-50 pointer-events-none"
                        )}>
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
                                disabled={isPending}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-20"
                            />
                            <div className="w-6 h-6 rounded-full border-2 border-slate-200 transition-all flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary shadow-inner">
                                <div className="w-2.5 h-2.5 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {error && (
                            <div className="crm-error-box">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                    </form>

                    <div className="crm-dialog-footer">
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setIsOpen(false)}
                            disabled={isPending}
                            className="flex h-11 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-[var(--radius-inner)] items-center justify-center"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            form="add-location-form"
                            isLoading={isPending}
                            disabled={isPending}
                            className="h-11 flex-1 lg:flex-none lg:w-auto lg:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm border-none"
                            text="Сохранить"
                            loadingText="Сохранение..."
                        />
                    </div>
                </div>
            </ResponsiveModal >
        </>
    );
}


