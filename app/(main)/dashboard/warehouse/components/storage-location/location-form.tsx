import { Building, MapPin, User, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StorageLocation } from "../../storage-locations-tab";

interface LocationFormProps {
    form: {
        name: string;
        description: string;
        address: string;
        responsibleUserId: string;
        isDefault: boolean;
        isActive: boolean;
        type: "warehouse" | "production" | "office";
    };
    fieldErrors: Record<string, string>;
    isSaving: boolean;
    users: { id: string; name: string }[];
    location: StorageLocation;
    setFormValue: (key: "name" | "description" | "address" | "responsibleUserId" | "isDefault" | "isActive" | "type", value: string | boolean) => void;
    clearFieldError: (key: string) => void;
    handleAutoSave: (updates: Partial<StorageLocation>) => void;
}

export function LocationForm({
    form,
    fieldErrors,
    isSaving,
    users,
    location,
    setFormValue,
    clearFieldError,
    handleAutoSave
}: LocationFormProps) {
    return (
        <div className="space-y-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Название склада <span className="text-rose-500">*</span></label>
                    <Input
                        name="name"
                        value={form.name}
                        placeholder="Напр. Склад А"
                        className={cn(
                            "w-full h-12 px-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold outline-none transition-all shadow-sm",
                            fieldErrors.name
                                ? "border-rose-200 bg-rose-50/50 text-rose-900"
                                : "border-slate-200 focus:bg-slate-50 focus:border-primary focus:ring-4 focus:ring-primary/5"
                        )}
                        onChange={(e) => {
                            setFormValue("name", e.target.value);
                            clearFieldError("name");
                        }}
                        onBlur={() => form.name !== location.name && handleAutoSave({ name: form.name })}
                        disabled={isSaving}
                    />
                    {fieldErrors.name && <p className="text-xs font-bold text-rose-500 ml-1">{fieldErrors.name}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Тип локации</label>
                    <Select
                        options={[
                            { id: "warehouse", title: "Склад", icon: <Building className="w-4 h-4" /> },
                            { id: "production", title: "Производство", icon: <RefreshCw className="w-4 h-4" /> },
                            { id: "office", title: "Офис", icon: <Building className="w-4 h-4" /> }
                        ]}
                        value={form.type}
                        disabled={isSaving}
                        onChange={(val) => {
                            const typeVal = val as "warehouse" | "production" | "office";
                            setFormValue("type", typeVal);
                            handleAutoSave({ type: typeVal });
                        }}
                        variant="default"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Адрес объекта <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
                        <Input
                            name="address"
                            value={form.address}
                            placeholder="Ул. Примерная, 10"
                            className={cn(
                                "w-full h-12 pl-10 pr-4 rounded-[var(--radius-inner)] border bg-slate-50 text-sm font-bold outline-none transition-all shadow-sm",
                                fieldErrors.address
                                    ? "border-rose-200 bg-rose-50/50 text-rose-900"
                                    : "border-slate-200 focus:bg-slate-50 focus:border-primary focus:ring-4 focus:ring-primary/5"
                            )}
                            onChange={(e) => {
                                setFormValue("address", e.target.value);
                                clearFieldError("address");
                            }}
                            onBlur={() => form.address !== (location.address || "") && handleAutoSave({ address: form.address })}
                            disabled={isSaving}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Ответственное лицо</label>
                    <Select
                        options={[
                            { id: "", title: "Не назначен", icon: <User className="w-4 h-4 opacity-50" /> },
                            ... (users || []).map(u => ({ id: u.id, title: u.name, icon: <User className="w-4 h-4" /> }))
                        ]}
                        value={form.responsibleUserId}
                        disabled={isSaving}
                        onChange={(val) => {
                            setFormValue("responsibleUserId", val);
                            handleAutoSave({ responsibleUserId: val });
                        }}
                        showSearch
                        placeholder="Поиск сотрудника..."
                    />
                </div>

                <div className="pt-2 space-y-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            const isNewValue = !form.isDefault;
                            setFormValue("isDefault", isNewValue);
                            handleAutoSave({ isDefault: isNewValue });
                        }}
                        disabled={isSaving}
                        className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 transition-all h-auto"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white text-slate-400 border border-slate-200 shadow-sm",
                            form.isDefault && "bg-primary text-white border-primary"
                        )}>
                            <Plus className={cn("w-5 h-5 transition-transform stroke-[2.5]", form.isDefault ? "rotate-0" : "rotate-45")} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[11px] font-bold text-slate-900 mb-1">Основной склад</p>
                            <p className="text-xs font-bold text-slate-400">По умолчанию для всех товаров</p>
                        </div>
                        <div className={cn("w-10 h-6 rounded-full transition-all flex items-center px-0.5", form.isDefault ? "bg-primary" : "bg-slate-300")}>
                            <div className={cn("w-5 h-5 rounded-full bg-white transition-all shadow-sm", form.isDefault ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            const isNewValue = !form.isActive;
                            setFormValue("isActive", isNewValue);
                            handleAutoSave({ isActive: isNewValue });
                        }}
                        disabled={isSaving}
                        className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 transition-all h-auto"
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-white text-slate-400 border border-slate-200 shadow-sm",
                            form.isActive && "bg-emerald-500 text-white border-emerald-500"
                        )}>
                            <RefreshCw className={cn("w-5 h-5 transition-transform stroke-[2.5]", form.isActive ? "rotate-0" : "rotate-180 opacity-50")} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-[11px] font-bold text-slate-900 mb-1">Статус склада</p>
                            <p className="text-xs font-bold text-slate-400">{form.isActive ? "Склад активен" : "Склад деактивирован"}</p>
                        </div>
                        <div className={cn("w-10 h-6 rounded-full transition-all flex items-center px-0.5", form.isActive ? "bg-emerald-500" : "bg-slate-300")}>
                            <div className={cn("w-5 h-5 rounded-full bg-white transition-all shadow-sm", form.isActive ? "translate-x-4" : "translate-x-0")} />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
