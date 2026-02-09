"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
    Image as ImageIcon,
    MapPin,
    ClipboardList,
    Printer,
    Book,
    X,
    LayoutGrid,
    ShoppingBag,
    ArrowRightLeft,
    Package,
    FileDown,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Archive,
    Banknote,
    Loader2,
    Save,
    RefreshCcw,
    SlidersHorizontal, // Add this back

} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { pluralize } from "@/lib/pluralize";

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

import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { compressImage } from "@/lib/image-processing";
import { Button } from "@/components/ui/button";


import { ItemGeneralInfo } from "./components/ItemGeneralInfo";
import { ItemMediaSection } from "./components/ItemMediaSection";
import { ItemHistorySection } from "./components/ItemHistorySection";
import { ItemHeader } from "./components/ItemHeader";
import { AdjustStockDialog } from "../../adjust-stock-dialog";
import { TransferItemDialog } from "./transfer-item-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArchiveReasonDialog } from "../../components/archive-reason-dialog";
import { ItemActiveOrdersSection } from "./components/ItemActiveOrdersSection";
import { LabelPrinterDialog } from "../../components/LabelPrinterDialog";
import { QRScanner } from "@/components/ui/qr-scanner";
import { ItemFinancialSection } from "./components/ItemFinancialSection";
import { ItemStockAlerts } from "./components/ItemStockAlerts";
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
    // Helper for forcing singular form of common clothing categories
    const forceSingular = (name: string, metadataSingular?: string | null) => {
        if (metadataSingular && metadataSingular.toLowerCase() !== name.toLowerCase()) return metadataSingular;
        if (!name) return "";
        const n = name.toLowerCase();
        if (n.includes("футболк")) return "Футболка";
        if (n.includes("худи")) return "Худи";
        if (n.includes("лонгслив")) return "Лонгслив";
        if (n.includes("свитшот")) return "Свитшот";
        if (n.includes("толстовк")) return "Толстовка";
        if (n.includes("куртк")) return "Куртка";
        if (n.includes("бомбер")) return "Бомбер";
        if (n.includes("шорт")) return "Шорты";
        if (n.includes("штан") || n.includes("брюк")) return "Штаны";
        if (n.includes("кепк")) return "Кепка";
        if (n.includes("шапк")) return "Шапка";
        if (n.includes("поло")) return "Поло";

        // Simple generic rule for -ки endings
        if (n.endsWith("ки")) return name.slice(0, -2) + "ка";

        return name;
    };

    const router = useRouter();
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const tabletGraphRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === tabletGraphRef.current) {
                    // This state variable is no longer used, but keeping the observer logic for tabletGraphRef
                    // in case it's used elsewhere or will be re-introduced.
                    // setTabletGraphWidth(Math.max(100, entry.contentRect.width));
                }
            }
        });

        const tabletEl = tabletGraphRef.current;

        if (tabletEl) observer.observe(tabletEl);

        return () => {
            if (tabletEl) observer.unobserve(tabletEl);
            observer.disconnect();
        };
    }, [mounted]); // Re-run when mounted to catch the refs

    useEffect(() => {
        setMounted(true);
    }, []);
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
        sellingPrice: initialItem.sellingPrice || 0,
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

    // Mobile tab navigation
    // Mobile tab navigation
    type MobileTab = 'main' | 'specs' | 'locations' | 'media' | 'orders' | 'history';
    const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('main');
    const mobileTabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
        { id: 'main', label: 'Главное', icon: <Package className="w-4 h-4" /> },
        { id: 'specs', label: 'Характеристики', icon: <LayoutGrid className="w-4 h-4" /> },
        { id: 'locations', label: 'Склады', icon: <MapPin className="w-4 h-4" /> },
        { id: 'media', label: 'Медиа', icon: <ImageIcon className="w-4 h-4" /> },
        { id: 'orders', label: 'Заказы', icon: <ShoppingBag className="w-4 h-4" /> },
        { id: 'history', label: 'История', icon: <ClipboardList className="w-4 h-4" /> },
    ];


    // Thumbnail settings logic
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const [tabletTab, setTabletTab] = useState("characteristic");

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
        if (!aspectRatio) return;
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
    }, [maxBounds, thumbSettings, updateThumb, aspectRatio]);





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
        const cat = item.category as { name?: string; id?: string; singularName?: string | null; parent?: { id?: string; name?: string; singularName?: string | null } | null } | null;

        if (cat) {
            if (cat.parent) {
                const parentCat = cat.parent;
                trail.push({
                    label: forceSingular(parentCat.name || "", parentCat.singularName),
                    href: `/dashboard/warehouse/${parentCat.id}`
                });
            }

            trail.push({
                label: forceSingular(cat.name || "", cat.singularName),
                href: `/dashboard/warehouse/${cat.id}`
            });
        } else {
            trail.push({
                label: "Без категории",
                href: "/dashboard/warehouse/orphaned"
            });
        }

        trail.push({
            label: (() => {
                const cat = item.category as { name?: string; singularName?: string | null; pluralName?: string | null } | null;
                const singularName = cat?.singularName || (cat?.name ? forceSingular(cat.name) : "");

                if (singularName) {
                    const pluralOptions = [cat?.name, cat?.pluralName].filter(Boolean) as string[];
                    // Try to replace the longest match first to avoid partial matches
                    const sortedPlurals = pluralOptions.sort((a, b) => b.length - a.length);

                    for (const plural of sortedPlurals) {
                        if (item.name.toLowerCase().startsWith(plural.toLowerCase())) {
                            return singularName + item.name.substring(plural.length);
                        }
                    }

                    // Fallback for common plurals if not in metadata
                    const lowerName = item.name.toLowerCase();
                    if (lowerName.startsWith("футболки ")) return "Футболка " + item.name.substring(9);
                    if (lowerName.startsWith("худи ")) return "Худи " + item.name.substring(5);
                }
                return item.name;
            })(),
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

    const handleStartEdit = () => {
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
            costPrice: item.costPrice !== null ? Number(item.costPrice) : 0,
            sellingPrice: Number(item.sellingPrice) || 0,
            isArchived: item.isArchived || false,
            materialComposition: item.materialComposition || {},
        });
        setIsEditing(true);
    };

    const handleAttributeChange = (key: string, value: string) => {
        // Map SKU slugs to their corresponding field names
        const skuFieldMap: Record<string, string> = {
            'quality': 'qualityCode',
            'brand': 'brandCode',
            'material': 'materialCode',
            'size': 'sizeCode',
            'color': 'attributeCode'
        };

        setEditData(prev => {
            // If it's a SKU field, update the corresponding code field AND remove from attributes specific key
            if (skuFieldMap[key]) {
                const newAttributes = { ...prev.attributes };
                delete (newAttributes as Record<string, string>)[key];

                return {
                    ...prev,
                    [skuFieldMap[key]]: value,
                    attributes: newAttributes
                };
            }

            return {
                ...prev,
                attributes: { ...prev.attributes, [key]: value } as Record<string, string>
            };
        });
    };

    const handleRemoveAttribute = (key: string) => {
        // Map SKU slugs to their corresponding field names
        const skuFieldMap: Record<string, string> = {
            'quality': 'qualityCode',
            'brand': 'brandCode',
            'material': 'materialCode',
            'size': 'sizeCode',
            'color': 'attributeCode'
        };

        setEditData(prev => {
            // If it's a SKU field, clear the corresponding code field AND remove from attributes
            if (skuFieldMap[key]) {
                const newAttributes = { ...prev.attributes };
                delete (newAttributes as Record<string, string>)[key];

                return {
                    ...prev,
                    [skuFieldMap[key]]: null,
                    attributes: newAttributes
                };
            }

            // Otherwise, remove from dynamic attributes
            const newAttributes = { ...prev.attributes };
            delete (newAttributes as Record<string, string>)[key];
            return {
                ...prev,
                attributes: newAttributes
            };
        });
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
            playSound("stock_low");
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
            formData.append("sellingPrice", String(editData.sellingPrice || 0));
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
                playSound("item_updated");
                setIsEditing(false);
                localStorage.removeItem(`item_draft_${item.id}`);
                if (navigator.vibrate) navigator.vibrate(50); // Haptic feedback
                await fetchData();
            } else {
                toast("Ошибка при обновлении товара", "error");
                playSound("notification_error");
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
            playSound("notification_error");
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
                playSound("notification_success");
                setShowArchiveReason(false);
                await fetchData();
            } else {
                toast(res.error || "Ошибка при архивации", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка при архивации", "error");
            playSound("notification_error");
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
                playSound("notification_success");
                await fetchData();
            } else {
                toast(res.error || "Ошибка при восстановлении", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка при восстановлении", "error");
            playSound("notification_error");
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
            playSound("scan_success");
            setShowScanner(false);
        } else {
            if (decodedText === item.sku || decodedText === item.id) {
                toast("Товар подтвержден (SKU совпадает)", "success");
                playSound("scan_success");
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setShowScanner(false);
            } else {
                toast(`Поиск SKU: ${decodedText}...`, "info");
                const foundId = await findItemBySKU(decodedText);
                if (foundId) {
                    toast("Товар найден, переходим...", "success");
                    playSound("scan_success");
                    router.push(`/dashboard/warehouse/items/${foundId}`);
                } else {
                    toast(`Товар с SKU ${decodedText} не найден`, "error");
                    playSound("scan_error");
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
        const locationName = item.stocks && item.stocks.length > 0 && item.stocks[0]
            ? storageLocations.find(l => l.id === item.stocks![0].storageLocationId)?.name || ""
            : "";

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

    const handleExportHistory = () => {
        if (!history || history.length === 0) {
            toast("История пуста", "error");
            return;
        }

        const headers = ["ID", "Дата", "Тип", "Изменение", "Локация", "Причина", "Автор", "Роль"];
        const rows = history.map(h => {
            const typeMap = {
                in: "Приход",
                out: "Расход",
                transfer: "Перемещение",
                attribute_change: "Обновление",
                archive: "Архив",
                restore: "Восстановление"
            };

            return [
                h.id,
                (() => {
                    const d = new Date(h.createdAt);
                    return isNaN(d.getTime()) ? "—" : format(d, "dd.MM.yyyy HH:mm");
                })(),
                typeMap[h.type as keyof typeof typeMap] || h.type,
                h.changeAmount,
                h.storageLocation?.name || "—",
                h.reason || "—",
                h.creator?.name || "Система",
                (h.creator as { role?: { name?: string } } | null)?.role?.name || (h.creator ? "Оператор" : "Система")
            ].map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(";");
        });

        const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `history_${item.sku || item.id}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast("История операций загружена", "success");
    };

    return (
        <>
            <div className="flex flex-col font-sans relative">
                {/* Main Content */}
                <div className="flex-1 w-full mx-auto space-y-4">
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
                    {/* MOBILE: Tabs Navigation */}
                    <div className="md:hidden sticky top-[73px] z-40 bg-slate-50/95 backdrop-blur-md pt-2 pb-2 mb-4 -mx-4 px-4 border-b border-slate-200/60 overflow-x-auto no-scrollbar">
                        <div className="inline-flex bg-white rounded-[22px] p-1.5 shadow-sm border border-slate-100 min-w-full">
                            {mobileTabs.map(tab => {
                                const isActive = mobileActiveTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setMobileActiveTab(tab.id)}
                                        className={cn(
                                            "relative flex items-center justify-center gap-2 py-2.5 px-5 rounded-[16px] text-[13px] font-bold transition-all whitespace-nowrap flex-1 outline-none focus:outline-none",
                                            isActive ? "text-white" : "text-slate-500 hover:text-slate-900",
                                            "bg-transparent"
                                        )}
                                        style={{ WebkitTapHighlightColor: "transparent" }}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeMobileTab"
                                                className="absolute inset-0 bg-primary rounded-[16px] shadow-md shadow-primary/20 -z-10"
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                        {tab.icon}
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-2 xl:flex xl:flex-row xl:items-start md:gap-4 xl:gap-4 animate-in fade-in duration-500 delay-100">

                        {/* LEFT: Main Image & Mobile Info/Actions */}
                        <div className={cn(
                            "grid grid-cols-2 gap-3 md:flex md:flex-col md:gap-4 w-full xl:sticky xl:top-[112px] xl:z-[10] xl:w-[320px] xl:shrink-0",
                            item.isArchived && "grayscale opacity-70",
                            mobileActiveTab !== 'main' && "hidden md:flex"
                        )}>
                            <div className="group relative w-full aspect-square glass-panel rounded-3xl overflow-hidden self-start">
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
                                            <p className="text-[10px] font-bold text-slate-300">Нет фото</p>
                                        </div>
                                    )}
                                </div>

                                {/* Removed overlay slider */}
                            </div>

                            {isEditing && (
                                <div className="glass-panel rounded-3xl p-4 animate-in fade-in slide-in-from-top-4 duration-500 col-span-2 md:col-span-1">
                                    <div className="space-y-4">
                                        {/* ZOOM SLIDER */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
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
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
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
                                                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
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

                            {/* Wrapper for Info & Actions in right column on mobile */}
                            <div className="flex flex-col gap-2 justify-between md:contents">
                                <div className="md:hidden xl:flex flex flex-col glass-panel rounded-3xl p-3 sm:p-6 justify-between overflow-hidden">
                                    <div className="mb-1 sm:mb-4 pb-1 sm:pb-4 border-b border-slate-200/60">
                                        <h3 className="text-[8px] sm:text-[11px] font-bold text-slate-400 mb-0.5">Артикул / SKU</h3>
                                        <p className="text-[10px] sm:text-[14px] font-black text-slate-900 leading-tight break-all cursor-text select-all" onDoubleClick={handleStartEdit}>{item.sku || "—"}</p>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 sm:gap-4">
                                        <div className="space-y-1 sm:space-y-3">
                                            <div>
                                                <h2 className="text-[7px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 leading-none">Резерв и остаток</h2>
                                                <div className="flex items-baseline gap-1 sm:gap-1.5">
                                                    <span className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{item.quantity}</span>
                                                    <span className="text-[9px] sm:text-sm font-black text-slate-400">{displayUnit}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                                <div className={cn(
                                                    "inline-flex items-center px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-3xl text-[8px] sm:text-[10px] font-bold border shrink-0",
                                                    item.quantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        (item.quantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                                                )}>
                                                    {item.quantity === 0 ? "Нет" :
                                                        (item.quantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                                                </div>
                                                <div className="px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-3xl text-[8px] sm:text-[10px] font-bold border bg-amber-50/50 text-amber-600 border-amber-100 shrink-0">
                                                    Резерв: {reservedQuantity}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BLOCK: Quick Actions (Adjustment/Transfer) - App Tile Style */}
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                    <button
                                        onClick={() => setAdjustType("set")}
                                        className="group relative flex flex-col justify-between p-2 sm:p-4 aspect-square bg-primary rounded-3xl shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/40 transition-all active:scale-95 text-left overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-6 -mt-6 transition-transform duration-700" />
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl sm:rounded-3xl bg-white/20 flex items-center justify-center text-white relative z-10">
                                            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <span className="text-[10px] sm:text-[13px] font-bold text-white leading-tight relative z-10">
                                            Корректировка<br />остатка
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setShowTransfer(true)}
                                        className="group relative flex flex-col justify-between p-2 sm:p-4 aspect-square bg-[#0F172A] rounded-3xl shadow-sm shadow-slate-900/10 hover:shadow-md hover:shadow-slate-900/20 transition-all active:scale-95 text-left overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-6 -mt-6 transition-transform duration-700" />
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl sm:rounded-3xl bg-white/10 flex items-center justify-center text-white relative z-10">
                                            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>
                                        <span className="text-[10px] sm:text-[13px] font-bold text-white leading-tight relative z-10">
                                            Перемещение<br />товара
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div >

                        {/* RIGHT: Bento Grid */}
                        <div className={
                            cn(
                                "md:contents xl:flex-1 xl:w-full xl:grid xl:grid-cols-12 xl:gap-4",
                                item.isArchived && "grayscale opacity-70"
                            )
                        } >
                            {/* LEFT COLUMN: Specs & Finance */}
                            <div className="md:contents xl:contents" >
                                {/* TABLET/MOBILE: Actions & SKU Group */}
                                <div className="grid grid-cols-1 md:col-start-2 md:flex md:flex-col gap-4 xl:contents" >
                                    {/* Actions Grid (Mobile/Tablet) */}
                                    <div className={
                                        cn(
                                            "grid grid-cols-3 gap-3 xl:hidden",
                                            mobileActiveTab !== 'main' && "hidden md:grid"
                                        )
                                    }>
                                        <button
                                            onClick={() => setShowLabelDialog(true)}
                                            className="group aspect-square flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-violet-500 hover:bg-violet-500 hover:text-white hover:shadow-xl hover:shadow-violet-500/20 transition-all text-slate-400"
                                            title="Печать этикетки"
                                        >
                                            <Printer className="w-8 h-8 transition-transform" />
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="group aspect-square flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-xl hover:shadow-emerald-500/20 transition-all text-slate-400"
                                            title="Экспорт PDF"
                                        >
                                            <FileDown className="w-8 h-8 transition-transform" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (item.quantity > 0) {
                                                    toast("Нельзя архивировать товар с остатком > 0", "error");
                                                    return;
                                                }
                                                setShowArchiveReason(true);
                                            }}
                                            className="group aspect-square flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-xl hover:shadow-orange-500/20 transition-all text-slate-400"
                                            title="В архив"
                                        >
                                            <Archive className="w-8 h-8 transition-transform" />
                                        </button>
                                    </div >

                                    {/* TABLET ONLY SKU + Alerts block */}
                                    <div className="hidden md:flex xl:hidden flex-col gap-4" >
                                        {/* SKU & Stock block */}
                                        <div className="flex flex-col glass-panel rounded-3xl p-6 justify-between overflow-hidden bg-white/50" >
                                            <div className="flex items-start justify-between mb-4 gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Артикул / SKU</h3>
                                                    <p className="text-[14px] font-black text-slate-900 leading-tight break-all cursor-text select-all" onDoubleClick={handleStartEdit}>{item.sku || "—"}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none">Остаток</h2>
                                                    <div className="flex items-baseline gap-1 justify-end">
                                                        <span className="text-3xl font-black text-slate-900 leading-none cursor-pointer" onDoubleClick={handleStartEdit}>{item.quantity}</span>
                                                        <span className="text-[12px] font-black text-slate-400">{displayUnit}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-200/60">
                                                <div className={cn(
                                                    "inline-flex items-center px-3 py-1.5 rounded-2xl text-[10px] font-bold border shrink-0",
                                                    item.quantity === 0 ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                        (item.quantity <= (item.criticalStockThreshold ?? 0) ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")
                                                )}>
                                                    {item.quantity === 0 ? "Нет" :
                                                        (item.quantity <= (item.criticalStockThreshold ?? 0) ? "Критично" : "В наличии")}
                                                </div>
                                                <div className="px-3 py-1.5 rounded-2xl text-[10px] font-bold border border-amber-100 bg-amber-50/50 text-amber-600 shrink-0">
                                                    Резерв: {reservedQuantity} {displayUnit}
                                                </div>
                                            </div>
                                        </div >

                                        {/* Stock Alerts component */}
                                        <ItemStockAlerts
                                            item={item}
                                            isEditing={isEditing}
                                            editData={editData}
                                            setEditData={setEditData}
                                            handleStartEdit={handleStartEdit}
                                            className={
                                                cn(
                                                    "glass-panel rounded-3xl p-6 relative group/alerts overflow-hidden bg-white/50"
                                                )
                                            }
                                        />
                                    </div >
                                </div >

                                {/* TABLET TABS NAVIGATION */}
                                <div className="hidden md:flex xl:hidden col-span-2 bg-white rounded-[22px] p-1.5 shadow-sm border border-slate-100 items-center justify-between gap-2 overflow-x-auto relative z-0" >
                                    {
                                        [
                                            { id: 'characteristic', label: 'Характеристики', icon: LayoutGrid },
                                            { id: 'placement', label: 'Размещение', icon: MapPin },
                                            { id: 'cost', label: 'Стоимость', icon: Banknote },
                                            { id: 'history', label: 'История', icon: ClipboardList }
                                        ].map((tab) => {
                                            const isActive = tabletTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setTabletTab(tab.id)}
                                                    className={cn(
                                                        "relative flex items-center justify-center gap-2 py-3 px-6 rounded-[16px] text-[13px] font-bold transition-all whitespace-nowrap flex-1 hover:scale-[1.02] active:scale-95 outline-none focus:outline-none",
                                                        isActive ? "text-white" : "text-slate-500 hover:text-slate-900",
                                                        "bg-transparent" // Reset bg to handle it with motion.div
                                                    )}
                                                    style={{ WebkitTapHighlightColor: "transparent" }}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTabletTab"
                                                            className="absolute inset-0 bg-primary rounded-[16px] shadow-md shadow-primary/20 -z-10"
                                                            transition={{
                                                                type: "spring",
                                                                bounce: 0,
                                                                duration: 0.4
                                                            }}
                                                        />
                                                    )}
                                                    <tab.icon className={cn(
                                                        "relative z-10 w-4 h-4 transition-transform duration-300",
                                                        isActive ? "text-white scale-110" : "text-slate-400"
                                                    )} />
                                                    <span className="relative z-10">{tab.label}</span>
                                                </button>
                                            );
                                        })
                                    }
                                </div >

                                {/* BLOCK: Specification */}
                                <div className={
                                    cn(
                                        "glass-panel rounded-3xl p-4 sm:p-6 bg-white/50 h-full",
                                        "md:col-span-2 xl:col-span-8 xl:row-span-2",
                                        mobileActiveTab === 'specs' ? "flex flex-col" : "hidden",
                                        tabletTab === 'characteristic' ? "md:flex md:flex-col" : "md:hidden",
                                        "xl:flex xl:flex-col"
                                    )}>
                                    <div className="flex items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white transition-all shadow-sm">
                                                <LayoutGrid className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">Характеристика</h3>
                                        </div>

                                        {isEditing && (
                                            <Link
                                                href="/dashboard/warehouse?tab=characteristic"
                                                target="_blank"
                                                className="flex items-center gap-2 px-4 h-11 rounded-3xl text-[12px] font-bold text-slate-400 hover:text-primary hover:bg-primary/5 transition-all border border-transparent"
                                            >
                                                <Book className="w-4 h-4" />
                                                Перейти в характеристики
                                            </Link>
                                        )}
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
                                        onRemoveAttribute={handleRemoveAttribute}
                                        user={user}
                                        totalStock={stocks.reduce((acc, s) => acc + s.quantity, 0)}
                                        onEdit={handleStartEdit}
                                    />
                                </div >


                            </div >

                            {/* RIGHT: Bento Grid Column */}
                            <div className="md:contents xl:contents" >
                                {/* Actions Grid (Vertical above Alerts - Desktop Only) */}
                                <div className="hidden xl:grid xl:grid-cols-3 xl:gap-3 xl:col-span-4" >
                                    <button
                                        onClick={() => setShowLabelDialog(true)}
                                        className="group aspect-square flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-violet-500 hover:bg-violet-500 hover:text-white hover:shadow-xl hover:shadow-violet-500/20 transition-all text-slate-400"
                                        title="Печать этикетки"
                                    >
                                        <Printer className="w-8 h-8 transition-transform" />
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="group aspect-square flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-xl hover:shadow-emerald-500/20 transition-all text-slate-400"
                                        title="Экспорт PDF"
                                    >
                                        <FileDown className="w-8 h-8 transition-transform" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (item.quantity > 0) {
                                                toast("Нельзя архивировать товар с остатком > 0", "error");
                                                return;
                                            }
                                            setShowArchiveReason(true);
                                        }}
                                        className="group aspect-square flex items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm hover:border-orange-500 hover:bg-orange-500 hover:text-white hover:shadow-xl hover:shadow-orange-500/20 transition-all text-slate-400"
                                        title="В архив"
                                    >
                                        <Archive className="w-8 h-8 transition-transform" />
                                    </button>
                                </div >

                                {/* SUB-BLOCK: Stock Alerts */}
                                <ItemStockAlerts
                                    item={item}
                                    isEditing={isEditing}
                                    editData={editData}
                                    setEditData={setEditData}
                                    handleStartEdit={handleStartEdit}
                                    className={
                                        cn(
                                            "hidden xl:block xl:col-span-4 glass-panel rounded-3xl p-6 relative group/alerts overflow-hidden bg-white/50 h-full"
                                        )
                                    }
                                />

                                {/* BLOCK: Financial & Price Analytics */}
                                <ItemFinancialSection
                                    item={item}
                                    history={history}
                                    isEditing={isEditing}
                                    editData={editData}
                                    setEditData={setEditData}
                                    handleStartEdit={handleStartEdit}
                                    user={user}
                                    className={
                                        cn(
                                            "hidden xl:flex xl:col-span-8 xl:h-full"
                                        )
                                    }
                                />

                                {/* SUB-BLOCK: Warehouses List */}
                                <div className={
                                    cn(
                                        "glass-panel rounded-3xl p-6 flex-col flex-1 h-full",
                                        "md:col-span-2 xl:col-span-4",
                                        mobileActiveTab !== 'locations' && "hidden",
                                        tabletTab === 'placement' ? "md:flex" : "md:hidden",
                                        "xl:flex"
                                    )}>
                                    <div className="flex items-center justify-between mb-8 text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white transition-all shadow-sm">
                                                <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-black text-slate-900">Размещение</h3>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-normal mt-0.5 md:mt-1">
                                                    Всего {storageLocations.length} {pluralize(storageLocations.length, 'локация', 'локации', 'локаций')}
                                                </p>
                                            </div>
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
                                                    <p className="text-[10px] font-bold text-slate-400">Нет данных о размещении</p>
                                                </div>
                                            );

                                            return (
                                                <div className={cn(
                                                    "grid grid-cols-1 md:grid-cols-3 xl:grid-cols-2 gap-3 pr-1 p-1 pb-4",
                                                    sortedStocks.length > 5 && "max-h-[460px] overflow-y-auto custom-scrollbar"
                                                )}>
                                                    {sortedStocks.map((s, idx) => {
                                                        const isMain = idx === 0;
                                                        const isLastSingle = !isMain && idx === sortedStocks.length - 1 && idx % 2 === 1;
                                                        const isFullWidth = isMain || isLastSingle;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={cn(
                                                                    "min-h-[100px] md:min-h-[110px] group p-4 md:p-5 rounded-2xl transition-all flex flex-col justify-between border",
                                                                    isFullWidth && "md:col-span-1 xl:col-span-2",
                                                                    isMain
                                                                        ? "bg-emerald-50/30 border-emerald-200"
                                                                        : "bg-slate-50/50 border-slate-200 hover:shadow-crm-md"
                                                                )}
                                                            >
                                                                <div className="flex flex-col gap-1">
                                                                    <span className={cn(
                                                                        "text-[14px] md:text-[15px] font-bold transition-colors truncate",
                                                                        isMain ? "text-slate-900" : "text-slate-700"
                                                                    )}>
                                                                        {s.storageLocation?.name}
                                                                    </span>
                                                                    <div className="flex items-baseline gap-1 mt-1">
                                                                        <span className="text-xl md:text-2xl font-black text-slate-900 tabular-nums leading-none">
                                                                            {s.quantity}
                                                                        </span>
                                                                        <span className="text-[10px] md:text-[11px] font-bold text-slate-400">
                                                                            шт.
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4 flex items-center gap-2">
                                                                    {isMain && (
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                                    )}
                                                                    <span className="text-[10px] md:text-[11px] font-bold text-slate-400 whitespace-nowrap">
                                                                        {isMain ? "Основной объём" : "Доп. склад"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div >
                            </div >

                            {/* TABLET: Financial & Price Analytics (Full Width) */}
                            <ItemFinancialSection
                                item={item}
                                history={history}
                                isEditing={isEditing}
                                editData={editData}
                                setEditData={setEditData}
                                handleStartEdit={handleStartEdit}
                                user={user}
                                className={
                                    cn(
                                        "hidden md:col-span-2 xl:hidden",
                                        tabletTab === 'cost' ? "md:flex" : "md:hidden"
                                    )}
                            />

                            <div className={
                                cn(
                                    "md:col-span-2 xl:col-span-12 glass-panel rounded-3xl p-4 sm:p-8 flex flex-col",
                                    mobileActiveTab !== 'media' ? "hidden" : "flex",
                                    tabletTab === 'characteristic' ? "md:flex" : "md:hidden",
                                    "xl:flex"
                                )}>
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
                            </div >

                            <div className={cn(
                                "md:col-span-2 xl:col-span-12 glass-panel rounded-3xl p-4 sm:p-8 flex flex-col space-y-4",
                                mobileActiveTab !== 'orders' ? "hidden" : "flex",
                                tabletTab === 'placement' ? "md:flex" : "md:hidden",
                                "xl:flex"
                            )}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white transition-all shadow-sm">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">Зарезервировано в заказах</h3>
                                    </div>
                                    {activeOrders.length > 0 && (
                                        <div className="px-4 py-2 bg-amber-100/50 rounded-3xl border border-amber-200/50 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="text-[10px] font-bold text-amber-700">
                                                Всего в заказах: {reservedQuantity} {displayUnit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <ItemActiveOrdersSection orders={activeOrders} />
                            </div>


                            {/* BLOCK: History */}
                            <div className={cn(
                                "glass-panel rounded-3xl p-4 sm:p-8 space-y-4",
                                "md:col-span-2 xl:col-span-12",
                                mobileActiveTab !== 'history' && "hidden",
                                tabletTab === 'history' ? "md:block" : "md:hidden",
                                "xl:block"
                            )}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white transition-all shadow-sm">
                                            <ClipboardList className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">История операций</h3>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleExportHistory}
                                        className="h-10 px-6 rounded-2xl bg-slate-900 border-none text-white text-[13px] font-black hover:bg-black hover:text-white active:scale-95 shadow-lg shadow-slate-900/20 transition-all"
                                    >
                                        <Printer className="w-4 h-4 mr-2" />
                                        Скачать
                                    </Button>
                                </div>
                                <ItemHistorySection history={history} />
                            </div>
                        </div >
                    </div >
                </div >

                {/* Editing Bar */}
                <AnimatePresence>
                    {
                        isEditing && mounted && createPortal(
                            <>
                                {/* Bottom Progressive Gradient Blur Overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[80]"
                                    style={{
                                        maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                        WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                        background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
                                    }}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                                    exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                                    className="fixed bottom-6 md:bottom-10 left-1/2 z-[110] flex items-center bg-white p-2.5 px-4 md:px-8 gap-4 md:gap-10 rounded-3xl md:rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 w-[calc(100%-2rem)] md:w-auto overflow-hidden"
                                    data-dialog-open="true"
                                >
                                    {/* Left Side: Info */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex items-center gap-4 md:gap-6 flex-1 min-w-0"
                                    >
                                        <div className="flex flex-col relative min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[10px] md:text-xs font-bold text-slate-400 whitespace-nowrap">Режим правки</span>
                                                {JSON.stringify(editData) !== JSON.stringify({
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
                                                }) && (
                                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" title="Есть несохраненные изменения" />
                                                    )}
                                            </div>
                                            <span className="text-[13px] md:text-[15px] font-bold text-slate-900 truncate leading-none">
                                                {editData.name || item.name}
                                            </span>
                                        </div>
                                        <div className="hidden sm:block w-px h-8 bg-slate-100 shrink-0" />
                                    </motion.div>

                                    {/* Right Side: Actions */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center gap-3 md:gap-6 shrink-0"
                                    >
                                        <button
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
                                            className="text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-all hidden sm:block"
                                        >
                                            Отмена
                                        </button>

                                        <div className="flex items-center gap-2 md:gap-3">
                                            <button
                                                onClick={() => handleSave()}
                                                disabled={isSaving}
                                                className="h-10 px-4 md:px-6 btn-dark text-white rounded-3xl flex items-center gap-2 font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-slate-900/10 border-none relative group/save"
                                            >
                                                {isSaving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4" />
                                                )}
                                                <span className="whitespace-nowrap">Сохранить</span>
                                                {/* Shortcut Hint Overlay */}
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-slate-900 rounded-3xl text-[9px] font-bold text-white opacity-0 group-hover/save:opacity-100 transition-all pointer-events-none shadow-xl translate-y-2 group-hover:translate-y-0">
                                                    ⌘ S
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => handleDelete()}
                                                disabled={isSaving || isAnyUploading}
                                                className="w-10 h-10 md:w-11 md:h-11 rounded-3xl md:rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-amber-500 hover:text-white transition-all active:scale-95 border border-slate-200 hover:border-amber-500 group/archive"
                                                title="Архивировать"
                                            >
                                                <Archive className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover/archive:scale-110" />
                                            </button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </>,
                            document.body
                        )
                    }
                </AnimatePresence >

                {/* Dialogs */}
                <AdjustStockDialog
                    item={item}
                    locations={storageLocations}
                    itemStocks={stocks}
                    initialType={adjustType || "in"}
                    user={user}
                    isOpen={!!adjustType}
                    onClose={() => {
                        setAdjustType(null);
                        fetchData();
                        router.refresh();
                    }}
                />

                <TransferItemDialog
                    item={item}
                    locations={storageLocations}
                    itemStocks={stocks}
                    isOpen={showTransfer}
                    onClose={() => {
                        setShowTransfer(false);
                        fetchData();
                        router.refresh();
                    }}
                />

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
                    description={`Найден товар с похожим названием или SKU: «${showDuplicateConfirm.item?.name}». Вы уверены, что хотите создать/обновить этот товар?`}
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
                            handleStartEdit();
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
                            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
                            onClick={() => setIsMainImageZoomed(false)}
                        >
                            {/* Header Info */}
                            <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-10">
                                <div className="flex flex-col">
                                    <h3 className="text-white text-xl font-black">{item.name}</h3>
                                    <p className="text-white/40 text-[10px] font-bold mt-1">
                                        {allGalleryImages[currentGalleryIndex]?.label} — {currentGalleryIndex + 1} / {allGalleryImages.length}
                                    </p>
                                </div>
                                <button
                                    className="w-11 h-11 bg-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 rounded-3xl flex items-center justify-center text-white transition-all border border-white/10 group"
                                    onClick={(e) => { e.stopPropagation(); setIsMainImageZoomed(false); }}
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentGalleryIndex(prev => (prev - 1 + allGalleryImages.length) % allGalleryImages.length);
                                    }}
                                    className="w-14 h-14 rounded-3xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 transition-all flex items-center justify-center pointer-events-auto active:scale-90 backdrop-blur-xl"
                                >
                                    <ChevronLeft className="w-7 h-7" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentGalleryIndex(prev => (prev + 1) % allGalleryImages.length);
                                    }}
                                    className="w-14 h-14 rounded-3xl bg-white/5 hover:bg-white text-white hover:text-slate-900 border border-white/10 transition-all flex items-center justify-center pointer-events-auto active:scale-90 backdrop-blur-xl"
                                >
                                    <ChevronRight className="w-7 h-7" />
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
                                <div className="mt-8 px-6 py-2.5 bg-white/10 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <p className="text-white text-sm font-black">
                                        {allGalleryImages[currentGalleryIndex]?.label}
                                    </p>
                                </div>
                            </div>

                            {/* Thumbnails Strip */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 z-10">
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
                        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500" role="dialog" aria-modal="true" data-dialog-open="true">
                            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-rose-100 max-w-sm text-center space-y-6">
                                <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto animate-pulse">
                                    <RefreshCcw className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-900">Соединение потеряно</h3>
                                    <p className="text-sm font-medium text-slate-400 leading-relaxed">Интерфейс временно заблокирован для безопасности данных. Ждем возврата в сеть...</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div >
        </>
    );
}
