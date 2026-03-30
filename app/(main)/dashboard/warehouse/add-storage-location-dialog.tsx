"use client";

import { Plus, MapPin, Building, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import { Select, SelectOption } from "@/components/ui/select";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { SwitchRow } from "@/components/ui/switch-row";
import { useAddStorageLocation } from "./hooks/use-add-storage-location";


interface AddStorageLocationDialogProps {
    users: { id: string; name: string; roleName?: string }[];
    trigger?: React.ReactNode;
    className?: string;
    isOpen?: boolean; // Controlled
    onOpenChange?: (open: boolean) => void; // Controlled
}

export function AddStorageLocationDialog({ users, trigger, className, isOpen: controlledIsOpen, onOpenChange }: AddStorageLocationDialogProps) {
    const {
        isOpen,
        setIsOpen,
        error,
        fieldErrors,
        clearFieldError,
        responsibleUserId,
        setResponsibleUserId,
        type,
        setType,
        isDefault,
        setIsDefault,
        isPending,
        handleSubmit,
    } = useAddStorageLocation({ controlledIsOpen, onOpenChange });

    const userOptions: SelectOption[] = (users || []).map((u: { id: string; name: string; roleName?: string }) => ({
        id: u.id,
        title: u.name,
        description: u.roleName || "Сотрудник"
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
                    className={cn("h-10 w-10 sm:h-11 sm:w-auto btn-dark rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center border-none shadow-lg shadow-black/5 transition-all active:scale-95",
                        className
                    )}
                >
                    <Plus className="w-5 h-5 text-white shrink-0" />
                    <span className="hidden sm:inline whitespace-nowrap">Добавить склад</span>
                </Button>
            )}

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новый склад"
                description="Добавление нового склада, офиса или производственной площадки в систему"
                showVisualTitle={false}
                className="sm:max-w-[720px]"
            >
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-orange-100 flex items-center justify-center shrink-0 shadow-sm border border-orange-200/50">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Новый склад</h2>
                                <p className="text-xs font-bold text-slate-700 mt-0.5">Создание нового места хранения товаров</p>
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
                        className="px-6 pb-4 pt-2 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 overflow-visible"
                    >
                        <input type="hidden" name="responsibleUserId" value={responsibleUserId} />
                        <input type="hidden" name="type" value={type} />
                        <input type="hidden" name="isDefault" value={isDefault ? "on" : ""} />



                        <div className="flex gap-3">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">
                                    Название склада <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    name="name"
                                    placeholder="Центральный склад"
                                    disabled={isPending}
                                    className={cn("w-full h-12 px-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm",
                                        fieldErrors.name
                                            ? "border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/5"
                                            : ""
                                    )}
                                    onChange={() => clearFieldError("name")}
                                    required
                                />
                                {fieldErrors.name && (
                                    <p className="text-xs font-bold text-rose-500 ml-1">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2 w-32 shrink-0">
                                <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Тип</label>
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
                                    triggerClassName="bg-slate-50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">
                                Адрес расположения <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative group">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                <Input
                                    name="address"
                                    placeholder="Ул. Промышленная, д. 15..."
                                    disabled={isPending}
                                    className={cn("w-full h-12 pl-12 pr-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm",
                                        fieldErrors.address
                                            ? "border-rose-300 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/5"
                                            : ""
                                    )}
                                    onChange={() => clearFieldError("address")}
                                    required
                                />
                            </div>
                            {fieldErrors.address && (
                                <p className="text-xs font-bold text-rose-500 ml-1">
                                    {fieldErrors.address}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 block mb-2 ml-1">Ответственный сотрудник</label>
                            <Select
                                options={userOptions}
                                value={responsibleUserId}
                                disabled={isPending}
                                onChange={setResponsibleUserId}
                                placeholder="Кто будет отвечать за склад?"
                                showSearch
                                triggerClassName="bg-slate-50"
                            />
                        </div>

                        <SwitchRow
                            icon={Plus}
                            title="Основной склад"
                            description=""
                            checked={isDefault}
                            onCheckedChange={setIsDefault}
                            disabled={isPending}
                            variant="primary"
                            iconClassName={cn("transition-all",
                                isDefault ? "bg-primary text-white border-primary shadow-primary/20" : "bg-white text-slate-400"
                            )}
                            onClick={() => !isPending && setIsDefault(!isDefault)}
                        />

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
                            className="flex h-12 flex-1 lg:flex-none lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all text-center rounded-[var(--radius-inner)] items-center justify-center"
                        >
                            Отмена
                        </Button>
                        <SubmitButton
                            form="add-location-form"
                            isLoading={isPending}
                            disabled={isPending}
                            variant="btn-dark"
                            className="h-12 flex-1 lg:flex-none lg:w-auto lg:px-10 rounded-[var(--radius-inner)] font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm border-none"
                            text="Сохранить"
                            loadingText="Сохранение..."
                        />
                    </div>
                </div>
            </ResponsiveModal >
        </>
    );
}


