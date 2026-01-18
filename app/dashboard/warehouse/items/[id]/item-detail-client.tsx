"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import {
    X, Package, MapPin, Info, ArrowUpRight, ArrowDownLeft,
    Clock, ArrowLeft, Edit3, Trash2,
    Download, Save, RefreshCcw, Plus, Minus,
    MoveHorizontal, ChevronDown, ChevronUp, Shirt, Box, Wrench,
    Image as ImageIcon, ChevronLeft, ChevronRight, Check, Pencil
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { createElement } from "react";
import {
    getItemHistory, getItemStocks, updateInventoryItem,
    deleteInventoryItems, deleteInventoryItemImage
} from "../../actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AdjustStockDialog } from "../../adjust-stock-dialog";
import { TransferItemDialog } from "./transfer-item-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UnitSelect } from "@/components/ui/unit-select";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    InventoryItem,
    Category,
    ItemHistoryTransaction,
    ItemStock,
    StorageLocation,
    AttributeType,
    InventoryAttribute,
    ThumbnailSettings
} from "../../types";
import { ItemHeader } from "./components/ItemHeader";
import { ItemMediaSection } from "./components/ItemMediaSection";
import { ItemGeneralInfo } from "./components/ItemGeneralInfo";
import { ItemInventorySection } from "./components/ItemInventorySection";
import { ItemHistorySection } from "./components/ItemHistorySection";

interface ItemDetailClientProps {
    item: InventoryItem;
    storageLocations: StorageLocation[];
    measurementUnits: { id: string, name: string }[];
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
}

export function ItemDetailClient({
    item: initialItem,
    storageLocations,
    measurementUnits,
    categories,
    attributeTypes,
    allAttributes
}: ItemDetailClientProps) {
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
        lowStockThreshold: initialItem.lowStockThreshold || 10,
        criticalStockThreshold: initialItem.criticalStockThreshold || 0,
        attributes: initialItem.attributes || {},
        categoryId: initialItem.categoryId || "",
        qualityCode: initialItem.qualityCode || "",
        attributeCode: initialItem.attributeCode || "",
        sizeCode: initialItem.sizeCode || "",
        materialCode: (initialItem as any).materialCode || "",
        brandCode: (initialItem as any).brandCode || "",
        thumbnailSettings: initialItem.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
    });
    const [isSaving, setIsSaving] = useState(false);

    // Dialogs state
    const [adjustType, setAdjustType] = useState<"in" | "out" | "set" | null>(null);
    const [selectedLocationForAdjust, setSelectedLocationForAdjust] = useState<string | null>(null);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [prevInitialItem, setPrevInitialItem] = useState(initialItem);

    // Image Upload State
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImageBackFile, setNewImageBackFile] = useState<File | null>(null);
    const [newImageSideFile, setNewImageSideFile] = useState<File | null>(null);
    const [newImageDetailsFiles, setNewImageDetailsFiles] = useState<File[]>([]);

    // Upload Progress States
    const [uploadStates, setUploadStates] = useState({
        front: { uploading: false, progress: 0, uploaded: false },
        back: { uploading: false, progress: 0, uploaded: false },
        side: { uploading: false, progress: 0, uploaded: false },
        details: [] as { uploading: boolean, progress: number, uploaded: boolean }[],
    });

    const isAnyUploading =
        uploadStates.front.uploading ||
        uploadStates.back.uploading ||
        uploadStates.side.uploading ||
        uploadStates.details.some(d => d.uploading);

    const simulateUpload = (type: "front" | "back" | "side" | "details", fileName: string, index?: number) => {
        if (type === "details" && index !== undefined) {
            setUploadStates(prev => {
                const newDetails = [...prev.details];
                newDetails[index] = { uploading: true, progress: 0, uploaded: false };
                return { ...prev, details: newDetails };
            });

            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 20) + 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    setUploadStates(prev => {
                        const newDetails = [...prev.details];
                        newDetails[index] = { uploading: false, progress: 100, uploaded: true };
                        return { ...prev, details: newDetails };
                    });
                    toast(`Файл ${fileName} подготовлен к загрузке`, "success");
                } else {
                    setUploadStates(prev => {
                        const newDetails = [...prev.details];
                        newDetails[index] = { ...newDetails[index], progress };
                        return { ...prev, details: newDetails };
                    });
                }
            }, 300);
            return;
        }

        setUploadStates(prev => ({
            ...prev,
            [type]: { uploading: true, progress: 0, uploaded: false }
        }));

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 20) + 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setUploadStates(prev => ({
                    ...prev,
                    [type]: { uploading: false, progress: 100, uploaded: true }
                }));
                toast(`Файл ${fileName} подготовлен к загрузке`, "success");
            } else {
                setUploadStates(prev => ({
                    ...prev,
                    [type]: { ...(prev[type as "front" | "back" | "side"]), progress }
                }));
            }
        }, 300);
    };

    // Sync state with props when server-side data refreshes
    if (JSON.stringify(initialItem) !== JSON.stringify(prevInitialItem)) {
        setPrevInitialItem(initialItem);
        setItem(initialItem);
        if (!isEditing) {
            setEditData({
                name: initialItem.name,
                sku: initialItem.sku || "",
                description: initialItem.description || "",
                unit: initialItem.unit,
                lowStockThreshold: initialItem.lowStockThreshold || 10,
                criticalStockThreshold: initialItem.criticalStockThreshold || 0,
                attributes: initialItem.attributes || {},
                categoryId: initialItem.categoryId || "",
                qualityCode: initialItem.qualityCode || "",
                attributeCode: initialItem.attributeCode || "",
                sizeCode: initialItem.sizeCode || "",
                materialCode: (initialItem as any).materialCode || "",
                brandCode: (initialItem as any).brandCode || "",
                thumbnailSettings: initialItem.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
            });
        }
    }

    const handleAttributeChange = (key: string, value: string) => {
        setEditData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [key]: value }
        }));
    };

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const [historyRes, stocksRes] = await Promise.all([
                getItemHistory(item.id),
                getItemStocks(item.id)
            ]);

            if (historyRes.data) setHistory(historyRes.data as ItemHistoryTransaction[]);
            if (stocksRes.data) setStocks(stocksRes.data as ItemStock[]);

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
        formData.append("criticalStockThreshold", editData.criticalStockThreshold.toString());
        formData.append("categoryId", editData.categoryId);
        formData.append("quantity", initialItem.quantity.toString());
        formData.append("storageLocationId", initialItem.storageLocationId || "");
        formData.append("reservedQuantity", (initialItem.reservedQuantity || 0).toString());
        formData.append("location", initialItem.location || "");
        formData.append("attributes", JSON.stringify(editData.attributes));
        formData.append("thumbnailSettings", JSON.stringify(editData.thumbnailSettings));

        // Add SKU constructor codes
        formData.append("qualityCode", editData.qualityCode || "");
        formData.append("materialCode", editData.materialCode || "");
        formData.append("attributeCode", editData.attributeCode || "");
        formData.append("sizeCode", editData.sizeCode || "");
        formData.append("brandCode", editData.brandCode || "");

        // Images
        if (newImageFile) formData.append("image", newImageFile);
        if (newImageBackFile) formData.append("imageBack", newImageBackFile);
        if (newImageSideFile) formData.append("imageSide", newImageSideFile);

        newImageDetailsFiles.forEach(file => formData.append("imageDetails", file));

        // Preserve existing images
        if (item.image) formData.append("currentImage", item.image);
        if (item.imageBack) formData.append("currentImageBack", item.imageBack);
        if (item.imageSide) formData.append("currentImageSide", item.imageSide);
        if (item.imageDetails && item.imageDetails.length > 0) {
            formData.append("currentImageDetails", JSON.stringify(item.imageDetails));
        }

        const res = await updateInventoryItem(item.id, formData);
        if (res.success) {
            setIsEditing(false);
            toast("Данные товара обновлены", "success");
            router.refresh();
        } else {
            toast(res.error || "Ошибка при обновлении данных", "error");
        }
        setIsSaving(false);
    };

    const handleDownload = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + ["ID,Название,Артикул,Количество,Ед.изм"].join(",") + "\n"
            + [item.id, `"${item.name}"`, item.sku || "", item.quantity, item.unit].join(",");
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

    const handleImageUpdate = (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => {
        if (type === "front") setNewImageFile(file);
        if (type === "back") setNewImageBackFile(file);
        if (type === "side") setNewImageSideFile(file);
        if (type === "details" && file) {
            const nextIndex = newImageDetailsFiles.length;
            setNewImageDetailsFiles(prev => [...prev, file]);
            simulateUpload("details", file.name, nextIndex);
            return;
        }

        if (file) {
            simulateUpload(type as any, file.name);
        }
    };

    const handleImageRemove = async (type: "front" | "back" | "side" | "details", index?: number) => {
        try {
            const res = await deleteInventoryItemImage(item.id, type, index);
            if (res.success) {
                toast("Изображение удалено", "success");
                // Update local state for immediate feedback
                setItem(prev => {
                    const newItem = { ...prev };
                    if (type === "front") newItem.image = null;
                    else if (type === "back") newItem.imageBack = null;
                    else if (type === "side") newItem.imageSide = null;
                    else if (type === "details" && typeof index === "number") {
                        const currentDetails = [...(newItem.imageDetails as string[] || [])];
                        currentDetails.splice(index, 1);
                        newItem.imageDetails = currentDetails;
                    }
                    return newItem;
                });
                router.refresh();
            } else {
                toast(res.error || "Ошибка удаления", "error");
            }
        } catch (error) {
            console.error(error);
            toast("Ошибка соединения с сервером", "error");
        }
    };

    const [activeSection, setActiveSection] = useState("overview");

    const sections = [
        { id: "overview", title: "Обзор", desc: "Основные данные и SKU", icon: Info },
        { id: "media", title: "Галерея", desc: "Фото и медиа", icon: ImageIcon },
        { id: "inventory", title: "Склад", desc: "Остатки и хранение", icon: MapPin },
        { id: "history", title: "История", desc: "Лог изменений", icon: Clock },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Breadcrumbs Header */}
            <div className="px-8 pt-6 pb-2">
                <Breadcrumbs
                    items={[
                        { label: "Склад", href: "/dashboard/warehouse", icon: Package },
                        ...(item.category?.parent ? [{ label: item.category.parent.name, href: `/dashboard/warehouse/${item.category.parent.id}` }] : []),
                        ...(item.category ? [{ label: item.category.name, href: `/dashboard/warehouse/${item.category.id}` }] : []),
                        { label: item.name }
                    ]}
                />
            </div>

            <div className="max-w-[1600px] mx-auto px-8 mt-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT COLUMN: Sticky Summary & Photo */}
                    <aside className="w-full lg:w-[400px] lg:sticky lg:top-8 space-y-6">
                        {/* Main Item Card */}
                        <div className="bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                            {/* Actions Overlay for Images in the sticky card */}
                            <div className="relative aspect-square bg-slate-100 group overflow-hidden">
                                {item.image ? (
                                    <div className="w-full h-full relative overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className={cn(
                                                "transition-transform duration-500",
                                                (isEditing ? editData.thumbnailSettings : item.thumbnailSettings) ? "object-cover" : "object-contain p-4"
                                            )}
                                            style={(() => {
                                                const settings = isEditing ? editData.thumbnailSettings : item.thumbnailSettings;
                                                if (!settings) return {};
                                                return {
                                                    transform: `scale(${settings.zoom}) translate(${settings.x}%, ${settings.y}%)`,
                                                    transformOrigin: 'center center'
                                                };
                                            })()}
                                            unoptimized
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <ImageIcon className="w-16 h-16 mb-2 opacity-20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Нет фото</span>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="p-3 bg-white rounded-2xl text-indigo-600 shadow-2xl hover:scale-110 transition-transform cursor-pointer pointer-events-auto">
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpdate(file, "front");
                                                }}
                                            />
                                            <RefreshCcw className="w-5 h-5" />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="p-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Название</label>
                                                <input
                                                    value={editData.name}
                                                    onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full text-xl font-black text-slate-900 tracking-tight bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500/10 outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                                                    {item.name}
                                                </h1>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                        {item.sku}
                                                    </span>
                                                    <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 uppercase text-[9px] font-black">
                                                        {item.category?.name}
                                                    </Badge>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-6 space-y-3">
                                        {isEditing ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsEditing(false)}
                                                    className="h-12 rounded-2xl font-bold text-slate-600"
                                                >
                                                    Отмена
                                                </Button>
                                                <Button
                                                    onClick={handleSave}
                                                    disabled={isSaving || isAnyUploading}
                                                    className="h-12 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black shadow-lg shadow-indigo-100"
                                                >
                                                    {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Сохранить"}
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black shadow-xl shadow-indigo-200/50 flex items-center justify-center gap-2 group transition-all"
                                                >
                                                    <Edit3 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                    Редактировать
                                                </Button>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleDownload}
                                                        className="h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-white"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Экспорт
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowDeleteConfirm(true)}
                                                        className="h-12 rounded-2xl border-rose-100 text-rose-500 font-bold hover:bg-rose-50 hover:border-rose-200"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Удалить
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Card */}
                        <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-900/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Текущий остаток</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">{item.quantity}</span>
                                <span className="text-sm font-bold text-slate-500 uppercase">{item.unit}</span>
                            </div>
                            <div className="mt-8">
                                <Button
                                    onClick={() => setAdjustType("set")}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Корректировка
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: Scrolable Content Flow */}
                    <main className="flex-1 space-y-12 pb-20">
                        {/* Section 1: Overview & Attributes */}
                        <section className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <Info className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Обзор и характеристики</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Параметры изделия и конструктор SKU</p>
                                </div>
                            </div>
                            <ItemGeneralInfo
                                item={item}
                                isEditing={isEditing}
                                categories={categories}
                                attributeTypes={attributeTypes}
                                allAttributes={allAttributes}
                                measurementUnits={measurementUnits}
                                editData={editData}
                                onUpdateField={(field, value) => setEditData(prev => ({ ...prev, [field]: value }))}
                                onUpdateAttribute={handleAttributeChange}
                            />
                        </section>

                        {/* Section 2: Media Gallery */}
                        <section className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Медиа-галерея</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Дополнительные фото и ракурсы</p>
                                </div>
                            </div>
                            <ItemMediaSection
                                item={item}
                                isEditing={isEditing}
                                onImageChange={handleImageUpdate}
                                onImageRemove={handleImageRemove}
                                thumbnailSettings={editData.thumbnailSettings}
                                onUpdateThumbnailSettings={(settings: ThumbnailSettings) => setEditData(prev => ({ ...prev, thumbnailSettings: settings }))}
                            />
                        </section>

                        {/* Section 3: Inventory */}
                        <section className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Складской учет</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Расположение и история остатков</p>
                                </div>
                            </div>
                            <ItemInventorySection
                                item={item}
                                stocks={stocks}
                                storageLocations={storageLocations}
                                isEditing={isEditing}
                                editData={editData}
                                onUpdateField={(field, value) => setEditData(prev => ({ ...prev, [field]: value }))}
                                onAdjustStock={(locId) => {
                                    setSelectedLocationForAdjust(locId || null);
                                    setAdjustType("set");
                                }}
                                onTransferStock={(fromLocId) => {
                                    setShowTransfer(true);
                                }}
                            />
                        </section>

                        {/* Section 4: History */}
                        <section className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/40">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Лог операций</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Полная история движений товара</p>
                                </div>
                            </div>
                            <ItemHistorySection
                                history={history}
                            />
                        </section>
                    </main>
                </div>
            </div>

            {/* Dialogs */}
            {adjustType && (
                <AdjustStockDialog
                    item={{
                        ...item,
                        storageLocationId: selectedLocationForAdjust || item.storageLocationId
                    }}
                    locations={storageLocations as any}
                    itemStocks={stocks}
                    initialType={adjustType as any}
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
                    locations={storageLocations as any}
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
                title="Удалить товар?"
                description="Это действие нельзя отменить. Товар будет полностью удален из базы данных."
            />
        </div>
    );
}
