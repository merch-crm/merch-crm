"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Image as ImageIcon,
    MapPin,
    Clock,
    Zap,
    TrendingUp,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
    InventoryItem,
    Category,
    InventoryAttribute,
    AttributeType,
    ItemHistoryTransaction,
    MeasurementUnit,
    StorageLocation,
    ItemStock
} from "../../types";

import {
    deleteInventoryItems,
    getItemHistory,
    updateInventoryItem,
    getItemStocks
} from "../../actions";

import { useToast } from "../../../../../components/ui/toast";
import { Button } from "@/components/ui/button";


import { ItemGeneralInfo } from "./components/ItemGeneralInfo";
import { ItemMediaSection } from "./components/ItemMediaSection";
import { ItemInventorySection } from "./components/ItemInventorySection";
import { ItemHistorySection } from "./components/ItemHistorySection";
import { ItemHeader } from "./components/ItemHeader";
import { AdjustStockDialog } from "../../adjust-stock-dialog";
import { TransferItemDialog } from "./transfer-item-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ItemDetailClientProps {
    item: InventoryItem;
    storageLocations: StorageLocation[];
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
}

export function ItemDetailClient({
    item: initialItem,
    storageLocations,
    attributeTypes,
    allAttributes
}: ItemDetailClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [item, setItem] = useState(initialItem);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [prevInitialItem, setPrevInitialItem] = useState(initialItem);
    const [editData, setEditData] = useState<Partial<InventoryItem>>({
        name: initialItem.name,
        sku: initialItem.sku || "",
        description: initialItem.description || "",
        unit: initialItem.unit,
        lowStockThreshold: initialItem.lowStockThreshold || 10,
        criticalStockThreshold: initialItem.criticalStockThreshold || 0,
        attributes: (initialItem.attributes as Record<string, string>) || {},
        categoryId: initialItem.categoryId || "",
        qualityCode: initialItem.qualityCode || "",
        attributeCode: initialItem.attributeCode || "",
        sizeCode: initialItem.sizeCode || "",
        materialCode: initialItem.materialCode || "",
        brandCode: initialItem.brandCode || "",
        thumbnailSettings: initialItem.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
    });

    const [history, setHistory] = useState<ItemHistoryTransaction[]>([]);
    const [stocks, setStocks] = useState<ItemStock[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [adjustType, setAdjustType] = useState<"in" | "out" | "set" | null>(null);
    const [selectedLocationForAdjust, setSelectedLocationForAdjust] = useState<string | null>(null);
    const [showTransfer, setShowTransfer] = useState(false);

    // Image update states
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImageBackFile, setNewImageBackFile] = useState<File | null>(null);
    const [newImageSideFile, setNewImageSideFile] = useState<File | null>(null);
    const [newImageDetailsFiles, setNewImageDetailsFiles] = useState<File[]>([]);
    const [uploadStates, setUploadStates] = useState<Record<string, { uploading: boolean, progress: number, uploaded: boolean }>>({});

    const isAnyUploading = Object.values(uploadStates).some(s => s.uploading);

    const handleImageUpdate = (file: File | null, type: "front" | "back" | "side" | "details") => {
        if (!file) return;
        if (type === "front") setNewImageFile(file);
        if (type === "back") setNewImageBackFile(file);
        if (type === "side") setNewImageSideFile(file);
        if (type === "details" && file) {
            const currentCount = (item.imageDetails?.length || 0);
            const pendingCount = newImageDetailsFiles.length;

            if (currentCount + pendingCount >= 3) {
                toast("Максимальное количество дополнительных фото — 3", "error");
                return;
            }

            const nextIndex = pendingCount;
            setNewImageDetailsFiles(prev => [...prev, file]);
            simulateUpload("details", file.name);
            return;
        }

        simulateUpload(type, file.name);
    };

    const simulateUpload = (type: string, fileName: string) => {
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
                toast(`Файл ${fileName} готов`, "success");
            } else {
                setUploadStates(prev => ({
                    ...prev,
                    [type]: { ...prev[type], progress }
                }));
            }
        }, 300);
    };

    const handleImageRemove = (type: string, index?: number) => {
        if (type === "details" && typeof index === "number") {
            const newDetails = [...(item.imageDetails || [])];
            newDetails.splice(index, 1);
            setItem(prev => ({ ...prev, imageDetails: newDetails }));
        } else {
            setItem(prev => ({ ...prev, [type === "front" ? "image" : type === "back" ? "imageBack" : "imageSide"]: null }));
        }
    };

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
                attributes: (initialItem.attributes as Record<string, string>) || {},
                categoryId: initialItem.categoryId || "",
                qualityCode: initialItem.qualityCode || "",
                attributeCode: initialItem.attributeCode || "",
                sizeCode: initialItem.sizeCode || "",
                materialCode: initialItem.materialCode || "",
                brandCode: initialItem.brandCode || "",
                thumbnailSettings: initialItem.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
            });
        }
    }

    const handleAttributeChange = (key: string, value: string) => {
        setEditData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [key]: value } as Record<string, string>
        }));
    };

    useEffect(() => {
        async function fetchData() {
            const [historyRes, stocksRes] = await Promise.all([
                getItemHistory(item.id),
                getItemStocks(item.id)
            ]);

            if (historyRes.data) setHistory(historyRes.data as ItemHistoryTransaction[]);
            if (stocksRes.data) setStocks(stocksRes.data as ItemStock[]);
        }
        fetchData();
    }, [item.id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("id", item.id);
            formData.append("name", editData.name || "");
            formData.append("sku", editData.sku || "");
            formData.append("description", editData.description || "");
            formData.append("unit", editData.unit || "шт");
            formData.append("categoryId", editData.categoryId || "");
            formData.append("lowStockThreshold", String(editData.lowStockThreshold || 10));
            formData.append("criticalStockThreshold", String(editData.criticalStockThreshold || 0));

            formData.append("qualityCode", editData.qualityCode || "");
            formData.append("materialCode", editData.materialCode || "");
            formData.append("attributeCode", editData.attributeCode || "");
            formData.append("sizeCode", editData.sizeCode || "");
            formData.append("brandCode", editData.brandCode || "");

            if (newImageFile) formData.append("image", newImageFile);
            if (newImageBackFile) formData.append("imageBack", newImageBackFile);
            if (newImageSideFile) formData.append("imageSide", newImageSideFile);
            newImageDetailsFiles.forEach(file => formData.append("imageDetails", file));

            formData.append("attributes", JSON.stringify(editData.attributes || {}));
            formData.append("thumbnailSettings", JSON.stringify(editData.thumbnailSettings || { zoom: 1, x: 0, y: 0 }));

            await updateInventoryItem(item.id, formData);
            toast("Изменения сохранены", "success");
            setIsEditing(false);
            setNewImageFile(null);
            setNewImageBackFile(null);
            setNewImageSideFile(null);
            setNewImageDetailsFiles([]);
            setUploadStates({});
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            toast("Ошибка при сохранении", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteInventoryItems([item.id]);
            toast("Товар удален", "success");
            router.push("/dashboard/warehouse");
        } catch {
            toast("Ошибка при удалении", "error");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleDownload = () => {
        toast("Экспорт начат...", "info");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
            <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-8">
                {/* Custom Header with FinTech Style */}
                <ItemHeader
                    item={item}
                    isEditing={isEditing}
                    isSaving={isSaving}
                    isAnyUploading={isAnyUploading}
                    editName={editData.name || ""}
                    onEditNameChange={(name) => setEditData(prev => ({ ...prev, name }))}
                    onCancel={() => setIsEditing(false)}
                    onSave={handleSave}
                    onEdit={() => setIsEditing(true)}
                    onDelete={() => setShowDeleteConfirm(true)}
                    onDownload={handleDownload}
                />

                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* LEFT COLUMN: The "Cards" View (FinTech Inspired) */}
                    <aside className="w-full lg:w-[420px] space-y-8 shrink-0 lg:sticky lg:top-8 animate-in fade-in slide-in-from-left-4 duration-1000">

                        {/* THE MAIN CARD: Photo & Primary Info */}
                        <div className="relative group bg-white rounded-[18px] shadow-sm border border-slate-200/60 overflow-hidden transform transition-all hover:shadow-md">
                            <div className="relative aspect-square bg-[#F8FAFC]">
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className={cn(
                                            "transition-all duration-700",
                                            (isEditing ? editData.thumbnailSettings : item.thumbnailSettings) ? "object-cover" : "object-contain p-8"
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
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200">
                                        <ImageIcon className="w-20 h-20 opacity-20" />
                                    </div>
                                )}

                                {/* Overlay Accent */}
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-[18px] bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <div className="text-[10px] font-bold text-white bg-indigo-600 inline-block px-3 py-1 rounded-[18px]">
                                        Прайм-позиция
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 leading-none">{item.name}</h2>
                                    <p className="text-sm font-medium text-slate-400">{item.sku || "NO-SKU"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-[18px] border border-slate-100/50">
                                        <div className="text-xs font-medium text-slate-400 mb-1">Остаток</div>
                                        <div className="text-2xl font-bold text-slate-950 leading-none">{item.quantity} <span className="text-sm text-slate-400">{item.unit}</span></div>
                                    </div>
                                    <div className="bg-emerald-50 p-6 rounded-[18px] border border-emerald-100 flex flex-col justify-center">
                                        <div className="text-xs font-medium text-emerald-600 mb-1">Статус</div>
                                        <div className="text-sm font-bold text-emerald-700 leading-none">В наличии</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECOND CARD: Quick Actions or Stats */}
                        <div className="bg-slate-900 rounded-[18px] p-10 text-white shadow-lg space-y-10 group overflow-hidden relative border border-white/5">
                            {/* Decorative glow */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-colors duration-700" />

                            <div className="relative flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-400">Управление стоком</span>
                                <div className="w-10 h-10 rounded-[18px] bg-white/10 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all cursor-pointer">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>

                            <div className="relative space-y-3">
                                <Button
                                    onClick={() => setAdjustType("set")}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-[18px] h-16 text-sm font-bold transition-all border-none shadow-md"
                                >
                                    Корректировка
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowTransfer(true)}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-[18px] h-14 text-sm font-bold transition-all"
                                >
                                    Перемещение
                                </Button>
                            </div>
                        </div>

                        {/* THIRD CARD: Search/Filter or Mini-Analytics */}
                        <div className="bg-white rounded-[18px] p-6 border border-slate-200/60 shadow-sm flex items-center gap-4 group hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-all">
                                <Search className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <input
                                    placeholder="Поиск по истории..."
                                    className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 w-full placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT COLUMN: The Detail Flow (Neumorphic/FinTech Content) */}
                    <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000 pb-20">

                        {/* SECTION: CHARACTERISTICS */}
                        <div className="bg-white rounded-[18px] p-10 shadow-sm border border-slate-200/40">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 rounded-[18px] bg-slate-900 flex items-center justify-center text-white shadow-sm">
                                    <Zap className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-950">Спецификация</h3>
                                    <p className="text-[11px] font-bold text-slate-400">Параметры конструктора и свойства</p>
                                </div>
                            </div>
                            <ItemGeneralInfo
                                item={item}
                                isEditing={isEditing}
                                attributeTypes={attributeTypes}
                                allAttributes={allAttributes}
                                editData={editData as unknown as InventoryItem}
                                onUpdateField={(field, value) => setEditData(prev => ({ ...prev, [field]: value }))}
                                onUpdateAttribute={handleAttributeChange}
                            />
                        </div>

                        {/* SECTION: MEDIA */}
                        <div className="bg-slate-900 rounded-[18px] p-10 shadow-lg border border-white/5">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white">Галерея</h3>
                                    <p className="text-[11px] font-bold text-slate-500">База визуальных материалов</p>
                                </div>
                            </div>
                            <ItemMediaSection
                                item={item}
                                isEditing={isEditing}
                                onImageChange={handleImageUpdate}
                                onImageRemove={handleImageRemove}
                                thumbnailSettings={editData.thumbnailSettings}
                            />
                        </div>

                        {/* SECTION: INVENTORY */}
                        <div className="bg-white rounded-[18px] p-10 shadow-sm border border-slate-200/40">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 rounded-[18px] bg-slate-900 flex items-center justify-center text-white shadow-sm">
                                    <MapPin className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-950">Складская база</h3>
                                    <p className="text-[11px] font-bold text-slate-400">Расположение и запасы</p>
                                </div>
                            </div>
                            <ItemInventorySection
                                item={item}
                                stocks={stocks}
                                isEditing={isEditing}
                                editData={editData as unknown as InventoryItem}
                                onUpdateField={(field, value) => setEditData(prev => ({ ...prev, [field]: value }))}
                                onAdjustStock={(locId) => {
                                    setSelectedLocationForAdjust(locId || null);
                                    setAdjustType("set");
                                }}
                                onTransferStock={() => {
                                    setShowTransfer(true);
                                }}
                            />
                        </div>

                        {/* SECTION: HISTORY */}
                        <div className="bg-white rounded-[18px] p-10 shadow-sm border border-slate-200/40">
                            <div className="flex items-center gap-4 mb-12">
                                <div className="w-12 h-12 rounded-[18px] bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-200 shadow-sm">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-950">Активность</h3>
                                    <p className="text-[11px] font-bold text-slate-400">Лог операций и транзакций</p>
                                </div>
                            </div>
                            <ItemHistorySection
                                history={history}
                            />
                        </div>
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
                isLoading={isDeleting}
                title="Удалить товар?"
                description="Это действие нельзя отменить. Товар будет полностью удален из базы данных."
            />
        </div>
    );
}
