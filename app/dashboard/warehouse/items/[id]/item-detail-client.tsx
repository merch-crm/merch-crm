"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
    X, Package, MapPin, Info, ArrowUpRight, ArrowDownLeft,
    Clock, BarChart3, ArrowLeft, Edit3, Trash2,
    Download, Save, RefreshCcw, Plus, Minus,
    MoveHorizontal, ChevronDown, Shirt, Box, Wrench
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    getItemHistory, getItemStocks, updateInventoryItem,
    deleteInventoryItems
} from "../../actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AdjustStockDialog } from "../../adjust-stock-dialog";
import { TransferItemDialog } from "./transfer-item-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StorageLocation } from "../../storage-locations-tab";
import { UnitSelect } from "@/components/ui/unit-select";

interface ItemHistoryTransaction {
    id: string;
    type: "in" | "out" | "transfer";
    changeAmount: number;
    reason: string | null;
    createdAt: Date;
    creator: { name: string } | null;
    storageLocation: { name: string } | null;
}

interface ItemStock {
    id: string;
    quantity: number;
    updatedAt: Date;
    storageLocationId: string;
    storageLocation: { name: string } | null;
}

export interface InventoryItem {
    id: string;
    name: string;
    sku: string | null;
    quantity: number;
    unit: string;
    lowStockThreshold: number;
    description: string | null;
    location: string | null;
    storageLocationId: string | null;
    image: string | null;
    reservedQuantity: number;
    itemType: "clothing" | "packaging" | "consumables";
    categoryId: string | null;
    qualityCode: string | null;
    attributeCode: string | null;
    sizeCode: string | null;
    attributes: Record<string, string | number | boolean | null | undefined>;
    category?: {
        id: string;
        name: string;
        parent?: {
            id: string;
            name: string;
        } | null;
    } | null;
}

interface ItemDetailClientProps {
    item: InventoryItem;
    storageLocations: StorageLocation[];
    measurementUnits: { id: string, name: string }[];
}

const ATTRIBUTE_LABELS: Record<string, string> = {
    width: "Ширина (см)",
    height: "Высота (см)",
    depth: "Глубина (см)",
    material: "Материал",
    department: "Отдел",
    manufacturer: "Производитель"
};

const VALUE_LABELS: Record<string, string> = {
    printing: "Печать",
    embroidery: "Вышивка",
    sewing: "Пошив"
};

const ITEM_TYPE_CONFIG: Record<string, { name: string, icon: typeof Shirt, color: string }> = {
    clothing: { name: "Одежда", icon: Shirt, color: "bg-blue-500 text-white" },
    packaging: { name: "Упаковка", icon: Box, color: "bg-amber-500 text-white" },
    consumables: { name: "Расходники", icon: Wrench, color: "bg-emerald-500 text-white" }
};

export function ItemDetailClient({ item: initialItem, storageLocations, measurementUnits }: ItemDetailClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [item, setItem] = useState(initialItem);
    const [history, setHistory] = useState<ItemHistoryTransaction[]>([]);
    const [stocks, setStocks] = useState<ItemStock[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Support state
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: initialItem.name,
        sku: initialItem.sku || "",
        description: initialItem.description || "",
        unit: initialItem.unit,
        lowStockThreshold: initialItem.lowStockThreshold || 0,
        attributes: initialItem.attributes || {}
    });
    const [isSaving, setIsSaving] = useState(false);

    // Dialogs state
    const [adjustType, setAdjustType] = useState<"in" | "out" | "set" | null>(null);
    const [selectedLocationForAdjust, setSelectedLocationForAdjust] = useState<string | null>(null);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAdjustMenuOpen, setIsAdjustMenuOpen] = useState(false);

    const [prevInitialItem, setPrevInitialItem] = useState(initialItem);

    // Sync state with props when server-side data refreshes (e.g. after quantity update)
    // Using the "adjusting state during render" pattern to avoid lint warnings and cascading renders
    if (JSON.stringify(initialItem) !== JSON.stringify(prevInitialItem)) {
        setPrevInitialItem(initialItem);
        setItem(initialItem);
        if (!isEditing) {
            setEditData({
                name: initialItem.name,
                sku: initialItem.sku || "",
                description: initialItem.description || "",
                unit: initialItem.unit,
                lowStockThreshold: initialItem.lowStockThreshold || 0,
                attributes: initialItem.attributes || {}
            });
        }
    }

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [historyRes, stocksRes] = await Promise.all([
                getItemHistory(item.id),
                getItemStocks(item.id)
            ]);

            if (historyRes.data) setHistory(historyRes.data);
            if (stocksRes.data) setStocks(stocksRes.data);

            setIsLoading(false);
        }
        fetchData();
    }, [item.id, item.quantity]);

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append("itemType", item.itemType);
        formData.append("name", editData.name);
        formData.append("sku", editData.sku);
        formData.append("description", editData.description);
        formData.append("unit", editData.unit);
        formData.append("lowStockThreshold", editData.lowStockThreshold.toString());
        formData.append("categoryId", initialItem.categoryId || "");
        formData.append("quantity", initialItem.quantity.toString());
        formData.append("attributes", JSON.stringify(editData.attributes));

        // Flatten attributes for server-side merging if needed by old logic
        Object.entries(editData.attributes).forEach(([k, v]) => {
            formData.append(k, v as string);
        });

        const res = await updateInventoryItem(item.id, formData);
        if (res.success) {
            setItem({ ...item, ...editData });
            setIsEditing(false);
            toast("Данные товара успешно обновлены", "success");
        } else {
            toast(res.error || "Ошибка при обновлении данных", "error");
        }
        setIsSaving(false);
    };

    const handleDownload = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["ID,Название,Артикул,Количество,Ед.изм,Склад"].join(",") + "\n"
            + [item.id, `"${item.name}"`, item.sku || "", item.quantity, item.unit, ""].join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `item_${item.sku || item.id}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast("Файл экспортирован успешно", "info");
    };

    const handleDelete = async () => {
        const res = await deleteInventoryItems([item.id]);
        if (res.success) {
            toast("Товар успешно удален из базы", "success");
            router.push("/dashboard/warehouse");
        } else {
            toast(res.error || "Ошибка при удалении товара", "error");
        }
    };

    const parentCategory = item.category?.parent;
    const currentCategory = item.category;
    const typeConfig = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.clothing;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 py-8">
            {/* Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.back()}
                        className="group w-12 h-12 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shrink-0 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                            <span
                                className="hover:text-indigo-600 cursor-pointer transition-colors flex items-center gap-1"
                                onClick={() => router.push('/dashboard/warehouse')}
                            >
                                <Package className="w-3 h-3" />
                                Склад
                            </span>
                            <span className="text-slate-300">/</span>
                            {parentCategory && (
                                <>
                                    <span
                                        className="hover:text-indigo-600 cursor-pointer transition-colors"
                                        onClick={() => router.push(`/dashboard/warehouse/${parentCategory.id}`)}
                                    >
                                        {parentCategory.name}
                                    </span>
                                    <span className="text-slate-300">/</span>
                                </>
                            )}
                            {currentCategory && (
                                <>
                                    <span
                                        className="hover:text-indigo-600 cursor-pointer transition-colors"
                                        onClick={() => router.push(`/dashboard/warehouse/${currentCategory.id}`)}
                                    >
                                        {currentCategory.name}
                                    </span>
                                    <span className="text-slate-300">/</span>
                                </>
                            )}
                            <span className="text-slate-500 line-clamp-1">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <div className="relative flex-1 max-w-xl">
                                    <input
                                        value={editData.name}
                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                        className="text-3xl font-black text-slate-900 tracking-tight leading-tight bg-slate-50/30 border-b-2 border-indigo-500 focus:bg-indigo-50/50 outline-none px-3 py-1 w-full transition-all"
                                        placeholder="Название товара"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{item.name}</h1>
                            )}
                            <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0", typeConfig.color)}>
                                <typeConfig.icon className="w-3.5 h-3.5 mr-1.5 inline" />
                                {typeConfig.name}
                            </Badge>
                        </div>
                        <div className="mt-4 text-xs font-bold font-mono">
                            {isEditing ? (
                                <div className="flex items-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Арт.</span>
                                        <input
                                            value={editData.sku}
                                            onChange={e => setEditData({ ...editData, sku: e.target.value })}
                                            className="text-xs font-black text-slate-700 uppercase tracking-widest font-mono bg-transparent outline-none min-w-[120px]"
                                            placeholder="SKU-PLACEHOLDER"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Ед.</span>
                                        <UnitSelect
                                            value={editData.unit}
                                            onChange={val => setEditData({ ...editData, unit: val })}
                                            options={measurementUnits}
                                            className="bg-transparent border-none p-0 h-auto text-xs font-black text-indigo-600"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <span className="text-slate-400 uppercase tracking-widest leading-none">Арт.: {item.sku || "Без артикула"}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({
                                        name: item.name,
                                        sku: item.sku || "",
                                        description: item.description || "",
                                        unit: item.unit,
                                        lowStockThreshold: item.lowStockThreshold || 0,
                                        attributes: item.attributes || {}
                                    });
                                }}
                                className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Отмена
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-xl shadow-indigo-100 transition-all active:scale-95"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSaving ? "Сохранение..." : "Сохранить"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={handleDownload}
                                className="h-12 w-12 p-0 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsEditing(true)}
                                className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Редактировать
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="h-12 w-12 p-0 rounded-2xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image & Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="relative aspect-square rounded-[3rem] bg-white border border-slate-200/60 overflow-hidden shadow-xl shadow-slate-200/50 group">
                        {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <Package className="w-24 h-24 text-slate-200" />
                            </div>
                        )}
                        <Badge className={cn(
                            "absolute top-6 left-6 px-4 py-2 text-[10px] font-black border-none shadow-lg",
                            (item.quantity - (item.reservedQuantity || 0)) <= item.lowStockThreshold ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                        )}>
                            {item.quantity - (item.reservedQuantity || 0)} {item.unit} ДОСТУПНО
                        </Badge>
                    </div>

                    {/* Stock Highlights & Correction Menu */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Button
                                    onClick={() => setIsAdjustMenuOpen(!isAdjustMenuOpen)}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black gap-2 shadow-xl shadow-indigo-100 transition-all"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Корректировка
                                    <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", isAdjustMenuOpen && "rotate-180")} />
                                </Button>

                                {isAdjustMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsAdjustMenuOpen(false)} />
                                        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <button
                                                onClick={() => { setAdjustType("in"); setIsAdjustMenuOpen(false); }}
                                                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 group transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                    <Plus className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Поставка</span>
                                            </button>
                                            <button
                                                onClick={() => { setAdjustType("out"); setIsAdjustMenuOpen(false); }}
                                                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 group transition-colors border-t border-slate-50"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                    <Minus className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Списание</span>
                                            </button>
                                            <button
                                                onClick={() => { setAdjustType("set"); setIsAdjustMenuOpen(false); }}
                                                className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 group transition-colors border-t border-slate-50"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <RefreshCcw className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Корректировка остатков</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            <Button
                                onClick={() => setShowTransfer(true)}
                                className="h-14 w-14 p-0 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                                title="Перемещение между складами"
                            >
                                <MoveHorizontal className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <BarChart3 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Всего</span>
                                        <div className="text-2xl font-black text-slate-900 leading-none">{item.quantity} {item.unit}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Бронь</span>
                                        <div className="text-2xl font-black text-rose-600 leading-none">{item.reservedQuantity || 0} {item.unit}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Info, Stocks & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attributes & Description */}
                    <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden p-10">
                        <div className="space-y-10">
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Описание и характеристики</h3>
                                    </div>
                                    {isEditing && (
                                        <div className="flex items-center gap-3 bg-rose-50/50 border border-rose-100 px-4 py-2 rounded-2xl">
                                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Мин. остаток:</span>
                                            <input
                                                type="number"
                                                value={editData.lowStockThreshold}
                                                onChange={e => setEditData({ ...editData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                                className="w-12 bg-transparent text-sm font-black text-rose-600 outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    <textarea
                                        value={editData.description}
                                        onChange={e => setEditData({ ...editData, description: e.target.value })}
                                        className="w-full min-h-[120px] text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all"
                                        placeholder="Введите описание товара..."
                                    />
                                ) : (
                                    <p className="text-slate-600 font-medium leading-relaxed mb-8">
                                        {item.description || "Описание отсутствует."}
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-4 mt-8">
                                    {/* Specialized Attributes */}
                                    {Object.entries(item.attributes || {}).map(([key, value]) => {
                                        if (isEditing && ATTRIBUTE_LABELS[key]) {
                                            return (
                                                <div key={key} className="px-5 py-4 bg-indigo-50/30 border border-indigo-100 rounded-[2rem] flex flex-col gap-1.5 min-w-[180px] focus-within:border-indigo-500 transition-all">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">{ATTRIBUTE_LABELS[key] || key}</span>
                                                    {key === "department" ? (
                                                        <select
                                                            value={(editData.attributes[key] as string) || ""}
                                                            onChange={e => setEditData({ ...editData, attributes: { ...editData.attributes, [key]: e.target.value } })}
                                                            className="text-sm font-black text-slate-900 bg-transparent border-none outline-none cursor-pointer appearance-none"
                                                        >
                                                            <option value="">Все отделы</option>
                                                            <option value="printing">Печать</option>
                                                            <option value="embroidery">Вышивка</option>
                                                            <option value="sewing">Пошив</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            value={(editData.attributes[key] as string | number) || ""}
                                                            onChange={e => setEditData({ ...editData, attributes: { ...editData.attributes, [key]: e.target.value } })}
                                                            className="text-sm font-black text-slate-900 bg-transparent border-none outline-none w-full"
                                                            placeholder="..."
                                                        />
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (!isEditing && value) {
                                            return (
                                                <div key={key} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col gap-1 min-w-[140px]">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ATTRIBUTE_LABELS[key] || key}</span>
                                                    <span className="text-sm font-black text-slate-900">{VALUE_LABELS[value as string] || value as string}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}

                                    {/* Additional generic attributes if any */}
                                    {item.qualityCode && (
                                        <div className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Качество</span>
                                            <span className="text-xs font-black text-slate-900 uppercase">{item.qualityCode}</span>
                                        </div>
                                    )}
                                    {item.attributeCode && (
                                        <div className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Цвет</span>
                                            <span className="text-xs font-black text-slate-900 uppercase">{item.attributeCode}</span>
                                        </div>
                                    )}
                                    {item.sizeCode && (
                                        <div className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-0.5">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Размер</span>
                                            <span className="text-xs font-black text-slate-900 uppercase">{item.sizeCode}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-10 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Хранение</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Общее кол-во:</span>
                                        <Badge variant="outline" className="text-xs font-black bg-indigo-50 border-indigo-100 text-indigo-600 px-3 py-1">
                                            {item.quantity} {item.unit}
                                        </Badge>
                                    </div>
                                </div>

                                {stocks.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {stocks.map(stock => (
                                            <div
                                                key={stock.id}
                                                onClick={() => {
                                                    setSelectedLocationForAdjust(stock.storageLocationId);
                                                    setAdjustType("set");
                                                }}
                                                className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border border-slate-100/80 group hover:border-indigo-500 hover:bg-white transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-slate-900">{stock.storageLocation?.name || "Неизвестный склад"}</div>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5 italic">
                                                            Обновлено {format(new Date(stock.updatedAt), "d MMM, HH:mm", { locale: ru })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                                    <span className="text-xl font-black">{stock.quantity}</span>
                                                    <span className="text-[10px] font-bold ml-1 uppercase">{item.unit}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center text-slate-400 text-sm font-bold">
                                        На данный момент товар не закреплен ни за одним складом
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* History */}
                    <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-sm overflow-hidden p-10 mt-8">
                        <div className="flex items-center gap-2 mb-8">
                            <Clock className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">История операций</h3>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50/50 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : history.length > 0 ? (
                            <div className="space-y-4">
                                {history.map((t) => {
                                    const isIn = t.type === "in";
                                    const isTransfer = t.type === "transfer";
                                    return (
                                        <div key={t.id} className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50/30 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0",
                                                isTransfer ? "bg-indigo-50 text-indigo-600" : (isIn ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")
                                            )}>
                                                {isTransfer ? <MoveHorizontal className="w-6 h-6 opacity-50" /> : (isIn ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                                                        {isTransfer ? "Перемещение" : (isIn ? "Приход" : "Расход")}
                                                        {t.storageLocation && <Badge variant="secondary" className="bg-white text-[9px] px-2 py-0 border-slate-200 text-slate-500">{t.storageLocation.name}</Badge>}
                                                    </div>
                                                    <div className={cn("text-base font-black", isTransfer ? "text-indigo-600" : (isIn ? "text-emerald-600" : "text-rose-600"))}>
                                                        {isTransfer ? "" : (isIn ? "+" : "-")}{Math.abs(t.changeAmount)} {item.unit}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-semibold text-slate-400 italic">{t.reason || "Причина не указана"}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] font-black text-slate-900 uppercase">{t.creator?.name || "Система"}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-1">{format(new Date(t.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-16 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">История операций пуста</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialogs */}
            {adjustType && (
                <AdjustStockDialog
                    item={{
                        ...item,
                        storageLocationId: selectedLocationForAdjust || item.storageLocationId
                    }}
                    locations={storageLocations}
                    itemStocks={stocks}
                    initialType={adjustType}

                    onClose={() => {
                        setAdjustType(null);
                        setSelectedLocationForAdjust(null);
                        router.refresh();
                    }}
                />
            )}

            {showTransfer && (
                <TransferItemDialog
                    item={item}
                    locations={storageLocations}
                    onClose={() => {
                        setShowTransfer(false);
                        router.refresh();
                    }}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Удаление позиции"
                description={`Вы уверены, что хотите удалить "${item.name}"? Это действие необратимо.`}
                confirmText="Удалить"
                variant="destructive"
            />
        </div>
    );
}
