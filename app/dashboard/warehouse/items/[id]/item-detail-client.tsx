"use client";

import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import {
    X, Package, MapPin, Info, ArrowUpRight, ArrowDownLeft,
    Clock, ArrowLeft, Edit3, Trash2,
    Download, Save, RefreshCcw, Plus, Minus,
    MoveHorizontal, ChevronDown, Shirt, Box, Wrench,
    Image as ImageIcon, ChevronLeft, ChevronRight, Check
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
import { CLOTHING_COLORS, CLOTHING_SIZES, CLOTHING_QUALITIES, CLOTHING_MATERIALS } from "../../category-utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    criticalStockThreshold: number;
    description: string | null;
    location: string | null;
    storageLocationId: string | null;
    image: string | null;
    imageBack: string | null;
    imageSide: string | null;
    imageDetails: string[];
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
        prefix?: string | null;
        parent?: {
            id: string;
            name: string;
        } | null;
    } | null;
}

export interface Category {
    id: string;
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    prefix?: string | null;
    parentId?: string | null;
    sortOrder: number;
    isActive: boolean;
    parent?: {
        id: string;
        name: string;
    } | null;
}

interface ItemDetailClientProps {
    item: InventoryItem;
    storageLocations: StorageLocation[];
    measurementUnits: { id: string, name: string }[];
    categories: Category[];
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

function CustomFileInput({
    label,
    file,
    files,
    multiple,
    onChange,
    onChangeFiles,
    isUploading,
    uploadProgress,
    isUploaded
}: {
    label: string,
    file?: File | null,
    files?: File[],
    multiple?: boolean,
    onChange?: (file: File | null) => void,
    onChangeFiles?: (files: File[]) => void,
    isUploading?: boolean,
    uploadProgress?: number,
    isUploaded?: boolean
}) {
    return (
        <div>
            <div className="flex items-center gap-4">
                <label className={cn("cursor-pointer group relative", isUploading && "pointer-events-none opacity-50")}>
                    <input
                        type="file"
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                        disabled={isUploading}
                        onChange={(e) => {
                            if (multiple && onChangeFiles) {
                                onChangeFiles(Array.from(e.target.files || []));
                            } else if (onChange) {
                                onChange(e.target.files?.[0] || null);
                            }
                        }}
                    />
                    <div className={cn(
                        "h-11 px-7 rounded-2xl flex items-center justify-center transition-all border",
                        isUploaded
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 active:scale-95 border-indigo-100/50"
                    )}>
                        {isUploading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                    {uploadProgress}%
                                </span>
                            </div>
                        ) : isUploaded ? (
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                ✓ Загружено
                            </span>
                        ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                {label || (multiple ? "Выбрать файлы" : "Выберите файл")}
                            </span>
                        )}
                    </div>
                </label>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {multiple ? (
                        files && files.length > 0 ? `${files.length} файл(ов)` : "Файлы не выбраны"
                    ) : (
                        file ? file.name : "Файл не выбран"
                    )}
                </div>
            </div>
        </div>
    );
}

function getAllItemImages(item: InventoryItem) {
    const images: { src: string; label: string }[] = [];
    if (item.image) images.push({ src: item.image, label: "Лицевая сторона" });
    if (item.imageBack) images.push({ src: item.imageBack, label: "Со спины" });
    if (item.imageSide) images.push({ src: item.imageSide, label: "Сбоку" });
    if (item.imageDetails && item.imageDetails.length > 0) {
        item.imageDetails.forEach((img: string, idx: number) => {
            images.push({ src: img, label: `Детали ${idx + 1}` });
        });
    }
    return images;
}

interface PhotoGalleryProps {
    item: InventoryItem;
    onImageClick: (index: number) => void;
}

function PhotoGallery({ item, onImageClick }: PhotoGalleryProps) {
    const [galleryIndex, setGalleryIndex] = React.useState(0);
    const allImages = getAllItemImages(item);

    const visibleImages = allImages.slice(galleryIndex, galleryIndex + 4);
    const hasMore = allImages.length > 4;
    const canGoBack = galleryIndex > 0;
    const canGoForward = galleryIndex + 4 < allImages.length;

    return (
        <div className="pt-10 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-6">
                <ImageIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Галерея фотографий</h3>
            </div>

            <div className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visibleImages.map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => onImageClick(galleryIndex + idx)}
                            className="group relative aspect-square rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                        >
                            <Image
                                src={img.src}
                                alt={img.label}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <span className="text-xs font-black text-white uppercase tracking-wider">{img.label}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <button
                            onClick={() => setGalleryIndex(Math.max(0, galleryIndex - 4))}
                            disabled={!canGoBack}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                canGoBack
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            )}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {galleryIndex + 1}-{Math.min(galleryIndex + 4, allImages.length)} из {allImages.length}
                        </span>
                        <button
                            onClick={() => setGalleryIndex(galleryIndex + 4)}
                            disabled={!canGoForward}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                canGoForward
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function ItemDetailClient({ item: initialItem, storageLocations, measurementUnits, categories }: ItemDetailClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [item, setItem] = useState(initialItem);
    const [history, setHistory] = useState<ItemHistoryTransaction[]>([]);
    const [stocks, setStocks] = useState<ItemStock[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // History Pagination State
    const [historyPage, setHistoryPage] = useState(1);
    const historyPerPage = 5;

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
        categoryId: initialItem.categoryId || ""
    });
    const [isSaving, setIsSaving] = useState(false);

    // Dialogs state
    const [adjustType, setAdjustType] = useState<"in" | "out" | "set" | null>(null);
    const [selectedLocationForAdjust, setSelectedLocationForAdjust] = useState<string | null>(null);
    const [showTransfer, setShowTransfer] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAdjustMenuOpen, setIsAdjustMenuOpen] = useState(false);

    const [prevInitialItem, setPrevInitialItem] = useState(initialItem);

    const [qualityCode, setQualityCode] = useState(initialItem.qualityCode || "");
    const [attributeCode, setAttributeCode] = useState(initialItem.attributeCode || "");
    const [sizeCode, setSizeCode] = useState(initialItem.sizeCode || "");

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

    // Fullscreen Gallery State
    const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

    // Image View State
    const [activeImage, setActiveImage] = useState<string | null>(initialItem.image);

    const allImages = getAllItemImages(item);

    const openFullscreen = (index: number) => {
        setFullscreenIndex(index);
    };

    const closeFullscreen = useCallback(() => {
        setFullscreenIndex(null);
    }, []);

    const navigateFullscreen = useCallback((direction: "prev" | "next") => {
        if (fullscreenIndex === null) return;
        if (direction === "prev" && fullscreenIndex > 0) {
            setFullscreenIndex(fullscreenIndex - 1);
        } else if (direction === "next" && fullscreenIndex < allImages.length - 1) {
            setFullscreenIndex(fullscreenIndex + 1);
        }
    }, [fullscreenIndex, allImages.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (fullscreenIndex === null) return;
            if (e.key === "Escape") closeFullscreen();
            if (e.key === "ArrowLeft") navigateFullscreen("prev");
            if (e.key === "ArrowRight") navigateFullscreen("next");
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [fullscreenIndex, closeFullscreen, navigateFullscreen]);

    // Sync state with props when server-side data refreshes (e.g. after quantity update)
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
                categoryId: initialItem.categoryId || ""
            });
            setQualityCode(initialItem.qualityCode || "");
            setAttributeCode(initialItem.attributeCode || "");
            setSizeCode(initialItem.sizeCode || "");
            setActiveImage(initialItem.image);
        }
    }

    const isClothing = item.itemType === "clothing" || item.category?.name.toLowerCase().includes("одежда") || item.category?.parent?.name.toLowerCase().includes("одежда");

    const parentCategory = item.category?.parent;
    const currentCategory = item.category;

    const [isThumbnailEditing, setIsThumbnailEditing] = useState(false);
    const [thumbnailSettings, setThumbnailSettings] = useState<{ x: number; y: number; scale: number }>({ x: 50, y: 50, scale: 1 });

    useEffect(() => {
        if (item.attributes?.thumbnailSettings) {
            setThumbnailSettings(item.attributes.thumbnailSettings as any);
        }
    }, [item.attributes]);

    const skuPreview = currentCategory?.prefix
        ? [currentCategory.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-")
        : "";

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

    const isAnyUploading =
        uploadStates.front.uploading ||
        uploadStates.back.uploading ||
        uploadStates.side.uploading ||
        uploadStates.details.some(d => d.uploading);

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
        formData.append("criticalStockThreshold", editData.criticalStockThreshold.toString());
        formData.append("categoryId", editData.categoryId);
        formData.append("quantity", initialItem.quantity.toString());
        formData.append("storageLocationId", initialItem.storageLocationId || "");
        formData.append("reservedQuantity", (initialItem.reservedQuantity || 0).toString());
        formData.append("location", initialItem.location || "");
        formData.append("attributes", JSON.stringify(editData.attributes));

        // Add SKU constructor codes
        formData.append("qualityCode", qualityCode);
        formData.append("attributeCode", attributeCode);
        formData.append("sizeCode", sizeCode);

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

    const typeConfig = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.clothing;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto px-4 pb-8 pt-2">
            {/* Navigation & Header */}
            <div className="space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Склад", href: "/dashboard/warehouse", icon: Package },
                        ...(parentCategory ? [{ label: parentCategory.name, href: `/dashboard/warehouse/${parentCategory.id}` }] : []),
                        ...(currentCategory ? [{ label: currentCategory.name, href: `/dashboard/warehouse/${currentCategory.id}` }] : []),
                        { label: item.name }
                    ]}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => router.back()}
                            className="group w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shrink-0 shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                        </button>

                        <div>
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
                                <Badge className={cn("px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter shrink-0", typeConfig.color)}>
                                    <typeConfig.icon className="w-3.5 h-3.5 mr-1.5 inline" />
                                    {typeConfig.name}
                                </Badge>
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-6">
                                {isEditing ? (
                                    <>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Артикул товара</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    value={editData.sku}
                                                    onChange={e => setEditData({ ...editData, sku: e.target.value })}
                                                    className="h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-sm font-bold text-slate-900 uppercase tracking-widest font-mono transition-all min-w-[200px]"
                                                    placeholder="Напр. CLO-BASE"
                                                />
                                                {skuPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditData({ ...editData, sku: skuPreview })}
                                                        className="h-12 px-4 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
                                                    >
                                                        Исп. конструктор: {skuPreview}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 flex flex-col">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Ед. измерения</label>
                                            <div className="h-12 px-4 rounded-xl border border-slate-200 bg-white flex items-center min-w-[120px]">
                                                <UnitSelect
                                                    value={editData.unit}
                                                    onChange={val => setEditData({ ...editData, unit: val })}
                                                    options={measurementUnits}
                                                    className="w-full justify-between h-auto text-sm font-bold text-indigo-600"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-slate-400 uppercase tracking-widest leading-none font-bold text-xs">Арт.: {item.sku || "Без артикула"}</span>
                                )}
                            </div>

                            {/* Category & Subcategory Display/Edit */}

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
                                            lowStockThreshold: item.lowStockThreshold || 10,
                                            criticalStockThreshold: item.criticalStockThreshold || 0,
                                            attributes: item.attributes || {},
                                            categoryId: item.categoryId || ""
                                        });
                                    }}
                                    className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Отмена
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving || isAnyUploading}
                                    className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                            Сохранение...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            {isAnyUploading ? "Загрузка фото..." : "Сохранить"}
                                        </>
                                    )}
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
                                    className="h-12 w-12 p-0 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Image & Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="space-y-4">
                        <div
                            onClick={() => {
                                if (isEditing) {
                                    setIsThumbnailEditing(true);
                                } else {
                                    const index = allImages.findIndex(img => img.src === activeImage);
                                    if (index !== -1) setFullscreenIndex(index);
                                }
                            }}
                            className={cn(
                                "relative aspect-square rounded-[3rem] bg-white border border-slate-200/60 overflow-hidden shadow-xl shadow-slate-200/50 group",
                                (activeImage || isEditing) && "cursor-pointer"
                            )}
                        >
                            {activeImage ? (
                                <>
                                    <Image
                                        src={activeImage}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-all duration-700 group-hover:scale-105"
                                        style={{
                                            objectPosition: `50% ${thumbnailSettings.y}%`,
                                            transform: `scale(${thumbnailSettings.scale}) translate(${(thumbnailSettings.x - 50) * (thumbnailSettings.scale - 1)}%, 0)`
                                        }}
                                        unoptimized
                                    />
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                                <ImageIcon className="w-4 h-4 text-indigo-600" />
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Настроить миниатюру</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                    <Package className="w-24 h-24 text-slate-200" />
                                </div>
                            )}
                            {(() => {
                                const available = item.quantity - (item.reservedQuantity || 0);
                                if (available <= (item.criticalStockThreshold || 0)) {
                                    return (
                                        <Badge className="absolute top-6 left-6 px-4 py-2 text-[10px] font-black border-none shadow-lg bg-rose-600 text-white animate-pulse uppercase tracking-widest">
                                            СКЛАД ПУСТОЙ ({available} {item.unit})
                                        </Badge>
                                    );
                                }
                                if (available <= (item.lowStockThreshold || 10)) {
                                    return (
                                        <Badge className="absolute top-6 left-6 px-4 py-2 text-[10px] font-black border-none shadow-lg bg-amber-500 text-white uppercase tracking-widest">
                                            ЗАКАНЧИВАЕТСЯ ({available} {item.unit})
                                        </Badge>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>

                    {/* Stock Adjustment & Transfer */}
                    {!isEditing && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Button
                                        onClick={() => setIsAdjustMenuOpen(!isAdjustMenuOpen)}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-widest text-[11px]"
                                    >
                                        <RefreshCcw className="w-4 h-4" />
                                        Корректировка
                                        <ChevronDown className={cn("w-4 h-4 ml-auto transition-transform", isAdjustMenuOpen && "rotate-180")} />
                                    </Button>

                                    {isAdjustMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsAdjustMenuOpen(false)} />
                                            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <button
                                                    onClick={() => { setAdjustType("in"); setIsAdjustMenuOpen(false); }}
                                                    className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 group transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                        <Plus className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Поставка</span>
                                                </button>
                                                <button
                                                    onClick={() => { setAdjustType("out"); setIsAdjustMenuOpen(false); }}
                                                    className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 group transition-colors border-t border-slate-50"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all">
                                                        <Minus className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Списание</span>
                                                </button>
                                                <button
                                                    onClick={() => { setAdjustType("set"); setIsAdjustMenuOpen(false); }}
                                                    className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 group transition-colors border-t border-slate-50"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Корректировка</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <Button
                                    onClick={() => setShowTransfer(true)}
                                    variant="outline"
                                    className="flex-1 h-14 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm font-black gap-2 active:scale-[0.98] uppercase tracking-widest text-[11px]"
                                >
                                    <MoveHorizontal className="w-4 h-4" />
                                    Перемещение
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Всего</span>
                                    <div className="text-xl font-black text-slate-900 leading-none">{item.quantity} {item.unit}</div>
                                </div>
                                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Бронь</span>
                                    <div className="text-xl font-black text-rose-600 leading-none">{item.reservedQuantity || 0} {item.unit}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Edit Images */}
                    {isEditing && (
                        <div className="p-8 bg-white rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-200/50 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="w-5 h-5 text-indigo-500" />
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Обновить фото</h3>
                            </div>

                            {/* Front Photo */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Основное фото</span>
                                    {newImageFile && (
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Файл выбран</span>
                                    )}
                                </div>

                                {newImageFile ? (
                                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-0.5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                Лицевая сторона
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={uploadStates.front.uploaded ? "text-emerald-500" : "text-indigo-500"}>
                                                    {uploadStates.front.uploaded ? "Готово" : `${uploadStates.front.progress}%`}
                                                </span>
                                                <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 ml-1">
                                                    <label className="cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors group/btn">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (f) {
                                                                    setNewImageFile(f);
                                                                    simulateUpload("front", f.name);
                                                                }
                                                            }}
                                                        />
                                                        <RefreshCcw className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" />
                                                    </label>
                                                    <button
                                                        onClick={() => {
                                                            setNewImageFile(null);
                                                            setUploadStates(prev => ({ ...prev, front: { uploading: false, progress: 0, uploaded: false } }));
                                                        }}
                                                        className="hover:bg-rose-50 p-1 rounded-lg transition-colors group/btn"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500 ease-out",
                                                    uploadStates.front.uploaded ? "bg-emerald-500" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                                )}
                                                style={{ width: `${uploadStates.front.progress}%` }}
                                            />
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 truncate opacity-60">
                                            {newImageFile.name}
                                        </div>
                                    </div>
                                ) : (
                                    <CustomFileInput
                                        label="Выбрать фото"
                                        onChange={(f) => {
                                            setNewImageFile(f);
                                            if (f) simulateUpload("front", f.name);
                                        }}
                                    />
                                )}
                            </div>

                            {/* Back Photo */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Фото со спины</span>
                                    {newImageBackFile && (
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Файл выбран</span>
                                    )}
                                </div>

                                {newImageBackFile ? (
                                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-0.5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                Спина
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={uploadStates.back.uploaded ? "text-emerald-500" : "text-indigo-500"}>
                                                    {uploadStates.back.uploaded ? "Готово" : `${uploadStates.back.progress}%`}
                                                </span>
                                                <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 ml-1">
                                                    <label className="cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors group/btn">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (f) {
                                                                    setNewImageBackFile(f);
                                                                    simulateUpload("back", f.name);
                                                                }
                                                            }}
                                                        />
                                                        <RefreshCcw className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" />
                                                    </label>
                                                    <button
                                                        onClick={() => {
                                                            setNewImageBackFile(null);
                                                            setUploadStates(prev => ({ ...prev, back: { uploading: false, progress: 0, uploaded: false } }));
                                                        }}
                                                        className="hover:bg-rose-50 p-1 rounded-lg transition-colors group/btn"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500 ease-out",
                                                    uploadStates.back.uploaded ? "bg-emerald-500" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                                )}
                                                style={{ width: `${uploadStates.back.progress}%` }}
                                            />
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 truncate opacity-60">
                                            {newImageBackFile.name}
                                        </div>
                                    </div>
                                ) : (
                                    <CustomFileInput
                                        label="Выбрать фото"
                                        onChange={(f) => {
                                            setNewImageBackFile(f);
                                            if (f) simulateUpload("back", f.name);
                                        }}
                                    />
                                )}
                            </div>

                            {/* Side Photo */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Фото сбоку</span>
                                    {newImageSideFile && (
                                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Файл выбран</span>
                                    )}
                                </div>

                                {newImageSideFile ? (
                                    <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-0.5">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                                Боковой ракурс
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={uploadStates.side.uploaded ? "text-emerald-500" : "text-indigo-500"}>
                                                    {uploadStates.side.uploaded ? "Готово" : `${uploadStates.side.progress}%`}
                                                </span>
                                                <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 ml-1">
                                                    <label className="cursor-pointer hover:bg-slate-50 p-1 rounded-lg transition-colors group/btn">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const f = e.target.files?.[0];
                                                                if (f) {
                                                                    setNewImageSideFile(f);
                                                                    simulateUpload("side", f.name);
                                                                }
                                                            }}
                                                        />
                                                        <RefreshCcw className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-indigo-500 transition-colors" />
                                                    </label>
                                                    <button
                                                        onClick={() => {
                                                            setNewImageSideFile(null);
                                                            setUploadStates(prev => ({ ...prev, side: { uploading: false, progress: 0, uploaded: false } }));
                                                        }}
                                                        className="hover:bg-rose-50 p-1 rounded-lg transition-colors group/btn"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500 ease-out",
                                                    uploadStates.side.uploaded ? "bg-emerald-500" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                                )}
                                                style={{ width: `${uploadStates.side.progress}%` }}
                                            />
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-400 truncate opacity-60">
                                            {newImageSideFile.name}
                                        </div>
                                    </div>
                                ) : (
                                    <CustomFileInput
                                        label="Выбрать фото"
                                        onChange={(f) => {
                                            setNewImageSideFile(f);
                                            if (f) simulateUpload("side", f.name);
                                        }}
                                    />
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-200/50 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Дополнительные детали</span>
                                    {newImageDetailsFiles.length > 0 && (
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase">{newImageDetailsFiles.length} файл(ов)</span>
                                    )}
                                </div>

                                {/* Sequential Progress Items */}
                                <div className="space-y-3">
                                    {newImageDetailsFiles.map((file, idx) => {
                                        const state = uploadStates.details[idx];
                                        return (
                                            <div key={idx} className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-0.5">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                        Деталь {idx + 1}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={state?.uploaded ? "text-emerald-500" : "text-indigo-500"}>
                                                            {state?.uploaded ? "Готово" : `${state?.progress || 0}%`}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 border-l border-slate-100 pl-2 ml-1">
                                                            <button
                                                                onClick={() => {
                                                                    setNewImageDetailsFiles(prev => prev.filter((_, i) => i !== idx));
                                                                    setUploadStates(prev => ({
                                                                        ...prev,
                                                                        details: prev.details.filter((_, i) => i !== idx)
                                                                    }));
                                                                }}
                                                                className="hover:bg-rose-50 p-1 rounded-lg transition-colors group/btn"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-500 ease-out",
                                                            state?.uploaded ? "bg-emerald-500" : "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                                        )}
                                                        style={{ width: `${state?.progress || 0}%` }}
                                                    />
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 truncate opacity-60">
                                                    {file.name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* The "Next" Upload Menu */}
                                <CustomFileInput
                                    label="Выбрать фото"
                                    onChange={(f) => {
                                        if (f) {
                                            const nextIndex = newImageDetailsFiles.length;
                                            setNewImageDetailsFiles(prev => [...prev, f]);
                                            simulateUpload("details", f.name, nextIndex);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Attributes & Description */}
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

                                </div>

                                <div className="mb-8 flex flex-wrap items-center gap-4">
                                    {isEditing ? (
                                        <>
                                            <div className="space-y-1.5 flex flex-col">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Категория (Авто)</label>
                                                <div className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center text-sm font-bold text-slate-500 min-w-[200px]">
                                                    {(() => {
                                                        const currentCat = categories.find(c => c.id === editData.categoryId);
                                                        if (!currentCat) return "—";
                                                        if (!currentCat.parentId) return currentCat.name;
                                                        return categories.find(p => p.id === currentCat.parentId)?.name || "—";
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 flex flex-col">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Подкатегория</label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="h-12 px-5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-sm font-black text-slate-800 transition-all hover:bg-slate-50 min-w-[260px] appearance-none shadow-sm active:scale-[0.98] group"
                                                        >
                                                            <span className="truncate">
                                                                {categories.find(c => c.id === editData.categoryId)?.name || "Без категории"}
                                                            </span>
                                                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        className="min-w-[260px] bg-[#333333] border-none rounded-[1.5rem] p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-[100]"
                                                        align="start"
                                                        sideOffset={8}
                                                    >
                                                        <div className="flex flex-col gap-0.5 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                                            <DropdownMenuItem
                                                                onClick={() => setEditData({ ...editData, categoryId: "" })}
                                                                className={cn(
                                                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none border-none relative",
                                                                    editData.categoryId === ""
                                                                        ? "bg-[#5086ec] text-white"
                                                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                                                )}
                                                            >
                                                                {editData.categoryId === "" && <Check className="w-3.5 h-3.5 absolute left-3" strokeWidth={3} />}
                                                                <span className={cn(editData.categoryId === "" ? "ml-4" : "")}>Без категории</span>
                                                            </DropdownMenuItem>

                                                            {categories.filter(c => c.parentId).sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                                                                <DropdownMenuItem
                                                                    key={c.id}
                                                                    onClick={() => setEditData({ ...editData, categoryId: c.id })}
                                                                    className={cn(
                                                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none border-none relative",
                                                                        editData.categoryId === c.id
                                                                            ? "bg-[#5086ec] text-white"
                                                                            : "text-white/70 hover:bg-white/10 hover:text-white"
                                                                    )}
                                                                >
                                                                    {editData.categoryId === c.id && <Check className="w-3.5 h-3.5 absolute left-3" strokeWidth={3} />}
                                                                    <span className={cn(editData.categoryId === c.id ? "ml-4" : "")}>{c.name}</span>
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">Категория:</span>
                                                <span className="text-slate-900 font-bold text-[11px] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg">
                                                    {item.category?.parent?.name || item.category?.name || "—"}
                                                </span>
                                            </div>
                                            {item.category?.parent && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 uppercase tracking-widest font-bold text-[10px]">Подкатегория:</span>
                                                    <span className="text-indigo-600 font-bold text-[11px] uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                                                        {item.category.name}
                                                    </span>
                                                </div>
                                            )}
                                        </>
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

                                {isEditing && isClothing && (
                                    <div className="p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 space-y-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Размер</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CLOTHING_SIZES.map(s => (
                                                    <button
                                                        key={s.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAttributeChange("Размер", s.name);
                                                            setSizeCode(s.code);
                                                        }}
                                                        className={cn(
                                                            "h-10 px-6 rounded-xl text-sm font-bold transition-all border shadow-sm",
                                                            editData.attributes["Размер"] === s.name ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Материал</label>
                                            <div className="flex flex-wrap gap-2">
                                                {CLOTHING_MATERIALS.map(m => (
                                                    <button
                                                        key={m.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAttributeChange("Материал", m.name);
                                                        }}
                                                        className={cn(
                                                            "h-10 px-6 rounded-xl text-sm font-bold transition-all border shadow-sm",
                                                            editData.attributes["Материал"] === m.name ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {m.name}
                                                    </button>
                                                ))}

                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Качество</label>
                                            <div className="flex gap-3">
                                                {CLOTHING_QUALITIES.map(q => (
                                                    <button
                                                        key={q.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAttributeChange("Качество", q.name);
                                                            setQualityCode(q.code);
                                                        }}
                                                        className={cn(
                                                            "flex-1 h-12 rounded-xl text-sm font-bold transition-all border shadow-sm",
                                                            editData.attributes["Качество"] === q.name ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-100" : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"
                                                        )}
                                                    >
                                                        {q.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Цвет</label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                                {CLOTHING_COLORS.map(c => (
                                                    <button
                                                        key={c.name}
                                                        type="button"
                                                        onClick={() => {
                                                            handleAttributeChange("Цвет", c.name);
                                                            setAttributeCode(c.code);
                                                        }}
                                                        className={cn(
                                                            "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all shadow-sm",
                                                            editData.attributes["Цвет"] === c.name ? "bg-white border-indigo-400 ring-4 ring-indigo-500/10" : "bg-white/50 border-slate-100 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="w-6 h-6 rounded-full border border-slate-200 shadow-sm shrink-0" style={{ backgroundColor: c.hex }} />
                                                        <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{c.name}</span>
                                                    </button>
                                                ))}

                                            </div>
                                        </div>

                                    </div>
                                )}

                                {!isEditing && isClothing && (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                        <div className="p-6 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-200/60 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Цвет</span>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-slate-200/50" style={{ backgroundColor: CLOTHING_COLORS.find(c => c.name === (editData.attributes["Цвет"] || item.attributes?.["Цвет"]))?.hex || "#f1f5f9" }} />
                                                <span className="text-lg font-black text-slate-900 leading-none">{editData.attributes["Цвет"] || item.attributes?.["Цвет"] || "—"}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-200/60 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Размер</span>
                                            <span className="text-lg font-black text-slate-900 leading-none">{editData.attributes["Размер"] || item.attributes?.["Размер"] || "—"}</span>
                                        </div>

                                        <div className="p-6 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-200/60 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Материал</span>
                                            <span className="text-lg font-black text-slate-900 leading-none">{editData.attributes["Материал"] || item.attributes?.["Материал"] || "—"}</span>
                                        </div>

                                        <div className="p-6 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl border border-slate-200/60 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Качество</span>
                                            <span className="text-lg font-black text-slate-900 leading-none">{editData.attributes["Качество"] || item.attributes?.["Качество"] || "—"}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-4 mt-8">
                                    {/* Specialized Attributes */}
                                    {Object.entries(item.attributes || {}).map(([key, value]) => {
                                        // Skip internal UI-only attributes like thumbnail settings
                                        if (key === "thumbnailSettings") return null;

                                        // Skip attributes shown in premium cards
                                        if (isClothing && ["Цвет", "Размер", "Материал", "Качество"].includes(key)) return null;

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

                                        if (!isEditing && value && typeof value !== "object") {
                                            return (
                                                <div key={key} className="px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col gap-1 min-w-[140px]">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ATTRIBUTE_LABELS[key] || key}</span>
                                                    <span className="text-sm font-black text-slate-900">{VALUE_LABELS[value as string] || value as string}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>



                            <div className="pt-10 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Хранение</h3>
                                    </div>
                                    <div className="flex items-center gap-6 bg-slate-50 border border-slate-100 px-6 py-2.5 rounded-[22px] shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black text-rose-500 uppercase tracking-widest leading-none">Пусто:</span>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-400">≤</span>
                                                    <input
                                                        type="number"
                                                        value={editData.criticalStockThreshold}
                                                        onChange={e => setEditData({ ...editData, criticalStockThreshold: parseInt(e.target.value) || 0 })}
                                                        className="w-12 h-7 pl-4 pr-1 text-[11px] font-black bg-white border border-rose-200 text-rose-600 rounded-lg outline-none focus:border-rose-400 transition-all text-center shadow-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-white border border-rose-100 text-rose-600 text-[11px] font-black rounded-lg shadow-sm">
                                                    ≤ {item.criticalStockThreshold || 0}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest leading-none">Мало:</span>
                                            {isEditing ? (
                                                <div className="relative">
                                                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-400">≤</span>
                                                    <input
                                                        type="number"
                                                        value={editData.lowStockThreshold}
                                                        onChange={e => setEditData({ ...editData, lowStockThreshold: parseInt(e.target.value) || 0 })}
                                                        className="w-12 h-7 pl-4 pr-1 text-[11px] font-black bg-white border border-amber-200 text-amber-600 rounded-lg outline-none focus:border-amber-400 transition-all text-center shadow-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-white border border-amber-100 text-amber-600 text-[11px] font-black rounded-lg shadow-sm">
                                                    ≤ {item.lowStockThreshold || 10}
                                                </div>
                                            )}
                                        </div>

                                        <div className="h-6 w-px bg-slate-200/60 mx-1" />

                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Общее:</span>
                                            <div className="px-3 py-1 bg-indigo-600 text-white text-[12px] font-black rounded-lg shadow-md shadow-indigo-100">
                                                {item.quantity} {item.unit}
                                            </div>
                                        </div>
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
                                {history.slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage).map((t) => {
                                    const getTransactionDisplay = (t: any) => {
                                        const reason = (t.reason || "").toLowerCase();

                                        if (t.type === "transfer") {
                                            return {
                                                label: "Перенос",
                                                color: "text-indigo-600",
                                                bg: "bg-indigo-50",
                                                icon: <MoveHorizontal className="w-6 h-6 opacity-50" />
                                            };
                                        }

                                        if (reason.includes("заказ")) {
                                            return {
                                                label: "Заказ",
                                                color: "text-violet-600",
                                                bg: "bg-violet-50",
                                                icon: <Package className="w-6 h-6" />
                                            };
                                        }

                                        if (reason.includes("коррект") || reason.includes("initial")) {
                                            return {
                                                label: "Корректировка",
                                                color: "text-sky-600",
                                                bg: "bg-sky-50",
                                                icon: <RefreshCcw className="w-6 h-6" />
                                            };
                                        }

                                        if (t.type === "in") {
                                            return {
                                                label: "Поставка",
                                                color: "text-emerald-600",
                                                bg: "bg-emerald-50",
                                                icon: <ArrowUpRight className="w-6 h-6" />
                                            };
                                        }

                                        return {
                                            label: "Списание",
                                            color: "text-rose-600",
                                            bg: "bg-rose-50",
                                            icon: <ArrowDownLeft className="w-6 h-6" />
                                        };
                                    };

                                    const display = getTransactionDisplay(t);
                                    const isIn = t.type === "in";
                                    const isTransfer = t.type === "transfer";

                                    return (
                                        <div key={t.id} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50/30 border border-slate-100 hover:border-indigo-100 hover:bg-white transition-all group">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105",
                                                display.bg, display.color
                                            )}>
                                                {display.icon}
                                            </div>

                                            <div className="grid grid-cols-[100px_1.5fr_100px_160px] gap-8 flex-1 items-center min-w-0">
                                                {/* Action & Reason */}
                                                <div className="min-w-0">
                                                    <div className={cn("text-[13px] font-black mb-0.5 uppercase tracking-tight", display.color)}>
                                                        {display.label}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-400 italic truncate opacity-70" title={t.reason || ""}>
                                                        {t.reason || "—"}
                                                    </div>
                                                </div>

                                                {/* Warehouse Column */}
                                                <div className="min-w-0 border-l border-slate-100/80 pl-8">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1.5">Склад</span>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                                        <div className="text-[13px] font-black text-slate-700 tracking-tight">
                                                            {t.storageLocation?.name || "—"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Amount */}
                                                <div className="border-l border-slate-100/80 pl-8">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">Кол-во</span>
                                                    <div className={cn("text-lg font-black tabular-nums whitespace-nowrap", display.color)}>
                                                        {isTransfer ? "" : (isIn ? "+" : "-")}{Math.abs(t.changeAmount)}
                                                        <span className="text-[10px] font-bold uppercase ml-1.5 opacity-40">{item.unit}</span>
                                                    </div>
                                                </div>

                                                {/* User & Date */}
                                                <div className="pl-8 border-l border-slate-100/80 min-w-0">
                                                    <div className="text-[11px] font-black text-slate-900 uppercase truncate mb-0.5">
                                                        {t.creator?.name || "Сист."}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400 whitespace-nowrap opacity-80">
                                                        {format(new Date(t.createdAt), "d MMM, HH:mm", { locale: ru })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Pagination Controls */}
                                {history.length > historyPerPage && (
                                    <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-slate-100/50">
                                        <button
                                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                            disabled={historyPage === 1}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                historyPage > 1
                                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
                                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                            )}
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                            {historyPage} из {Math.ceil(history.length / historyPerPage)}
                                        </span>
                                        <button
                                            onClick={() => setHistoryPage(p => Math.min(Math.ceil(history.length / historyPerPage), p + 1))}
                                            disabled={historyPage >= Math.ceil(history.length / historyPerPage)}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                historyPage < Math.ceil(history.length / historyPerPage)
                                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100"
                                                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                                            )}
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-16 text-center bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">История операций пуста</p>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Photo Gallery - Integrated here */}
            {
                !isEditing && allImages.length > 0 && (
                    <PhotoGallery item={item} onImageClick={openFullscreen} />
                )
            }

            {/* Dialogs */}
            {
                adjustType && (
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
                )
            }

            {
                showTransfer && (
                    <TransferItemDialog
                        item={item}
                        locations={storageLocations}
                        onClose={() => {
                            setShowTransfer(false);
                            router.refresh();
                        }}
                    />
                )
            }

            {isThumbnailEditing && (
                <div className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-[2rem] max-w-2xl w-full animate-in zoom-in-95 duration-200 relative shadow-2xl overflow-hidden">
                        <button
                            onClick={() => setIsThumbnailEditing(false)}
                            className="absolute top-5 right-5 p-2 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors z-10"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Preview */}
                            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                                <Image
                                    src={activeImage || item.image || ""}
                                    alt="Thumbnail Preview"
                                    fill
                                    className="object-cover transition-all duration-100 ease-linear pointer-events-none select-none"
                                    style={{
                                        objectPosition: `50% ${thumbnailSettings.y}%`,
                                        transform: `scale(${thumbnailSettings.scale}) translate(${(thumbnailSettings.x - 50) * (thumbnailSettings.scale - 1)}%, 0)`
                                    }}
                                    unoptimized
                                />

                                {/* Reference Grid */}
                                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none border border-black/10 rounded-2xl">
                                    <div className="border-r border-b border-black/10" />
                                    <div className="border-r border-b border-black/10" />
                                    <div className="border-b border-black/10" />
                                    <div className="border-r border-b border-black/10" />
                                    <div className="border-r border-b border-black/10" />
                                    <div className="border-b border-black/10" />
                                    <div className="border-r border-black/10" />
                                    <div className="border-r border-black/10" />
                                    <div></div>
                                </div>
                            </div>

                            {/* Right Column: Controls */}
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="space-y-1 pr-8">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">Миниатюра</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-tight">Настройте расположение миниатюры.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Горизонталь</span>
                                            <span className="bg-slate-100 px-2 py-1 rounded-md text-[9px] text-slate-600">{thumbnailSettings.x}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={thumbnailSettings.x}
                                            onChange={e => setThumbnailSettings(prev => ({ ...prev, x: Number(e.target.value) }))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Вертикаль</span>
                                            <span className="bg-slate-100 px-2 py-1 rounded-md text-[9px] text-slate-600">{thumbnailSettings.y}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={thumbnailSettings.y}
                                            onChange={e => setThumbnailSettings(prev => ({ ...prev, y: Number(e.target.value) }))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Масштаб</span>
                                            <span className="bg-slate-100 px-2 py-1 rounded-md text-[9px] text-slate-600">{thumbnailSettings.scale}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1" max="3" step="0.1"
                                            value={thumbnailSettings.scale}
                                            onChange={e => setThumbnailSettings(prev => ({ ...prev, scale: Number(e.target.value) }))}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 mt-auto">
                                    <Button
                                        onClick={() => {
                                            setEditData(prev => {
                                                const currentAttrs = (prev.attributes && typeof prev.attributes === 'object' && !Array.isArray(prev.attributes))
                                                    ? prev.attributes
                                                    : {};
                                                return {
                                                    ...prev,
                                                    attributes: {
                                                        ...currentAttrs,
                                                        thumbnailSettings: thumbnailSettings
                                                    } as any
                                                };
                                            });
                                            setIsThumbnailEditing(false);
                                            toast("Настройки миниатюры сохранены", "success");
                                        }}
                                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-[0.98] transition-all"
                                    >
                                        Применить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

            {
                fullscreenIndex !== null && allImages[fullscreenIndex] && (
                    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
                        {/* Close Button */}
                        <button
                            onClick={closeFullscreen}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10 active:scale-95"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-black uppercase tracking-widest">
                            {fullscreenIndex + 1} / {allImages.length}
                        </div>

                        {/* Image Label */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-black uppercase tracking-widest">
                            {allImages[fullscreenIndex].label}
                        </div>

                        {/* Previous Button */}
                        {fullscreenIndex > 0 && (
                            <button
                                onClick={() => navigateFullscreen("prev")}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95"
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                        )}

                        {/* Next Button */}
                        {fullscreenIndex < allImages.length - 1 && (
                            <button
                                onClick={() => navigateFullscreen("next")}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-all active:scale-95"
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        )}

                        {/* Main Image */}
                        <div className="relative w-full h-full flex items-center justify-center p-10 md:p-20">
                            <div className="relative w-full h-full">
                                <Image
                                    src={allImages[fullscreenIndex].src}
                                    alt={allImages[fullscreenIndex].label}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
