"use client";

import { StorageLocation } from "./storage-locations-tab";
import { InventoryItem } from "./inventory-client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { Plus, X, MapPin, User, Building, Package, AlignLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStorageLocation, moveInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";

import { ArrowRightLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { PremiumSelect } from "@/components/ui/premium-select";

interface EditStorageLocationDialogProps {
    users: { id: string; name: string }[];
    locations: StorageLocation[];
    location: StorageLocation | null;
    isOpen: boolean;
    onClose: () => void;
}

const ITEMS_PER_PAGE = 7;

export function EditStorageLocationDialog({ users, locations, location, isOpen, onClose }: EditStorageLocationDialogProps) {
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    async function handleSubmit(formData: FormData) {
        if (!location) return;

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
        const res = await updateStorageLocation(location.id, formData);
        if (res?.error) {
            toast(res.error, "error");
        } else {
            toast("Склад успешно обновлен", "success");
            onClose();
        }
    }

    if (!isOpen || !location) return null;

    // Pagination logic
    const items = location.items || [];
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = items.slice(startIndex, endIndex);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl bg-white rounded-[18px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Редактирование</h2>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">Изменение места хранения</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[18px] bg-slate-50 transition-all hover:rotate-90"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {/* Left Column - Edit Form */}
                    <div>
                        <form action={handleSubmit} noValidate className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-1">
                                    <Building className="w-3 h-3" /> Название <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <input
                                    name="name"
                                    defaultValue={location.name}
                                    placeholder="Например: основной склад"
                                    className={cn(
                                        "input-premium w-full px-5 rounded-[18px] border bg-slate-50 text-sm font-bold outline-none transition-all",
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
                                <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3" /> Описание
                                </label>
                                <input
                                    name="description"
                                    defaultValue={location.description || ""}
                                    placeholder="Например: для хранения расходников"
                                    className="input-premium w-full px-5 rounded-[18px] border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Адрес <span className="text-rose-500 font-bold">*</span>
                                </label>
                                <input
                                    name="address"
                                    defaultValue={location.address || ""}
                                    placeholder="Улица, номер дома..."
                                    className={cn(
                                        "input-premium w-full px-5 rounded-[18px] border bg-slate-50 text-sm font-bold outline-none transition-all",
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
                                <label className="text-[10px] font-bold text-slate-500 ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Ответственный за хранение
                                </label>
                                <div className="relative group">
                                    <PremiumSelect
                                        options={[
                                            { id: "", title: "Не назначен", icon: <User className="w-4 h-4 opacity-50" /> },
                                            ...users.map(u => ({ id: u.id, title: u.name, icon: <User className="w-4 h-4 opacity-50" /> }))
                                        ]}
                                        value={location.responsibleUserId || ""}
                                        onChange={(val) => {
                                            // Since we're using a hidden input for form submission
                                            const input = document.querySelector('input[name="responsibleUserId"]') as HTMLInputElement;
                                            if (input) {
                                                input.value = val;
                                            }
                                        }}
                                        placeholder="Выберите ответственного..."
                                    />
                                    <input type="hidden" name="responsibleUserId" defaultValue={location.responsibleUserId || ""} />
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-[18px] border border-slate-100 hover:border-primary/20 hover:bg-white transition-all cursor-pointer group relative">
                                    <input
                                        type="checkbox"
                                        name="isDefault"
                                        defaultChecked={location.isDefault}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer peer z-10"
                                    />
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:shadow-lg peer-checked:shadow-primary/20 bg-white text-slate-400 border border-slate-100 group-hover:border-primary/20">
                                        <Plus className="w-5 h-5 transition-transform peer-checked:rotate-0 rotate-45" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-black text-slate-900 leading-none mb-1">ОСНОВНОЙ СКЛАД</p>
                                        <p className="text-[10px] font-bold text-slate-400 leading-none">Приоритетное место хранения</p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 transition-all flex items-center justify-center peer-checked:border-primary peer-checked:bg-primary">
                                        <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>

                            <SubmitButton />
                        </form>
                    </div>

                    {/* Right Column - Items List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-2">
                                <Package className="w-3 h-3" /> Товары на складе
                            </label>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-[18px]">
                                {items.length} {pluralize(items.length, 'ПОЗИЦИЯ', 'ПОЗИЦИИ', 'ПОЗИЦИЙ')}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-[18px] border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col flex-1 min-w-0 mr-3">
                                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{item.name}</span>
                                            {item.sku && <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-[18px] shadow-sm border border-slate-100 flex-shrink-0">
                                                {item.quantity} {item.unit || "уп."}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTransferItem(item);
                                                }}
                                                className="w-7 h-7 flex items-center justify-center rounded-[18px] bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-sm transition-all shadow-sm"
                                                title="Переместить на другой склад"
                                            >
                                                <ArrowRightLeft className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-slate-400 text-xs font-medium bg-slate-50 rounded-[18px] border border-dashed border-slate-200">
                                    Склад пуст
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-4 py-2 rounded-[18px] bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold text-slate-700"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Назад
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-[18px] text-xs font-bold transition-all ${currentPage === page
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-4 py-2 rounded-[18px] bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold text-slate-700"
                                >
                                    Вперёд
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>



            {transferItem && location && (
                <QuickTransferModal
                    item={transferItem}
                    currentLocationId={location.id}
                    locations={locations}
                    onClose={() => setTransferItem(null)}
                />
            )}
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[18px] font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                </div>
            ) : "Сохранить изменения"}
        </Button>
    );
}

function QuickTransferModal({ item, currentLocationId, locations, onClose }: {
    item: InventoryItem;
    currentLocationId: string;
    locations: StorageLocation[];
    onClose: () => void;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [selectedToLocation, setSelectedToLocation] = useState("");

    async function handleTransfer(formData: FormData) {
        const toLocationId = formData.get("toLocationId") as string;
        const qty = parseInt(formData.get("quantity") as string);
        const comment = formData.get("comment") as string;

        const newErrors: Record<string, string> = {};

        if (!toLocationId) {
            newErrors.toLocationId = "Выберите склад получатель";
        }

        if (!qty || qty <= 0) {
            newErrors.quantity = "Введите корректное количество";
        } else if (qty > item.quantity) {
            newErrors.quantity = `Максимально доступно: ${item.quantity}`;
        }

        if (!comment || comment.trim().length < 3) {
            newErrors.comment = "Обязательно укажите причину перемещения";
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        const res = await moveInventoryItem(formData);
        if (res?.error) {
            toast(res.error, "error");
        } else {
            toast(`Товар "${item.name}" успешно перемещен`, "success");
            router.refresh();
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-white rounded-[18px] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">Быстрое перемещение</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-indigo-50 rounded-[18px] border border-indigo-100">
                    <div className="text-[10px] font-bold text-indigo-600 mb-1 font-mono">Товар</div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                        <span>Доступно: {item.quantity} {item.unit}</span>
                    </div>
                </div>

                <form action={handleTransfer} noValidate className="space-y-4">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="fromLocationId" value={currentLocationId} />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                            Куда переместить <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <PremiumSelect
                            options={locations
                                .filter(l => l.id !== currentLocationId)
                                .map(l => ({
                                    id: l.id,
                                    title: l.name,
                                    icon: <MapPin className="w-4 h-4 opacity-50" />
                                }))
                            }
                            value={selectedToLocation}
                            onChange={(val) => {
                                setSelectedToLocation(val);
                                setFieldErrors(prev => ({ ...prev, toLocationId: "" }));
                            }}
                            placeholder="Выберите склад..."
                            className={cn(
                                fieldErrors.toLocationId && "border-rose-400 bg-rose-50/30 ring-4 ring-rose-500/5"
                            )}
                        />
                        <input type="hidden" name="toLocationId" value={selectedToLocation} />
                        {fieldErrors.toLocationId && (
                            <div className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                {fieldErrors.toLocationId}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1 flex items-center gap-1">
                            Количество <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            max={item.quantity}
                            placeholder="Кол-во..."
                            className={cn(
                                "w-full h-12 px-4 rounded-[18px] border bg-slate-50 text-sm font-bold outline-none transition-all",
                                fieldErrors.quantity
                                    ? "border-rose-400 bg-rose-50/30 ring-4 ring-rose-500/5 text-rose-900"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            )}
                        />
                        {fieldErrors.quantity && (
                            <div className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                {fieldErrors.quantity}
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-slate-500 ml-1 flex items-center gap-1">
                            Комментарий <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <input
                            name="comment"
                            placeholder="Причина перемещения..."
                            className={cn(
                                "w-full h-12 px-4 rounded-[18px] border bg-slate-50 text-sm font-bold outline-none transition-all",
                                fieldErrors.comment
                                    ? "border-rose-400 bg-rose-50/30 ring-4 ring-rose-500/5 text-rose-900"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            )}
                        />
                        {fieldErrors.comment && (
                            <div className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200 text-balance">
                                {fieldErrors.comment}
                            </div>
                        )}
                    </div>

                    <TransferSubmitButton />
                </form>
            </div>
        </div>
    );
}

function TransferSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[18px] font-bold text-xs transition-all mt-2"
        >
            {pending ? "Перемещение..." : "Переместить"}
        </Button>
    );
}
