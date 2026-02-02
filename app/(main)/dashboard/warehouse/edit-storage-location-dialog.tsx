"use client";

import { StorageLocation } from "./storage-locations-tab";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, X, MapPin, User, Building, Package, ArrowRightLeft, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStorageLocation, moveInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { PremiumSelect } from "@/components/ui/premium-select";

interface EditStorageLocationDialogProps {
    users: { id: string; name: string }[];
    locations: StorageLocation[];
    location: StorageLocation | null;
    onClose: () => void;
}

const ITEMS_PER_PAGE = 7;

type StorageLocationItem = {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    sku?: string | null;
    categoryId?: string | null;
    categoryName?: string | null;
};

export function EditStorageLocationDialog(props: EditStorageLocationDialogProps) {
    if (!props.location) return null;
    return <EditStorageLocationInner {...props} location={props.location} />;
}

function EditStorageLocationInner({ users, locations, location, onClose }: EditStorageLocationDialogProps & { location: StorageLocation }) {
    const { toast } = useToast();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [transferItem, setTransferItem] = useState<StorageLocationItem | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [localItems, setLocalItems] = useState<StorageLocationItem[]>(location.items || []);
    const [isSaving, setIsSaving] = useState(false);

    // Form local state
    const [localName, setLocalName] = useState(location.name);
    const [localDescription, setLocalDescription] = useState(location.description || "");
    const [localAddress, setLocalAddress] = useState(location.address || "");
    const [localResponsibleUserId, setLocalResponsibleUserId] = useState(location.responsibleUserId || "");
    const [localIsDefault, setLocalIsDefault] = useState(location.isDefault || false);
    const [localIsActive, setLocalIsActive] = useState(location.isActive ?? true);
    const [localType, setLocalType] = useState<"warehouse" | "production" | "office">(location.type || "warehouse");

    const [prevLocation, setPrevLocation] = useState(location);

    if (location.id !== prevLocation.id) {
        setPrevLocation(location);
        setLocalName(location.name);
        setLocalDescription(location.description || "");
        setLocalAddress(location.address || "");
        setLocalResponsibleUserId(location.responsibleUserId || "none");
        setLocalIsDefault(!!location.isDefault);
        setLocalIsActive(location.isActive ?? true);
        setLocalType(location.type || "warehouse");
        setLocalItems(location.items || []);
    }

    async function handleAutoSave(updates: Partial<StorageLocation>) {
        setIsSaving(true);
        const formData = new FormData();
        formData.append("name", updates.name ?? localName);
        formData.append("address", updates.address ?? localAddress);
        formData.append("description", updates.description ?? localDescription);
        formData.append("responsibleUserId", updates.responsibleUserId ?? localResponsibleUserId);
        formData.append("type", updates.type ?? localType);
        if (updates.isDefault ?? localIsDefault) formData.append("isDefault", "on");
        if (updates.isActive ?? localIsActive) formData.append("isActive", "on");

        const res = await updateStorageLocation(location.id, formData);
        if (res?.error) {
            toast(res.error, "error");
        }
        setIsSaving(false);
        router.refresh();
    }

    const totalPages = Math.ceil((localItems?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = localItems?.slice(startIndex, endIndex) || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-3xl bg-white rounded-[var(--radius-outer)] shadow-2xl border-none animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[92vh] my-auto overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shadow-sm">
                            <Building className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Настройки склада</h2>
                                {isSaving && (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                                        <RefreshCw className="w-2.5 h-2.5 text-primary animate-spin" />
                                        <span className="text-[9px] font-bold text-primary uppercase">Сохранение...</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                                Локация: <span className="text-slate-900 font-bold">{localName}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-5 gap-6 overflow-y-auto flex-1 custom-scrollbar overflow-visible">
                    <div className="col-span-2 space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 ml-1">Название склада <span className="text-rose-500">*</span></label>
                                <input
                                    name="name"
                                    value={localName}
                                    placeholder="Напр. Склад А"
                                    className={cn(
                                        "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-slate-50/30 text-sm font-bold outline-none transition-all shadow-sm",
                                        fieldErrors.name
                                            ? "border-rose-200 bg-rose-50/50 text-rose-900"
                                            : "border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5"
                                    )}
                                    onChange={(e) => {
                                        setLocalName(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, name: "" }));
                                    }}
                                    onBlur={() => localName !== location.name && handleAutoSave({ name: localName })}
                                />
                                {fieldErrors.name && <p className="text-[10px] font-bold text-rose-500 ml-1">{fieldErrors.name}</p>}
                            </div>



                            <div className="space-y-2 overflow-visible">
                                <label className="text-sm font-bold text-slate-500 ml-1">Тип локации</label>
                                <PremiumSelect
                                    options={[
                                        { id: "warehouse", title: "Склад", icon: <Building className="w-4 h-4" /> },
                                        { id: "production", title: "Производство", icon: <RefreshCw className="w-4 h-4" /> },
                                        { id: "office", title: "Офис", icon: <Building className="w-4 h-4" /> }
                                    ]}
                                    value={localType}
                                    onChange={(val) => {
                                        const typeVal = val as "warehouse" | "production" | "office";
                                        setLocalType(typeVal);
                                        handleAutoSave({ type: typeVal });
                                    }}
                                    variant="default"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-500 ml-1">Адрес объекта <span className="text-rose-500">*</span></label>
                                <div className="relative group">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="address"
                                        value={localAddress}
                                        placeholder="Ул. Примерная, 10"
                                        className={cn(
                                            "w-full h-11 pl-10 pr-4 rounded-[var(--radius-inner)] border bg-slate-50/30 text-sm font-bold outline-none transition-all shadow-sm",
                                            fieldErrors.address
                                                ? "border-rose-200 bg-rose-50/50 text-rose-900"
                                                : "border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5"
                                        )}
                                        onChange={(e) => {
                                            setLocalAddress(e.target.value);
                                            setFieldErrors(prev => ({ ...prev, address: "" }));
                                        }}
                                        onBlur={() => localAddress !== (location.address || "") && handleAutoSave({ address: localAddress })}
                                    />
                                </div>
                                {fieldErrors.address && <p className="text-[10px] font-bold text-rose-500 ml-1">{fieldErrors.address}</p>}
                            </div>

                            <div className="space-y-2 overflow-visible">
                                <label className="text-sm font-bold text-slate-500 ml-1">Ответственное лицо</label>
                                <PremiumSelect
                                    options={[
                                        { id: "", title: "Не назначен", icon: <User className="w-4 h-4 opacity-50" /> },
                                        ...users.map(u => ({ id: u.id, title: u.name, icon: <User className="w-4 h-4" /> }))
                                    ]}
                                    value={localResponsibleUserId}
                                    onChange={(val) => {
                                        setLocalResponsibleUserId(val);
                                        handleAutoSave({ responsibleUserId: val });
                                    }}
                                    showSearch
                                    placeholder="Поиск сотрудника..."
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    const next = !localIsDefault;
                                    setLocalIsDefault(next);
                                    handleAutoSave({ isDefault: next });
                                }}
                                className="w-full flex items-center gap-4 p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 hover:border-primary/20 hover:bg-white transition-all cursor-pointer group relative shadow-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className={cn(
                                    "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center transition-all bg-white text-slate-400 border border-slate-200 group-hover:border-primary/30 shadow-sm relative z-10",
                                    localIsDefault && "bg-primary text-white border-primary"
                                )}>
                                    <Plus className={cn("w-5 h-5 transition-transform stroke-[2.5]", localIsDefault ? "rotate-0" : "rotate-45")} />
                                </div>
                                <div className="flex-1 text-left relative z-10">
                                    <p className="text-[11px] font-bold text-slate-900 leading-none mb-1">Основной склад</p>
                                    <p className="text-[9px] font-bold text-slate-400 leading-none">По умолчанию для всех товаров</p>
                                </div>
                                <div className={cn(
                                    "w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 relative z-10",
                                    localIsDefault ? "bg-primary" : "bg-slate-300"
                                )}>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                        localIsDefault ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    const next = !localIsActive;
                                    setLocalIsActive(next);
                                    handleAutoSave({ isActive: next });
                                }}
                                className="w-full flex items-center gap-4 p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 hover:border-emerald-500/20 hover:bg-white transition-all cursor-pointer group relative shadow-sm overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                <div className={cn(
                                    "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center transition-all bg-white text-slate-400 border border-slate-200 group-hover:border-emerald-500/30 shadow-sm relative z-10",
                                    localIsActive && "bg-emerald-500 text-white border-emerald-500"
                                )}>
                                    <RefreshCw className={cn("w-5 h-5 transition-transform stroke-[2.5]", localIsActive ? "rotate-0" : "rotate-180 opacity-50")} />
                                </div>
                                <div className="flex-1 text-left relative z-10">
                                    <p className="text-[11px] font-bold text-slate-900 leading-none mb-1">Статус склада</p>
                                    <p className="text-[9px] font-bold text-slate-400 leading-none">{localIsActive ? "Склад активен и готов к работе" : "Склад деактивирован (архив)"}</p>
                                </div>
                                <div className={cn(
                                    "w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 relative z-10",
                                    localIsActive ? "bg-emerald-500" : "bg-slate-300"
                                )}>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
                                        localIsActive ? "translate-x-4" : "translate-x-0"
                                    )} />
                                </div>
                            </button>

                            <div className="pt-2 pb-1">
                                <Button
                                    variant="btn-dark"
                                    onClick={onClose}
                                    className="w-full h-11 rounded-[var(--radius-inner)] font-bold text-sm transition-all active:scale-[0.98]"
                                >
                                    Сохранить
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-3 flex flex-col gap-5 border-l border-slate-200 pl-6 h-full min-h-[440px] overflow-hidden">
                        <div className="flex items-center justify-between pb-1">
                            <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                                <Package className="w-4 h-4 text-slate-300" /> Товары в наличии <span className="opacity-30">/</span> {localItems?.length || 0}
                            </label>
                            <div className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm transition-colors",
                                localIsActive ? "bg-emerald-500/10 border-emerald-500/20" : "bg-slate-100 border-slate-200"
                            )}>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full transition-all",
                                    localIsActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    localIsActive ? "text-emerald-500" : "text-slate-500"
                                )}>
                                    {localIsActive ? "Активно" : "Архив"}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 hover:border-primary/20 hover:bg-white transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex flex-col min-w-0 flex-1 mr-3">
                                            <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                                            {item.sku && <span className="text-[9px] text-slate-400 font-bold mt-0.5 flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                SKU: {item.sku}
                                            </span>}
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <div className="flex flex-col items-end">
                                                <div className="text-[11px] font-bold text-primary flex items-baseline gap-0.5 leading-none">
                                                    {item.quantity}
                                                    <span className="text-[8px] opacity-60">{item.unit || "шт"}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTransferItem(item);
                                                }}
                                                className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-inner)] bg-white border border-slate-200 text-slate-400 hover:text-white hover:bg-primary hover:border-primary transition-all active:scale-95 shadow-sm group/btn"
                                                title="Переместить"
                                            >
                                                <ArrowRightLeft className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-transform duration-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 bg-slate-50/30 rounded-[var(--radius-inner)] border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-[var(--radius-inner)] flex items-center justify-center mb-4 shadow-sm border border-slate-200">
                                        <Package className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-bold">Склад пуст</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">Нет товаров для отображения</p>
                                </div>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto bg-white/50 backdrop-blur-sm -mx-6 px-6 pb-2">
                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-inner)] bg-white border border-slate-200 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all shadow-sm active:scale-90"><ChevronLeft className="w-5 h-5 stroke-[2.5]" /></button>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                    <span className="text-slate-900">{currentPage}</span>
                                    <span className="opacity-30">/</span>
                                    <span>{totalPages}</span>
                                </div>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-inner)] bg-white border border-slate-200 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-400 transition-all shadow-sm active:scale-90"><ChevronRight className="w-5 h-5 stroke-[2.5]" /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {transferItem && (
                <QuickTransferModal
                    item={transferItem}
                    currentLocationId={location.id}
                    locations={locations}
                    onClose={() => setTransferItem(null)}
                    onSuccess={(itemId, quantity) => {
                        setLocalItems(prev => prev.map(i => {
                            if (i.id === itemId) return { ...i, quantity: i.quantity - quantity };
                            return i;
                        }).filter(i => i.quantity > 0));
                    }}
                />
            )}
        </div>
    );
}

function QuickTransferModal({ item, currentLocationId, locations, onClose, onSuccess }: {
    item: StorageLocationItem;
    currentLocationId: string;
    locations: StorageLocation[];
    onClose: () => void;
    onSuccess: (itemId: string, quantity: number) => void;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [selectedToLocation, setSelectedToLocation] = useState("");

    async function handleTransfer(formData: FormData) {
        const toLocationId = formData.get("toLocationId") as string;
        const qtyS = formData.get("quantity") as string;
        const qty = parseInt(qtyS);
        const comment = formData.get("comment") as string;
        const newErrors: Record<string, string> = {};

        if (!toLocationId) newErrors.toLocationId = "Выберите склад получатель";
        if (!qtyS || isNaN(qty) || qty <= 0) newErrors.quantity = "Введите корректное количество";
        else if (qty > item.quantity) newErrors.quantity = `Максимально: ${item.quantity}`;
        if (!comment || comment.trim().length < 3) newErrors.comment = "Укажите причину";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        const res = await moveInventoryItem(formData);
        if (res?.error) {
            toast(res.error, "error");
        } else {
            toast(`Товар перемещен`, "success");
            onSuccess(item.id, qty);
            router.refresh();
            onClose();
        }
    }

    return (
        <div className="absolute inset-0 z-[150] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md text-center animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />
            <div className="relative w-full max-w-[320px] bg-white rounded-[var(--radius-outer)] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-200 p-8 animate-in zoom-in-95 duration-300 ring-1 ring-slate-900/5 flex flex-col gap-6 text-left">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Перемещение</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Экспресс-операция</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-inner)] bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all active:scale-95"><X className="w-4 h-4" /></button>
                </div>

                <div className="p-4 bg-slate-50/80 rounded-[var(--radius-inner)] border border-slate-200 shadow-inner group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="text-[9px] font-bold text-slate-400 mb-1 group-hover:text-primary transition-colors">Объект перемещения</div>
                    <div className="text-xs font-bold text-slate-900 truncate">{item.name}</div>
                    <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-white rounded-[var(--radius-inner)] border border-slate-200 text-[10px] font-bold text-primary shadow-sm tabular-nums">
                        Доступно: {item.quantity} {item.unit}
                    </div>
                </div>

                <form action={handleTransfer} noValidate className="space-y-4">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="fromLocationId" value={currentLocationId} />

                    <div className="space-y-2 overflow-visible">
                        <label className="text-sm font-bold text-slate-500 ml-1">Куда переместить <span className="text-rose-500">*</span></label>
                        <PremiumSelect
                            options={locations.filter(l => l.id !== currentLocationId).map(l => ({ id: l.id, title: l.name, icon: <Building className="w-4 h-4 opacity-50" /> }))}
                            value={selectedToLocation}
                            onChange={(val) => { setSelectedToLocation(val); setFieldErrors(prev => ({ ...prev, toLocationId: "" })); }}
                            placeholder="Выберите склад"
                        />
                        <input type="hidden" name="toLocationId" value={selectedToLocation} />
                        {fieldErrors.toLocationId && <p className="text-[9px] font-bold text-rose-500 ml-1 leading-none">{fieldErrors.toLocationId}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">Количество <span className="text-rose-500">*</span></label>
                            <input
                                type="number"
                                name="quantity"
                                min="1"
                                max={item.quantity}
                                placeholder="0"
                                className={cn(
                                    "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-slate-50/30 text-sm font-bold outline-none transition-all shadow-sm tabular-nums",
                                    fieldErrors.quantity ? "border-rose-200 bg-rose-50/50" : "border-slate-200 focus:bg-white focus:border-primary"
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">Причина <span className="text-rose-500">*</span></label>
                            <input
                                name="comment"
                                placeholder="..."
                                className={cn(
                                    "w-full h-11 px-4 rounded-[var(--radius-inner)] border bg-slate-50/30 text-sm font-bold outline-none transition-all shadow-sm",
                                    fieldErrors.comment ? "border-rose-200 bg-rose-50/50" : "border-slate-200 focus:bg-white focus:border-primary"
                                )}
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <TransferSubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}

function TransferSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="btn-dark"
            type="submit"
            disabled={pending}
            className="w-full h-11 rounded-[var(--radius-inner)] font-bold text-sm active:scale-95 flex items-center justify-center gap-2"
        >
            {pending ? <RefreshCw className="w-5 h-5 animate-spin text-white" /> : <>
                <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
                Переместить
            </>}
        </Button>
    );
}
