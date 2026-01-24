"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Image as ImageIcon,
    MapPin,
    ClipboardList,
    Printer,
    X,
    LayoutGrid,
    TrendingUp,
    ShoppingBag,
    BarChart3,
    RefreshCcw,
    Save,
    SlidersHorizontal,
    ArrowRightLeft,
    Bell,
    CheckCircle2,
    Package,
    Download,
    Trash2,
    Tag,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Archive
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";

import {
    InventoryItem,
    Category,
    InventoryAttribute,
    AttributeType,
    ItemHistoryTransaction,
    StorageLocation,
    ItemStock,
    ActiveOrderItem
} from "../../types";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import {
    getItemHistory,
    updateInventoryItem,
    getItemStocks,
    checkDuplicateItem,
    getItemActiveOrders,
    findItemBySKU,
    archiveInventoryItems,
    restoreInventoryItems
} from "../../actions";

import { useToast } from "../../../../../components/ui/toast";
import { compressImage } from "@/lib/image-processing";
import { Button } from "@/components/ui/button";


import { ItemGeneralInfo } from "./components/ItemGeneralInfo";
import { ItemMediaSection } from "./components/ItemMediaSection";
import { ItemHistorySection } from "./components/ItemHistorySection";
import { ItemAnalyticsSection } from "./components/ItemAnalyticsSection";
import { ItemHeader } from "./components/ItemHeader";
import { AdjustStockDialog } from "../../adjust-stock-dialog";
import { TransferItemDialog } from "./transfer-item-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArchiveReasonDialog } from "../../components/archive-reason-dialog";
import { ItemActiveOrdersSection } from "./components/ItemActiveOrdersSection";
import { LabelPrinterDialog } from "./components/LabelPrinterDialog";
import { QRScanner } from "@/components/ui/qr-scanner";
import { Session } from "@/lib/auth";

interface ItemDetailClientProps {
    item: InventoryItem;
    storageLocations: StorageLocation[];
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    user: Session | null;
}

export function ItemDetailClient({
    item: initialItem,
    storageLocations,
    categories,
    attributeTypes,
    allAttributes,
    user
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
        costPrice: initialItem.costPrice || 0,
        isArchived: initialItem.isArchived || false,
        materialComposition: initialItem.materialComposition || {},
    });

    const [history, setHistory] = useState<ItemHistoryTransaction[]>([]);
    const [stocks, setStocks] = useState<ItemStock[]>([]);
    const [activeOrders, setActiveOrders] = useState<ActiveOrderItem[]>([]);
    const [showArchiveReason, setShowArchiveReason] = useState(false);

    // Confirm Dialog States
    const [showDraftConfirm, setShowDraftConfirm] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<Partial<InventoryItem> | null>(null);
    const [showUnsavedChangesConfirm, setShowUnsavedChangesConfirm] = useState(false);
    const [pendingExitAction, setPendingExitAction] = useState<(() => void) | null>(null);

    // Thumbnail settings logic
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    const thumbSettings = useMemo(() => (editData.thumbnailSettings as { zoom: number; x: number; y: number }) || { zoom: 1, x: 0, y: 0 }, [editData.thumbnailSettings]);

    const updateThumb = useCallback((settings: Partial<{ zoom: number; x: number; y: number }>) => {
        setEditData(prev => {
            const current = (prev.thumbnailSettings as { zoom: number; x: number; y: number }) || { zoom: 1, x: 0, y: 0 };
            return {
                ...prev,
                thumbnailSettings: { ...current, ...settings }
            };
        });
    }, []);

    const resetThumbSettings = () => {
        setEditData(prev => ({ ...prev, thumbnailSettings: { zoom: 1, x: 0, y: 0 } }));
    };

    // Calculate base scale to achieve 'cover' fit
    const baseScale = useMemo(() => {
        if (!aspectRatio) return 1;
        return Math.max(aspectRatio, 1 / aspectRatio);
    }, [aspectRatio]);

    // Calculate dynamic boundaries based on effective scale
    const maxBounds = useMemo(() => {
        if (!aspectRatio) return { x: 0, y: 0 };

        // Effective scale applied to the container
        const s = (thumbSettings.zoom || 1) * baseScale;

        const ar = aspectRatio;
        const normalizedW = ar >= 1 ? 1 : ar;
        const normalizedH = ar <= 1 ? 1 : 1 / ar;

        const limitX = Math.max(0, 50 * (normalizedW - 1 / s));
        const limitY = Math.max(0, 50 * (normalizedH - 1 / s));

        return { x: limitX, y: limitY };
    }, [aspectRatio, thumbSettings.zoom, baseScale]);

    // Auto-clamp X/Y when bounds change
    useEffect(() => {
        const { x, y } = thumbSettings;
        let newX = x;
        let newY = y;

        const limitX = Math.max(0, maxBounds.x);
        const limitY = Math.max(0, maxBounds.y);

        if (newX > limitX) newX = limitX;
        else if (newX < -limitX) newX = -limitX;

        if (newY > limitY) newY = limitY;
        else if (newY < -limitY) newY = -limitY;

        if (newX !== x || newY !== y) {
            updateThumb({
                zoom: thumbSettings.zoom,
                x: newX,
                y: newY
            });
        }
    }, [maxBounds, thumbSettings, updateThumb]);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollWarehouses = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.offsetWidth * 0.8;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Drag-to-scroll logic
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
        scrollLeft.current = scrollContainerRef.current.scrollLeft;
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none';
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.removeProperty('user-select');
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (scrollContainerRef.current) {
            scrollContainerRef.current.style.cursor = 'grab';
            scrollContainerRef.current.style.removeProperty('user-select');
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
    };

    // Main Image Draggable Logic (Zoom/Pan)
    const isMainDragging = useRef(false);
    const mainDragStart = useRef({ x: 0, y: 0 });
    const mainDragInitialRaw = useRef({ x: 0, y: 0 });

    const handleMainMouseDown = (e: React.MouseEvent) => {
        if (!isEditing) return;
        isMainDragging.current = true;
        mainDragStart.current = { x: e.clientX, y: e.clientY };
        mainDragInitialRaw.current = { x: thumbSettings.x, y: thumbSettings.y };
        document.body.style.cursor = 'grabbing';
    };

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isMainDragging.current) {
                isMainDragging.current = false;
                document.body.style.cursor = '';
            }
        };

        const handleMouseMoveGlobal = (e: MouseEvent) => {
            if (isMainDragging.current) {
                const dx = e.clientX - mainDragStart.current.x;
                const dy = e.clientY - mainDragStart.current.y;
                // Container size is 320x320 roughly.
                // dx / 320 * 100 for percentage
                const moveX = (dx / 320) * 100;
                const moveY = (dy / 320) * 100;
                updateThumb({
                    x: mainDragInitialRaw.current.x + moveX,
                    y: mainDragInitialRaw.current.y + moveY
                });
            }
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        window.addEventListener('mousemove', handleMouseMoveGlobal);

        return () => {
            window.removeEventListener('mouseup', handleMouseUpGlobal);
            window.removeEventListener('mousemove', handleMouseMoveGlobal);
        };
    }, [isEditing, updateThumb]);

    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
    const [isMainImageZoomed, setIsMainImageZoomed] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDuplicateConfirm, setShowDuplicateConfirm] = useState<{ open: boolean, item?: { id: string, name: string, sku: string | null } }>({ open: false });
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

    const allGalleryImages = useMemo(() => {
        if (!item) return [];
        const images: { src: string; label: string }[] = [];
        if (item.image) images.push({ src: item.image, label: "Основное фото" });
        if (item.imageBack) images.push({ src: item.imageBack, label: "Вид сзади" });
        if (item.imageSide) images.push({ src: item.imageSide, label: "Вид сбоку" });
        if (item.imageDetails && Array.isArray(item.imageDetails)) {
            item.imageDetails.forEach((img, idx) => {
                if (img) images.push({ src: img, label: `Деталь ${idx + 1}` });
            });
        }
        return images;
    }, [item]);

    const openGallery = (src?: string) => {
        if (!src) {
            setCurrentGalleryIndex(0);
            setIsMainImageZoomed(true);
            return;
        }
        const idx = allGalleryImages.findIndex(img => img.src === src);
        if (idx >= 0) {
            setCurrentGalleryIndex(idx);
            setIsMainImageZoomed(true);
        } else {
            // Fallback to first if not found (shouldn't happen)
            setCurrentGalleryIndex(0);
            setIsMainImageZoomed(true);
        }
    };
    const [showLabelDialog, setShowLabelDialog] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    const reservedQuantity = useMemo(() => {
        return activeOrders.reduce((acc, order) => acc + order.quantity, 0);
    }, [activeOrders]);

    const displayUnit = useMemo(() => {
        return (!item.unit || item.unit.toLowerCase() === 'pcs' || item.unit === 'шт') ? "шт." : item.unit;
    }, [item.unit]);

    const lastInCostPrice = useMemo(() => {
        const lastInTx = history.find(tx => tx.type === 'in' && tx.costPrice);
        if (lastInTx?.costPrice) return Number(lastInTx.costPrice);
        return item.costPrice || 0;
    }, [history, item.costPrice]);



    const costHistoryStats = useMemo(() => {
        const now = new Date();
        const basePrice = item.costPrice || 0;

        // Prepare 12 months of data
        const monthData: { date: Date; key: string; costs: number[]; label: string; avg: number; hasData: boolean; lastDate?: Date }[] = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthData.push({
                date,
                key: `${date.getFullYear()}-${date.getMonth()}`,
                costs: [],
                label: format(date, 'MMM', { locale: ru }),
                avg: 0,
                hasData: false
            });
        }

        // Fill with history
        history.forEach(tx => {
            if (tx.type === 'in' && tx.costPrice) {
                const txDate = new Date(tx.createdAt);
                const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
                const m = monthData.find(md => md.key === key);
                if (m) {
                    m.costs.push(Number(tx.costPrice));
                    m.hasData = true;
                    // Keep the latest date for this month
                    if (!m.lastDate || txDate > m.lastDate) {
                        m.lastDate = txDate;
                    }
                }
            }
        });

        // Calculate averages for those that HAVE data
        monthData.forEach(m => {
            if (m.hasData && m.costs.length > 0) {
                m.avg = m.costs.reduce((a, b) => a + b, 0) / m.costs.length;
            }
        });

        // SPECIAL CASE: The current month always shows a price if we have item.costPrice
        const currentMonthIdx = monthData.length - 1;
        if (!monthData[currentMonthIdx].hasData && basePrice > 0) {
            monthData[currentMonthIdx].avg = basePrice;
            // Note: we don't necessarily set hasData = true here if we want to show it specifically, 
            // but for the "current" bar we usually want a height.
        }

        const dataPoints = monthData.filter(p => p.hasData || p === monthData[currentMonthIdx]);
        const values = dataPoints.map(p => p.avg);
        const maxVal = Math.max(...values, basePrice) || 1;
        const minVal = Math.min(...values.filter(v => v > 0), basePrice) || basePrice;
        const avgVal = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : basePrice;

        return {
            points: monthData,
            max: maxVal,
            min: minVal,
            avg: avgVal
        };
    }, [history, item.costPrice]);

    // Set custom trail for breadcrumbs
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Draft Restore Logic
        const draft = localStorage.getItem(`item_draft_${item.id}`);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setPendingDraft(parsed);
                setShowDraftConfirm(true);
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [item.id]);

    // Gallery Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isMainImageZoomed) return;

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                setCurrentGalleryIndex(prev => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setCurrentGalleryIndex(prev => (prev + 1) % allGalleryImages.length);
            } else if (e.key === "Escape") {
                e.preventDefault();
                setIsMainImageZoomed(false);
            }
        };

        if (isMainImageZoomed) {
            window.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [isMainImageZoomed, allGalleryImages.length]);

    // Autosave Logic
    useEffect(() => {
        if (isEditing) {
            const timer = setTimeout(() => {
                const hasChanges = JSON.stringify({
                    name: editData.name,
                    sku: editData.sku,
                    description: editData.description,
                    unit: editData.unit,
                    lowStockThreshold: editData.lowStockThreshold,
                    criticalStockThreshold: editData.criticalStockThreshold,
                    attributes: editData.attributes,
                    categoryId: editData.categoryId,
                }) !== JSON.stringify({
                    name: item.name,
                    sku: item.sku || "",
                    description: item.description || "",
                    unit: item.unit,
                    lowStockThreshold: item.lowStockThreshold || 10,
                    criticalStockThreshold: item.criticalStockThreshold || 0,
                    attributes: (item.attributes as Record<string, string>) || {},
                    categoryId: item.categoryId || "",
                });

                if (hasChanges) {
                    localStorage.setItem(`item_draft_${item.id}`, JSON.stringify(editData));
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [editData, isEditing, item]);

    useEffect(() => {
        if (!item) return;

        const trail = [
            { label: "Склад", href: "/dashboard/warehouse" }
        ];

        // Add category path if exists
        if (item.category) {
            if (item.category.parent) {
                trail.push({
                    label: item.category.parent.name,
                    href: `/dashboard/warehouse/${item.category.parent.id}`
                });
            }

            trail.push({
                label: item.category.name,
                href: `/dashboard/warehouse/${item.category.id}`
            });
        } else {
            trail.push({
                label: "Без категории",
                href: "/dashboard/warehouse/orphaned"
            });
        }

        trail.push({
            label: item.name,
            href: `/dashboard/warehouse/items/${item.id}`
        });

        setCustomTrail(trail);

        return () => setCustomTrail(null);
    }, [item, setCustomTrail]);

    const handleImageUpdate = async (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => {
        if (!file) return;

        try {
            // Client-side compression
            const { file: compressedFile, preview } = await compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1920,
                maxSizeMB: 0.7
            });

            if (type === "details") {
                const currentCount = (item.imageDetails?.length || 0);

                const isAdding = typeof index !== 'number' || index >= currentCount;

                if (isAdding && currentCount >= 3) {
                    toast("Максимальное количество дополнительных фото — 3", "error");
                    return;
                }

                setNewImageDetailsFiles(prev => [...prev, compressedFile]);

                simulateUpload("details", compressedFile.name, () => {
                    setItem(prev => {
                        const newDetails = [...(prev.imageDetails || [])];
                        if (typeof index === 'number' && index < 3) {
                            // Ensure array fits
                            while (newDetails.length <= index) newDetails.push("");
                            newDetails[index] = preview;
                        } else {
                            newDetails.push(preview);
                        }
                        return { ...prev, imageDetails: newDetails.filter(Boolean) };
                    });
                });
                return;
            }

            if (type === "front") setNewImageFile(compressedFile);
            else if (type === "back") setNewImageBackFile(compressedFile);
            else if (type === "side") setNewImageSideFile(compressedFile);

            simulateUpload(type, compressedFile.name, () => {
                setItem(prev => {
                    if (type === "front") return { ...prev, image: preview };
                    if (type === "back") return { ...prev, imageBack: preview };
                    if (type === "side") return { ...prev, imageSide: preview };
                    return prev;
                });
            });
        } catch (error) {
            console.error("Compression failed:", error);
            toast("Ошибка при обработке изображения", "error");
        }
    };

    const simulateUpload = (type: string, fileName: string, onComplete?: () => void) => {
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
                if (onComplete) onComplete();
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

    const handleSetMain = (type: "front" | "back" | "side" | "details", index?: number) => {
        const currentMain = item.image;
        let newMain: string | null = null;
        const updatedItem = { ...item };

        if (type === "back") {
            newMain = item.imageBack;
            updatedItem.imageBack = currentMain;
        } else if (type === "side") {
            newMain = item.imageSide;
            updatedItem.imageSide = currentMain;
        } else if (type === "details" && typeof index === "number" && item.imageDetails) {
            newMain = item.imageDetails[index];
            const newDetails = [...item.imageDetails];
            newDetails[index] = currentMain || "";
            updatedItem.imageDetails = newDetails;
        }

        if (newMain) {
            updatedItem.image = newMain;
            setItem(updatedItem);
            toast("Фото установлено как основное", "success");
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

    const fetchData = useCallback(async () => {
        const [historyRes, stocksRes, ordersRes] = await Promise.all([
            getItemHistory(item.id),
            getItemStocks(item.id),
            getItemActiveOrders(item.id)
        ]);

        if (historyRes.data) setHistory(historyRes.data as ItemHistoryTransaction[]);
        if (stocksRes.data) setStocks(stocksRes.data as ItemStock[]);
        if (ordersRes.data) setActiveOrders(ordersRes.data as ActiveOrderItem[]);
    }, [item.id]);

    useEffect(() => {
        fetchData();

        // Background polling for "real-time" updates (Stage 6)
        const interval = setInterval(fetchData, 30000);

        // Initial status check for notifications (Stage 7)
        if (item.quantity <= item.criticalStockThreshold && !item.isArchived) {
            toast(`Критический остаток: на складе всего ${item.quantity} ${item.unit}`, "error");
        } else if (item.quantity <= item.lowStockThreshold && !item.isArchived) {
            toast(`Низкий остаток: рекомендуется пополнение`, "info");
        }

        return () => clearInterval(interval);
    }, [fetchData, item.quantity, item.criticalStockThreshold, item.lowStockThreshold, item.isArchived, item.unit, toast]);

    const handleSave = async (forceDuplicate = false) => {
        setIsSaving(true);
        try {
            // Duplicate Detection
            if (!forceDuplicate && (editData.name !== item.name || editData.sku !== item.sku)) {
                const dup = await checkDuplicateItem(editData.name || "", editData.sku || undefined, item.id);
                if (dup.duplicate) {
                    setShowDuplicateConfirm({ open: true, item: dup.duplicate });
                    setIsSaving(false);
                    return;
                }
            }

            const formData = new FormData();
            formData.append("id", item.id);
            formData.append("name", editData.name || "");
            formData.append("sku", editData.sku || "");
            formData.append("description", editData.description || "");
            formData.append("unit", editData.unit || "шт");
            formData.append("categoryId", editData.categoryId || "");
            formData.append("lowStockThreshold", String(editData.lowStockThreshold || 10));
            formData.append("criticalStockThreshold", String(editData.criticalStockThreshold || 0));

            // Critical fix: include quantity and reservedQuantity which are required by the server action
            formData.append("quantity", String(item.quantity || 0));
            formData.append("reservedQuantity", String(item.reservedQuantity || 0));
            formData.append("itemType", item.itemType || "clothing");

            formData.append("qualityCode", editData.qualityCode || "");
            formData.append("materialCode", editData.materialCode || "");
            formData.append("attributeCode", editData.attributeCode || "");
            formData.append("sizeCode", editData.sizeCode || "");
            formData.append("brandCode", editData.brandCode || "");
            formData.append("costPrice", String(editData.costPrice || 0));
            formData.append("materialComposition", JSON.stringify(editData.materialComposition || {}));
            formData.append("isArchived", String(editData.isArchived || false));

            if (newImageFile) formData.append("image", newImageFile);
            if (newImageBackFile) formData.append("imageBack", newImageBackFile);
            if (newImageSideFile) formData.append("imageSide", newImageSideFile);
            newImageDetailsFiles.forEach(file => formData.append("imageDetails", file));

            // Current images (permanent URLs only, filtering out previews)
            const isUrl = (url: unknown) => typeof url === 'string' && (url.startsWith('/') || url.startsWith('http'));

            formData.append("currentImage", isUrl(item.image) ? item.image! : "");
            formData.append("currentImageBack", isUrl(item.imageBack) ? item.imageBack! : "");
            formData.append("currentImageSide", isUrl(item.imageSide) ? item.imageSide! : "");

            const existingDetails = (item.imageDetails || []).filter(isUrl);
            formData.append("currentImageDetails", JSON.stringify(existingDetails));

            formData.append("attributes", JSON.stringify(editData.attributes || {}));
            formData.append("thumbnailSettings", JSON.stringify(thumbSettings));


            const res = await updateInventoryItem(item.id, formData);
            if (res.success) {
                toast("Товар успешно обновлен", "success");
                setIsEditing(false);
                localStorage.removeItem(`item_draft_${item.id}`);
                if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
                await fetchData();
            } else {
                toast("Ошибка при обновлении товара", "error");
            }
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

    const handleArchive = async (reason: string) => {
        setIsSaving(true);
        try {
            const res = await archiveInventoryItems([item.id], reason || "Ручная архивация");
            if (res.success) {
                toast("Товар перемещен в архив", "success");
                setShowArchiveReason(false);
                await fetchData();
            } else {
                toast(res.error || "Ошибка при архивации", "error");
            }
        } catch {
            toast("Ошибка при архивации", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestore = async () => {
        setIsSaving(true);
        try {
            const res = await restoreInventoryItems([item.id], "Восстановление из архива");
            if (res.success) {
                toast("Товар восстановлен из архива", "success");
                await fetchData();
            } else {
                toast(res.error || "Ошибка при восстановлении", "error");
            }
        } catch {
            toast("Ошибка при восстановлении", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        // According to Stage 3, delete is "soft delete" (archiving)
        if (item.quantity > 0) {
            toast("Нельзя архивировать товар с остатком > 0", "error");
            return;
        }
        setShowArchiveReason(true);
    };

    const handleScan = async (decodedText: string) => {
        if (isEditing) {
            setEditData(prev => ({ ...prev, sku: decodedText }));
            toast(`SKU обновлен: ${decodedText}`, "success");
            setShowScanner(false);
        } else {
            if (decodedText === item.sku || decodedText === item.id) {
                toast("Товар подтвержден (SKU совпадает)", "success");
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setShowScanner(false);
            } else {
                toast(`Поиск SKU: ${decodedText}...`, "info");
                const foundId = await findItemBySKU(decodedText);
                if (foundId) {
                    toast("Товар найден, переходим...", "success");
                    router.push(`/dashboard/warehouse/items/${foundId}`);
                } else {
                    toast(`Товар с SKU ${decodedText} не найден`, "error");
                }
                setShowScanner(false);
            }
        }
    };
    const handleDownload = () => {
        toast("Формирование Excel файла...", "info");

        // Prepare CSV content
        const headers = ["ID", "Название", "Артикул (SKU)", "Категория", "Количество", "Ед. изм.", "Себестоимость", "Склад", "Описание"];
        const categoryName = item.category ? item.category.name : (categories.find(c => c.id === item.categoryId)?.name || "");
        const locationName = storageLocations.find(l => l.id === item.storageLocationId)?.name || "";

        const row = [
            item.id,
            `"${item.name.replace(/"/g, '""')}"`, // Escape quotes
            item.sku || "",
            `"${categoryName.replace(/"/g, '""')}"`,
            item.quantity,
            item.unit,
            item.costPrice || 0,
            `"${locationName.replace(/"/g, '""')}"`,
            `"${(item.description || "").replace(/"/g, '""')}"`
        ];

        const csvContent = "\uFEFF" + headers.join(";") + "\n" + row.join(";"); // Add BOM for Excel

        // Create blob and download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `item_${item.sku || item.id}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast("Файл загружен", "success");
    };

    return (
        <>
            <div className="flex flex-col font-sans relative">
                {/* Main Content */}
                <div className="flex-1 w-full mx-auto p-4 md:p-12 space-y-12">
                    <div className="max-w-[1600px] mx-auto w-full pb-20 space-y-4">
                        {/* HEADER REGION */}
                        <ItemHeader
                            item={item}
                            isEditing={isEditing}
                            isSaving={isSaving}
                            isAnyUploading={isAnyUploading}
                            editName={editData.name || ""}
                            onEditNameChange={(name) => setEditData(prev => ({ ...prev, name }))}
                            onCancel={() => {
                                const hasChanges = JSON.stringify({
                                    name: editData.name,
                                    sku: editData.sku,
                                    description: editData.description,
                                    unit: editData.unit,
                                    lowStockThreshold: editData.lowStockThreshold,
                                    criticalStockThreshold: editData.criticalStockThreshold,
                                    attributes: editData.attributes,
                                    categoryId: editData.categoryId,
                                }) !== JSON.stringify({
                                    name: item.name,
                                    sku: item.sku || "",
                                    description: item.description || "",
                                    unit: item.unit,
                                    lowStockThreshold: item.lowStockThreshold || 10,
                                    criticalStockThreshold: item.criticalStockThreshold || 0,
                                    attributes: (item.attributes as Record<string, string>) || {},
                                    categoryId: item.categoryId || "",
                                });

                                if (hasChanges) {
                                    setShowUnsavedChangesConfirm(true);
                                    // Action to perform if user confirms "exit without saving"
                                    setPendingExitAction(() => () => {
                                        setIsEditing(false);
                                        setEditData(prev => ({ ...prev, ...item }));
                                        localStorage.removeItem(`item_draft_${item.id}`);
                                    });
                                } else {
                                    setIsEditing(false);
                                    localStorage.removeItem(`item_draft_${item.id}`);
                                }
                            }}
                            onSave={() => handleSave()}
                            onEdit={() => setIsEditing(true)}
                            onUnarchive={handleRestore}
                        />

                        {/* SPLIT LAYOUT */}
                        <div className="flex flex-col lg:flex-row items-start gap-4 animate-in fade-in duration-500 delay-100">

                            {/* LEFT: Main Image */}
                            <div className={cn(
                                "w-full lg:w-[320px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-[112px] z-[60]",
                                item.isArchived && "grayscale opacity-70"
                            )}>
                                <div className="group relative w-full aspect-square glass-panel rounded-2xl overflow-hidden shadow-crm-lg">
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-slate-50 overflow-hidden",
                                            isEditing ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                                        )}
                                        onMouseDown={handleMainMouseDown}
                                        onClick={() => !isEditing && item.image && openGallery(item.image)}
                                    >
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-contain transition-transform duration-500 ease-out select-none pointer-events-none"
                                                unoptimized
                                                priority
                                                style={{
                                                    transform: `scale(${((isEditing ? thumbSettings?.zoom : item.thumbnailSettings?.zoom) ?? 1) * baseScale}) translate(${(isEditing ? thumbSettings?.x : item.thumbnailSettings?.x) ?? 0}%, ${(isEditing ? thumbSettings?.y : item.thumbnailSettings?.y) ?? 0}%)`,
                                                    transformOrigin: 'center center',
                                                }}
                                                onLoadingComplete={(img) => {
                                                    setAspectRatio(img.naturalWidth / img.naturalHeight);
                                                }}
                                            />
                                        ) : (

                                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 bg-slate-50">
                                                <div className="w-20 h-20 rounded-3xl bg-white shadow-inner flex items-center justify-center mb-4">
                                                    <ImageIcon className="w-10 h-10 opacity-30" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Нет фото</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Removed overlay slider */}
                                </div>

                                {isEditing && (
                                    <div className="glass-panel rounded-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-crm-lg border border-slate-200/50">
                                        <div className="space-y-4">
                                            {/* ZOOM SLIDER */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 space-y-0.5">
                                                    <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                        <span>Масштаб</span>
                                                        <span className="text-primary">{Math.round((thumbSettings.zoom ?? 1) * 100)}%</span>
                                                    </div>
                                                    <div className="relative h-6 flex items-center select-none touch-none">
                                                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                            <div
                                                                className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                                                                style={{
                                                                    left: '0%',
                                                                    width: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                                thumbSettings.zoom !== 1 && "border-primary/20 ring-2 ring-primary/10"
                                                            )}
                                                            style={{
                                                                left: `${(thumbSettings.zoom - 1) / 2 * 100}%`
                                                            }}
                                                        />
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="3"
                                                            step="0.05"
                                                            value={thumbSettings.zoom ?? 1}
                                                            onChange={(e) => updateThumb({ zoom: parseFloat(e.target.value) })}
                                                            onDoubleClick={() => updateThumb({ zoom: 1 })}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0"
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={resetThumbSettings}
                                                    className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                                                    title="Сбросить"
                                                >
                                                    <RotateCcw className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* X/Y Sliders */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex-1 grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                            <span className="whitespace-nowrap">По горизонтали</span>
                                                        </div>
                                                        <div className="relative h-6 flex items-center select-none touch-none">
                                                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                                <div
                                                                    className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                                                                    style={{
                                                                        left: (thumbSettings.x !== undefined && thumbSettings.x < 0 && maxBounds.x > 0)
                                                                            ? `${50 + (Math.max(-1, Math.min(1, thumbSettings.x / maxBounds.x)) * 50)}%`
                                                                            : '50%',
                                                                        width: (thumbSettings.x !== undefined && maxBounds.x > 0)
                                                                            ? `${Math.abs(Math.max(-1, Math.min(1, thumbSettings.x / maxBounds.x))) * 50}%`
                                                                            : '0%'
                                                                    }}
                                                                />
                                                            </div>
                                                            <div
                                                                className={cn(
                                                                    "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                                    maxBounds.x <= 0 && "bg-slate-300",
                                                                    thumbSettings.x !== 0 && "border-primary/20 ring-2 ring-primary/10"
                                                                )}
                                                                style={{
                                                                    left: (maxBounds.x > 0)
                                                                        ? `${50 + (Math.max(-1, Math.min(1, (thumbSettings.x ?? 0) / maxBounds.x)) * 50)}%`
                                                                        : '50%'
                                                                }}
                                                            />
                                                            <input
                                                                type="range"
                                                                min={-Math.max(1, maxBounds.x)}
                                                                max={Math.max(1, maxBounds.x)}
                                                                step="1"
                                                                value={thumbSettings.x ?? 0}
                                                                disabled={maxBounds.x <= 0}
                                                                onChange={(e) => updateThumb({ x: parseInt(e.target.value) })}
                                                                onDoubleClick={() => updateThumb({ x: 0 })}
                                                                className={cn(
                                                                    "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0",
                                                                    maxBounds.x <= 0 && "cursor-not-allowed"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate-400">
                                                            <span className="whitespace-nowrap">По вертикали</span>
                                                        </div>
                                                        <div className="relative h-6 flex items-center select-none touch-none">
                                                            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full overflow-hidden">
                                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-300 rounded-full z-0" />
                                                                <div
                                                                    className="absolute top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                                                                    style={{
                                                                        left: (thumbSettings.y !== undefined && thumbSettings.y < 0 && maxBounds.y > 0)
                                                                            ? `${50 + (Math.max(-1, Math.min(1, thumbSettings.y / maxBounds.y)) * 50)}%`
                                                                            : '50%',
                                                                        width: (thumbSettings.y !== undefined && maxBounds.y > 0)
                                                                            ? `${Math.abs(Math.max(-1, Math.min(1, thumbSettings.y / maxBounds.y))) * 50}%`
                                                                            : '0%'
                                                                    }}
                                                                />
                                                            </div>
                                                            <div
                                                                className={cn(
                                                                    "absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 rounded-full shadow-sm border border-slate-200 bg-white transition-all duration-75 pointer-events-none z-20",
                                                                    maxBounds.y <= 0 && "bg-slate-300",
                                                                    thumbSettings.y !== 0 && "border-primary/20 ring-2 ring-primary/10"
                                                                )}
                                                                style={{
                                                                    left: (maxBounds.y > 0)
                                                                        ? `${50 + (Math.max(-1, Math.min(1, (thumbSettings.y ?? 0) / maxBounds.y)) * 50)}%`
                                                                        : '50%'
                                                                }}
                                                            />
                                                            <input
                                                                type="range"
                                                                min={-Math.max(1, maxBounds.y)}
                                                                max={Math.max(1, maxBounds.y)}
                                                                step="1"
                                                                value={thumbSettings.y ?? 0}
                                                                disabled={maxBounds.y <= 0}
                                                                onChange={(e) => updateThumb({ y: parseInt(e.target.value) })}
                                                                onDoubleClick={() => updateThumb({ y: 0 })}
                                                                className={cn(
                                                                    "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30 p-0 m-0",
                                                                    maxBounds.y <= 0 && "cursor-not-allowed"
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-6 shrink-0" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* BLOCK: Stats (Moved specifically under photo) */}
                                <div className="glass-panel rounded-2xl p-8 flex flex-col justify-between overflow-hidden shadow-crm-lg">
                                    <div className="mb-4 pb-4 border-b border-slate-100/60">
                                        <h3 className="text-[10px] font-black text-slate-400 tracking-widest mb-1 uppercase">Артикул / SKU</h3>
                                        <p className="text-[13px] font-black text-slate-900 tracking-tight leading-tight break-all cursor-text select-all" onDoubleClick={() => setIsEditing(true)}>{item.sku || "—"}</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h2 className="text-[10px] font-black text-slate-400 tracking-widest mb-1 uppercase">Резерв и остаток</h2>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none cursor-pointer" onDoubleClick={() => setIsEditing(true)}>{item.quantity}</span>
                                                    <span className="text-base font-black text-slate-400 tracking-widest uppercase">{displayUnit}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <div className={cn(
                                                    "inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase border",
                                                    item.quantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        (item.quantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                                                )}>
                                                    {item.quantity === 0 ? "Нет на складе" :
                                                        (item.quantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                                                </div>
                                                <div className="px-4 py-2 rounded-xl text-[9px] font-black tracking-widest uppercase border bg-amber-100/50 text-amber-600 border-amber-200/50">
                                                    Резерв: {reservedQuantity} {displayUnit}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BLOCK: Quick Actions (Adjustment/Transfer) - App Tile Style */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setAdjustType("set")}
                                        className="group relative flex flex-col justify-between p-4 aspect-square bg-primary rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 text-left overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150 duration-700" />
                                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white relative z-10">
                                            <SlidersHorizontal className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-wider leading-tight relative z-10">
                                            Корректировка<br />остатка
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setShowTransfer(true)}
                                        className="group relative flex flex-col justify-between p-4 aspect-square bg-[#0F172A] rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:scale-95 text-left overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-6 -mt-6 transition-transform group-hover:scale-150 duration-700" />
                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white relative z-10">
                                            <ArrowRightLeft className="w-5 h-5" />
                                        </div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-wider leading-tight relative z-10">
                                            Перемещение<br />товара
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT: Bento Grid */}
                            <div className={cn(
                                "flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4",
                                item.isArchived && "grayscale opacity-70"
                            )}>
                                {/* LEFT COLUMN: Specs & Finance */}
                                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
                                    {/* BLOCK: Specification */}
                                    <div className="glass-panel rounded-2xl p-8 flex flex-col shadow-crm-lg">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <LayoutGrid className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">Характеристика</h3>
                                        </div>
                                        <ItemGeneralInfo
                                            item={item}
                                            isEditing={isEditing}
                                            allAttributes={allAttributes}
                                            attributeTypes={attributeTypes}
                                            editData={editData as unknown as InventoryItem}
                                            onUpdateField={(field, value) => {
                                                setEditData(prev => ({ ...prev, [field]: value }))
                                            }}
                                            onUpdateAttribute={handleAttributeChange}
                                            user={user}
                                            totalStock={stocks.reduce((acc, s) => acc + s.quantity, 0)}
                                            onEdit={() => setIsEditing(true)}
                                        />
                                    </div>

                                    {/* BLOCK: Financial Metrics */}
                                    {(user?.roleName === 'Администратор' || user?.roleName === 'Руководство') && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="group relative overflow-hidden bg-white p-6 rounded-[24px] shadow-crm-lg border border-slate-100 transition-all hover:-translate-y-1 flex items-center gap-5">
                                                <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white relative shadow-lg shadow-purple-500/20 transition-transform duration-500 group-hover:scale-110">
                                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-full blend-overlay" />
                                                    <Tag className="w-6 h-6 relative z-10" />
                                                </div>


                                                <div className="space-y-1">
                                                    <span className="block text-xs font-bold text-slate-400 transition-colors">
                                                        Себестоимость изделия
                                                    </span>
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            inputMode="numeric"
                                                            value={editData.costPrice || ""}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                setEditData(prev => ({ ...prev, costPrice: val }));
                                                            }}
                                                            className="text-2xl font-black text-slate-900 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 focus:bg-white focus:border-primary outline-none w-32 transition-all placeholder:text-slate-300"
                                                            placeholder="0"
                                                        />
                                                    ) : (
                                                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none transition-colors cursor-pointer" onDoubleClick={() => setIsEditing(true)}>
                                                            {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(lastInCostPrice)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="group relative overflow-hidden bg-white p-6 rounded-[24px] shadow-crm-lg border border-slate-100 transition-all hover:-translate-y-1 flex items-center gap-5">
                                                <div className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white relative shadow-lg shadow-blue-500/20 transition-transform duration-500 group-hover:scale-110">
                                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-full blend-overlay" />
                                                    <CheckCircle2 className="w-6 h-6 relative z-10" />
                                                </div>


                                                <div className="space-y-1">
                                                    <span className="block text-xs font-bold text-slate-400 transition-colors">
                                                        Общая стоимость всех<br />изделий на складе
                                                    </span>
                                                    <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none transition-colors cursor-pointer" onDoubleClick={() => setIsEditing(true)}>
                                                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(stocks.reduce((acc, s) => acc + s.quantity, 0) * (item.costPrice || 0))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* BLOCK: Cost History Graph */}
                                    {(user?.roleName === 'Администратор' || user?.roleName === 'Руководство') && (
                                        <div className="glass-panel rounded-2xl p-8 flex flex-col shadow-crm-lg group flex-1">
                                            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 mb-10">
                                                <div className="flex-1 min-w-[200px] space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 transition-transform group-hover:scale-110">
                                                            <TrendingUp className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate">История себестоимости</h3>
                                                    </div>
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100/50">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                                        -2.4% (ГОД)
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 sm:gap-6 py-2 px-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all duration-300 group-hover:bg-white group-hover:border-violet-100 group-hover:shadow-md">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Макс.</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-base font-black text-slate-900 tabular-nums break-keep">
                                                                {Number(Math.round(costHistoryStats.max)).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">₽</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-200/60 group-hover:bg-violet-100" />
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Сред.</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-base font-black text-slate-900 tabular-nums">
                                                                {Number(Math.round(costHistoryStats.avg)).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">₽</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-px h-6 bg-slate-200/60 group-hover:bg-violet-100" />
                                                    <div className="flex flex-col gap-1 items-end">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Мин.</span>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-base font-black text-slate-900 tabular-nums break-keep">
                                                                {Number(Math.round(costHistoryStats.min)).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400">₽</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stylized Bar Chart */}
                                            <div className="flex items-end justify-between h-20 gap-1.5 px-1 relative">
                                                {costHistoryStats.points.map((p, i) => {
                                                    const isCurrent = i === 11;
                                                    const hasActualData = p.hasData;
                                                    const height = costHistoryStats.max > 0 ? (p.avg / costHistoryStats.max) * 100 : 0;

                                                    // If no data and not current month, height should be 0
                                                    const displayHeight = (hasActualData || isCurrent) ? Math.max(10, height) : 0;

                                                    return (
                                                        <div key={i} className="flex-1 group/bar relative h-full flex items-end">
                                                            <div
                                                                className={cn(
                                                                    "w-full rounded-t-sm transition-all duration-700 ease-out group-hover/bar:brightness-110",
                                                                    isCurrent ? "bg-[#5d00ff] shadow-[0_0_15px_rgba(93,0,255,0.3)]" : (hasActualData ? "bg-slate-100 group-hover/bar:bg-slate-200" : "bg-transparent")
                                                                )}
                                                                style={{ height: `${displayHeight}%` }}
                                                            />
                                                            {/* Tooltip */}
                                                            <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 pointer-events-none z-30 shadow-2xl border border-white/10 scale-90 group-hover/bar:scale-100 min-w-max text-center">
                                                                {(hasActualData || isCurrent) ? (
                                                                    <>
                                                                        {p.lastDate && (
                                                                            <span className="block text-[8px] text-white/50 uppercase tracking-widest mb-0.5">
                                                                                {format(p.lastDate, 'd MMM yyyy', { locale: ru })}
                                                                            </span>
                                                                        )}
                                                                        <span className="block text-xs font-black">
                                                                            {Math.round(p.avg).toLocaleString()} ₽
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    "Нет поставок"
                                                                )}
                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="flex justify-between mt-4 px-1 border-t border-slate-50 pt-3">
                                                {costHistoryStats.points.map((p, idx) => {
                                                    // Only show labels for specific indices: 0, 3, 6, 9, 11
                                                    if (![0, 3, 6, 9, 11].includes(idx)) return null;
                                                    let label = p.label;
                                                    if (idx === 11) label = "Тек.";

                                                    return (
                                                        <span key={idx} className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest transition-colors",
                                                            idx === 11 ? "text-[#5d00ff]" : "text-slate-300"
                                                        )}>
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT: Bento Grid Column */}
                                <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
                                    {/* Actions Grid (Vertical above Alerts) */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setShowLabelDialog(true)}
                                            className="group aspect-square flex items-center justify-center bg-white rounded-[20px] border border-slate-100 shadow-crm-lg hover:border-primary/20 hover:text-primary hover:-translate-y-0.5 transition-all text-slate-400"
                                            title="Печать этикетки"
                                        >
                                            <Printer className="w-8 h-8" />
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="group aspect-square flex items-center justify-center bg-white rounded-[20px] border border-slate-100 shadow-crm-lg hover:border-emerald-500/20 hover:text-emerald-500 hover:-translate-y-0.5 transition-all text-slate-400"
                                            title="Скачать Excel"
                                        >
                                            <Download className="w-8 h-8" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (item.quantity > 0) {
                                                    toast("Нельзя архивировать товар с остатком > 0", "error");
                                                    return;
                                                }
                                                setShowArchiveReason(true);
                                            }}
                                            className="group aspect-square flex items-center justify-center bg-white rounded-[20px] border border-slate-100 shadow-crm-lg hover:border-orange-500/20 hover:text-orange-500 hover:-translate-y-0.5 transition-all text-slate-400"
                                            title="В архив"
                                        >
                                            <Archive className="w-8 h-8" />
                                        </button>
                                    </div>

                                    {/* SUB-BLOCK: Stock Alerts */}
                                    <div className="glass-panel rounded-2xl p-8 shadow-crm-lg relative group/alerts overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl transition-opacity group/alerts:opacity-100 opacity-50" />

                                        <div className="flex items-center gap-4 mb-8 relative z-10">
                                            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600">
                                                <Bell className="w-5 h-5 animate-pulse" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">Оповещения</h3>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            {/* Min Stock Widget */}
                                            <div className="relative p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-primary/60 hover:ring-1 hover:ring-primary/10 group/card">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover/card:text-amber-600">Минимальный остаток</span>
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    value={editData.lowStockThreshold || 0}
                                                                    onChange={(e) => setEditData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                                                                    className="text-3xl font-black text-slate-900 tracking-tighter leading-none bg-transparent border-none p-0 w-20 outline-none focus:ring-0"
                                                                />
                                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">шт.</span>
                                                            </div>
                                                            <div className="px-3 py-1 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center">
                                                                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">ЗАКАНЧИВАЕТСЯ</span>
                                                            </div>
                                                        </div>
                                                        <div className="relative h-2.5 bg-slate-100 rounded-full group/slider">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="30"
                                                                value={Math.min(30, editData.lowStockThreshold || 0)}
                                                                onChange={(e) => setEditData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) }))}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                                            />
                                                            <div
                                                                className="absolute top-0 left-0 h-full bg-amber-500 rounded-full transition-all duration-300 z-10"
                                                                style={{ width: `${(Math.min(30, editData.lowStockThreshold || 0) / 30) * 100}%` }}
                                                            />
                                                            <div
                                                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-amber-500 rounded-full shadow-xl transition-all duration-300 z-20 pointer-events-none"
                                                                style={{ left: `calc(${(Math.min(30, editData.lowStockThreshold || 0) / 30) * 100}% - 6px)` }}
                                                            />

                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-end justify-between">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none cursor-pointer" onDoubleClick={() => setIsEditing(true)}>{item.lowStockThreshold}</span>
                                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">шт.</span>
                                                        </div>
                                                        <div className="px-3 py-1 bg-amber-50 rounded-full border border-amber-100 flex items-center justify-center">
                                                            <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none">ЗАКАНЧИВАЕТСЯ</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Critical Stock Widget */}
                                            <div className="relative p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:border-primary/60 hover:ring-1 hover:ring-primary/10 group/card">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover/card:text-rose-600">Критический остаток</span>
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    </div>
                                                </div>

                                                {isEditing ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    value={editData.criticalStockThreshold || 0}
                                                                    onChange={(e) => setEditData(prev => ({ ...prev, criticalStockThreshold: parseInt(e.target.value) || 0 }))}
                                                                    className="text-3xl font-black text-slate-900 tracking-tighter leading-none bg-transparent border-none p-0 w-20 outline-none focus:ring-0"
                                                                />
                                                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">шт.</span>
                                                            </div>
                                                            <div className="px-3 py-1 bg-rose-50 rounded-full border border-rose-100 flex items-center justify-center">
                                                                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">КРИТИЧЕСКИЙ</span>
                                                            </div>
                                                        </div>
                                                        <div className="relative h-2.5 bg-slate-100 rounded-full group/slider">
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="30"
                                                                value={Math.min(30, editData.criticalStockThreshold || 0)}
                                                                onChange={(e) => setEditData(prev => ({ ...prev, criticalStockThreshold: parseInt(e.target.value) }))}
                                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                                                            />
                                                            <div
                                                                className="absolute top-0 left-0 h-full bg-rose-500 rounded-full transition-all duration-300 z-10"
                                                                style={{ width: `${(Math.min(30, editData.criticalStockThreshold || 0) / 30) * 100}%` }}
                                                            />
                                                            <div
                                                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-rose-500 rounded-full shadow-xl transition-all duration-300 z-20 pointer-events-none"
                                                                style={{ left: `calc(${(Math.min(30, editData.criticalStockThreshold || 0) / 30) * 100}% - 6px)` }}
                                                            />

                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-end justify-between">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none cursor-pointer" onDoubleClick={() => setIsEditing(true)}>{item.criticalStockThreshold}</span>
                                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">шт.</span>
                                                        </div>
                                                        <div className="px-3 py-1 bg-rose-50 rounded-full border border-rose-100 flex items-center justify-center">
                                                            <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest leading-none">КРИТИЧЕСКИЙ</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SUB-BLOCK: Warehouses List */}
                                    <div className="glass-panel rounded-2xl p-8 shadow-crm-lg flex flex-col flex-1">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                                                    <MapPin className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 tracking-tighter">Размещение</h3>
                                            </div>
                                            <div className="w-10 h-10 bg-slate-50 rounded-full border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                                                <span className="text-[12px] font-black text-slate-900 leading-none">
                                                    {storageLocations.length}
                                                </span>
                                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">
                                                    лок.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {(() => {
                                                const sortedStocks = storageLocations
                                                    .map(loc => {
                                                        const stockEntry = stocks.find(s => s.storageLocationId === loc.id);
                                                        return {
                                                            storageLocation: loc,
                                                            quantity: stockEntry?.quantity || 0,
                                                            storageLocationId: loc.id
                                                        };
                                                    })
                                                    .sort((a, b) => b.quantity - a.quantity);

                                                if (sortedStocks.length === 0) return (
                                                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                        <Package className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Нет данных о размещении</p>
                                                    </div>
                                                );

                                                const mainStock = sortedStocks[0];
                                                const otherStocks = sortedStocks.slice(1);

                                                return (
                                                    <>
                                                        {/* Main Stock Card (Full Width) */}
                                                        <div className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/60 hover:ring-1 hover:ring-primary/10 transition-all flex flex-col justify-between min-h-[110px]">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <span className="text-[16px] font-bold text-slate-900 tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                                                    {mainStock.storageLocation?.name}
                                                                </span>
                                                                <div className="flex items-baseline gap-1 shrink-0">
                                                                    <span className="text-2xl font-black text-slate-900 tabular-nums leading-none">
                                                                        {mainStock.quantity}
                                                                    </span>
                                                                    <span className="text-[11px] font-bold text-slate-400 uppercase">
                                                                        шт.
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-6">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                                                    ОСНОВНОЙ ОБЪЕМ
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Other Stocks in a row with navigation */}
                                                        {otherStocks.length > 0 && (
                                                            <div className="relative group/warehouses mt-2">
                                                                {/* Side Navigation Arrows - Moved further out */}
                                                                <button
                                                                    onClick={() => scrollWarehouses('left')}
                                                                    className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-crm-md flex items-center justify-center text-slate-400 opacity-0 group-hover/warehouses:opacity-100 transition-all z-20 hover:text-primary active:scale-95"
                                                                >
                                                                    <ChevronLeft className="w-4 h-4" />
                                                                </button>

                                                                <button
                                                                    onClick={() => scrollWarehouses('right')}
                                                                    className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-crm-md flex items-center justify-center text-slate-400 opacity-0 group-hover/warehouses:opacity-100 transition-all z-20 hover:text-primary active:scale-95"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>

                                                                <div
                                                                    ref={scrollContainerRef}
                                                                    onMouseDown={handleMouseDown}
                                                                    onMouseLeave={handleMouseLeave}
                                                                    onMouseUp={handleMouseUp}
                                                                    onMouseMove={handleMouseMove}
                                                                    className="flex gap-2 overflow-x-auto no-scrollbar pb-1 cursor-grab select-none active:cursor-grabbing touch-pan-x scroll-smooth snap-x snap-proximity"
                                                                >
                                                                    {otherStocks.map((s, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="aspect-square w-[calc(50%-4px)] flex-shrink-0 group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/60 hover:ring-1 hover:ring-primary/10 transition-all flex flex-col justify-between snap-start"
                                                                        >
                                                                            <div className="flex flex-col gap-1">
                                                                                <span className="text-[14px] font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                                                                                    {s.storageLocation?.name}
                                                                                </span>
                                                                                <div className="flex items-baseline gap-0.5 mt-1">
                                                                                    <span className="text-xl font-black text-slate-900 tabular-nums leading-none">
                                                                                        {s.quantity}
                                                                                    </span>
                                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase ml-0.5">
                                                                                        шт.
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="mt-auto">
                                                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">
                                                                                    ДОП. СКЛАД
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* BLOCK: Gallery */}
                                <div className="col-span-12 glass-panel rounded-2xl p-8 flex flex-col shadow-crm-lg">
                                    <ItemMediaSection
                                        item={item}
                                        isEditing={isEditing}
                                        onImageChange={handleImageUpdate}
                                        onImageRemove={handleImageRemove}
                                        onSetMain={handleSetMain}
                                        onImageClick={(idx) => {
                                            const getMediaImages = (it: InventoryItem) => [
                                                { src: it.image || null },
                                                { src: it.imageBack || null },
                                                { src: it.imageSide || null },
                                                { src: (it.imageDetails && it.imageDetails[0]) || null },
                                                { src: (it.imageDetails && it.imageDetails[1]) || null },
                                                { src: (it.imageDetails && it.imageDetails[2]) || null },
                                            ];
                                            const src = getMediaImages(item)[idx]?.src;
                                            if (src) openGallery(src);
                                        }}
                                        uploadStates={uploadStates}
                                    />
                                </div>

                                {/* BLOCK: Orders (Moved below Specification) */}
                                <div className="col-span-12 glass-panel rounded-2xl p-8 flex flex-col shadow-crm-lg">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">Зарезервировано в заказах</h3>
                                        </div>
                                        {activeOrders.length > 0 && (
                                            <div className="px-4 py-2 bg-amber-100/50 rounded-xl border border-amber-200/50 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                                                    Всего в заказах: {reservedQuantity} {displayUnit}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <ItemActiveOrdersSection orders={activeOrders} />
                                </div>

                                {/* BLOCK: Analytics */}
                                <div className="col-span-12 glass-panel rounded-2xl p-8 flex flex-col shadow-crm-lg">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <BarChart3 className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">Аналитика</h3>
                                    </div>
                                    <ItemAnalyticsSection
                                        history={history}
                                        currentQuantity={item.quantity}
                                        unit={displayUnit}
                                        lowStockThreshold={item.lowStockThreshold}
                                        criticalStockThreshold={item.criticalStockThreshold}
                                    />
                                </div>

                                {/* BLOCK: History */}
                                <div className="col-span-12 glass-panel rounded-2xl p-8 shadow-crm-lg">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
                                                <ClipboardList className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">История операций</h3>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-lg text-[10px] font-black tracking-widest border-slate-200 hover:bg-slate-50 transition-all uppercase">
                                            <Printer className="w-3.5 h-3.5 mr-2" />
                                            Экспорт PDF
                                        </Button>
                                    </div>
                                    <ItemHistorySection history={history} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editing Bar */}
                {
                    isEditing && (
                        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500">
                            <div className="bg-slate-900/90 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-6">
                                <div className="flex flex-col pr-6 border-r border-white/10">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Режим Правки</span>
                                    <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{editData.name || item.name}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            const hasChanges = JSON.stringify(editData) !== JSON.stringify({
                                                name: item.name,
                                                sku: item.sku || "",
                                                description: item.description || "",
                                                unit: item.unit,
                                                lowStockThreshold: item.lowStockThreshold || 10,
                                                criticalStockThreshold: item.criticalStockThreshold || 0,
                                                attributes: (item.attributes as Record<string, string>) || {},
                                                categoryId: item.categoryId || "",
                                                qualityCode: item.qualityCode || "",
                                                attributeCode: item.attributeCode || "",
                                                sizeCode: item.sizeCode || "",
                                                materialCode: item.materialCode || "",
                                                brandCode: item.brandCode || "",
                                                thumbnailSettings: item.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
                                                costPrice: item.costPrice || 0,
                                                isArchived: item.isArchived || false,
                                                materialComposition: item.materialComposition || {},
                                            });

                                            if (hasChanges) {
                                                setShowUnsavedChangesConfirm(true);
                                                setPendingExitAction(() => () => {
                                                    setIsEditing(false);
                                                    setEditData({
                                                        name: item.name,
                                                        sku: item.sku || "",
                                                        description: item.description || "",
                                                        unit: item.unit,
                                                        lowStockThreshold: item.lowStockThreshold || 10,
                                                        criticalStockThreshold: item.criticalStockThreshold || 0,
                                                        attributes: (item.attributes as Record<string, string>) || {},
                                                        categoryId: item.categoryId || "",
                                                        qualityCode: item.qualityCode || "",
                                                        attributeCode: item.attributeCode || "",
                                                        sizeCode: item.sizeCode || "",
                                                        materialCode: item.materialCode || "",
                                                        brandCode: item.brandCode || "",
                                                        thumbnailSettings: item.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
                                                        costPrice: item.costPrice || 0,
                                                        isArchived: item.isArchived || false,
                                                        materialComposition: item.materialComposition || {},
                                                    });
                                                });
                                            } else {
                                                setIsEditing(false);
                                            }
                                        }}
                                        className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        Отмена
                                    </Button>

                                    <Button
                                        onClick={() => handleSave()}
                                        disabled={isSaving || isAnyUploading}
                                        className="h-12 px-10 rounded-2xl btn-primary text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 border-none"
                                    >
                                        {isSaving ? (
                                            <RefreshCcw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                СОХРАНИТЬ
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        disabled={isSaving || isAnyUploading}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 border-none shadow-sm ml-2 group"
                                        title="Удалить позицию"
                                    >
                                        <Trash2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    </Button>
                                </div>
                            </div>
                        </div>
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
                            user={user}
                            onClose={() => {
                                setAdjustType(null);
                                setSelectedLocationForAdjust(null);
                                fetchData();
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
                            itemStocks={stocks}
                            onClose={() => {
                                setShowTransfer(false);
                                fetchData();
                                router.refresh();
                            }}
                        />
                    )
                }

                <ArchiveReasonDialog
                    isOpen={showArchiveReason}
                    onClose={() => setShowArchiveReason(false)}
                    onConfirm={handleArchive}
                    isLoading={isSaving}
                />

                <ConfirmDialog
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDelete}
                    isLoading={isSaving}
                    title="АРХИВИРОВАТЬ ТОВАР?"
                    description="Товар будет перемещен в архив. Вы сможете восстановить его позже."
                />

                <ConfirmDialog
                    isOpen={showDuplicateConfirm.open}
                    onClose={() => setShowDuplicateConfirm({ open: false })}
                    onConfirm={() => {
                        setShowDuplicateConfirm({ open: false });
                        handleSave(true);
                    }}
                    isLoading={isSaving}
                    title="ПОХОЖИЙ ТОВАР УЖЕ ЕСТЬ"
                    confirmText="Всё равно сохранить"
                    cancelText="Отмена"
                    description={`Найден товар с похожим названием или SKU: "${showDuplicateConfirm.item?.name}". Вы уверены, что хотите создать/обновить этот товар?`}
                />

                <ConfirmDialog
                    isOpen={showDraftConfirm}
                    onClose={() => {
                        setShowDraftConfirm(false);
                        localStorage.removeItem(`item_draft_${item.id}`); // Clear draft on cancel? Or keep it? Usually better to keep if accidental close, but for simplicity let's stick to old behavior or just close.
                        // If we want to strictly mimic "No" in confirm, we typically ignore. 
                        // But here let's validly offer restore. If closed, we do nothing.
                    }}
                    onConfirm={() => {
                        if (pendingDraft) {
                            setEditData(prev => ({ ...prev, ...pendingDraft }));
                            setIsEditing(true);
                            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
                        }
                        setShowDraftConfirm(false);
                        localStorage.removeItem(`item_draft_${item.id}`);
                    }}
                    title="Восстановление черновика"
                    description="Найден черновик с несохраненными изменениями. Восстановить его?"
                    confirmText="Восстановить"
                />

                <ConfirmDialog
                    isOpen={showUnsavedChangesConfirm}
                    onClose={() => setShowUnsavedChangesConfirm(false)}
                    onConfirm={() => {
                        pendingExitAction?.();
                        setShowUnsavedChangesConfirm(false);
                    }}
                    title="Несохраненные изменения"
                    description="У вас есть несохраненные изменения. Выйти без сохранения?"
                    confirmText="Выйти без сохранения"
                    variant="destructive"
                />

                {
                    isMainImageZoomed && allGalleryImages.length > 0 && (
                        <div
                            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300"
                            onClick={() => setIsMainImageZoomed(false)}
                        >
                            {/* Header Info */}
                            <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
                                <div className="flex flex-col">
                                    <h3 className="text-white text-xl font-black uppercase tracking-wider">{item.name}</h3>
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">
                                        {allGalleryImages[currentGalleryIndex]?.label} — {currentGalleryIndex + 1} / {allGalleryImages.length}
                                    </p>
                                </div>
                                <button
                                    className="w-14 h-14 bg-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 rounded-2xl flex items-center justify-center text-white transition-all border border-white/10 group"
                                    onClick={(e) => { e.stopPropagation(); setIsMainImageZoomed(false); }}
                                >
                                    <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentGalleryIndex(prev => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
                                    }}
                                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 transition-all flex items-center justify-center pointer-events-auto active:scale-90 backdrop-blur-xl"
                                >
                                    <ChevronLeft className="w-10 h-10" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentGalleryIndex(prev => (prev + 1) % allGalleryImages.length);
                                    }}
                                    className="w-16 h-16 rounded-2xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 transition-all flex items-center justify-center pointer-events-auto active:scale-90 backdrop-blur-xl"
                                >
                                    <ChevronRight className="w-10 h-10" />
                                </button>
                            </div>

                            {/* Main Image View */}
                            <div className="relative w-full max-w-[85vw] h-[75vh] flex flex-col items-center justify-center z-0 px-4">
                                <div className="relative w-full h-[65vh] flex items-center justify-center transition-all duration-500 animate-in zoom-in-95">
                                    <Image
                                        src={allGalleryImages[currentGalleryIndex].src}
                                        alt={item.name}
                                        fill
                                        className="object-contain drop-shadow-2xl"
                                        unoptimized
                                        priority
                                    />
                                </div>

                                {/* Centered Caption */}
                                <div className="mt-8 px-6 py-2.5 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <p className="text-white text-sm font-black uppercase tracking-[0.4em]">
                                        {allGalleryImages[currentGalleryIndex]?.label}
                                    </p>
                                </div>
                            </div>

                            {/* Thumbnails Strip */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 z-10">
                                {allGalleryImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentGalleryIndex(i);
                                        }}
                                        className={cn(
                                            "relative w-16 h-16 rounded-3xl overflow-hidden border-2 transition-all duration-300",
                                            i === currentGalleryIndex
                                                ? "border-primary scale-110 shadow-lg shadow-primary/20"
                                                : "border-transparent opacity-40 hover:opacity-100 hover:scale-105"
                                        )}
                                    >
                                        <Image src={img.src} alt="thumb" fill className="object-cover" unoptimized />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                }

                <QRScanner
                    isOpen={showScanner}
                    onClose={() => setShowScanner(false)}
                    onResult={handleScan}
                />

                <LabelPrinterDialog
                    item={item}
                    isOpen={showLabelDialog}
                    onClose={() => setShowLabelDialog(false)}
                    attributeTypes={attributeTypes}
                    allAttributes={allAttributes}
                />

                {/* Offline Overlay */}
                {
                    !isOnline && (
                        <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
                            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-rose-100 max-w-sm text-center space-y-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-rose-50 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
                                    <RefreshCcw className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Соединение потеряно</h3>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed">Интерфейс временно заблокирован для безопасности данных. Ждем возврата в сеть...</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
}
