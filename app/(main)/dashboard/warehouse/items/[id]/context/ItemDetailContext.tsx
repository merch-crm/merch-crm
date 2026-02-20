"use client";

import React, { createContext, useContext, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    InventoryItem,
    Category,
    InventoryAttribute,
    AttributeType,
    StorageLocation,
    ItemStock,
    ActiveOrderItem,
    ItemHistoryTransaction,
    DialogState,
    ThumbnailSettings
} from "@/app/(main)/dashboard/warehouse/types";
import { formatUnit } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { useItemDetailData } from "../hooks/useItemDetailData";
import { useItemDialogs } from "../hooks/useItemDialogs";
import { useItemThumbnail } from "../hooks/useItemThumbnail";
import { useItemGallery } from "../hooks/useItemGallery";
import { useItemImages } from "../hooks/useItemImages";
import { useItemDetailController, TabletTab } from "../hooks/useItemDetailController";
import { useItemOperations } from "../hooks/useItemOperations";
import { Session } from "@/lib/auth";
import { type UploadState } from "../components/ItemMediaSection";

interface ItemDetailContextType {
    // Data
    item: InventoryItem;
    setItem: React.Dispatch<React.SetStateAction<InventoryItem>>;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    isSaving: boolean;
    editData: InventoryItem;
    setEditData: React.Dispatch<React.SetStateAction<InventoryItem>>;
    hasChanges: boolean;
    history: ItemHistoryTransaction[];
    stocks: ItemStock[];
    activeOrders: ActiveOrderItem[];
    reservedQuantity: number;
    displayUnit: string;

    // UI State
    dialogs: DialogState;
    setDialogs: React.Dispatch<React.SetStateAction<DialogState>>;
    tabletTab: TabletTab;
    setTabletTab: (tab: TabletTab) => void;
    timeframe: "all" | "month" | "quarter" | "half-year" | "year";
    setTimeframe: (t: "all" | "month" | "quarter" | "half-year" | "year") => void;
    adjustType: "in" | "out" | "set" | null;
    setAdjustType: (type: "in" | "out" | "set" | null) => void;
    isMounted: boolean;
    isOnline: boolean;

    // Thumbnail
    thumbSettings: ThumbnailSettings;
    baseScale: number;
    maxBounds: { x: number; y: number };
    handleMainMouseDown: (e: React.MouseEvent) => void;
    setAspectRatio: (ratio: number) => void;
    updateThumb: (settings: Partial<ThumbnailSettings>) => void;
    resetThumbSettings: () => void;

    // Gallery/Media
    currentGalleryIndex: number;
    setCurrentGalleryIndex: React.Dispatch<React.SetStateAction<number>>;
    isMainImageZoomed: boolean;
    setIsMainImageZoomed: React.Dispatch<React.SetStateAction<boolean>>;
    allGalleryImages: { src: string; label: string }[];
    openGallery: (src: string) => void;
    uploads: { states: Record<string, UploadState> };
    isAnyUploading: boolean;
    handleImageUpdate: (file: File | null, type: "front" | "back" | "side" | "details", index?: number) => void;
    handleImageRemove: (type: "front" | "back" | "side" | "details", index?: number) => void;
    handleSetMain: (type: "front" | "back" | "side" | "details", index?: number) => void;

    // Actions
    fetchData: () => Promise<void>;
    handleSave: (ignoreDuplicates?: boolean) => Promise<void>;
    handleArchive: (reason: string) => Promise<void>;
    handleRestore: () => Promise<void>;
    handleDelete: () => Promise<void>;
    handleDownload: () => void;
    handleExportHistory: () => void;
    handleStartEdit: () => void;
    handleAttributeChange: (key: string, value: string) => void;
    handleRemoveAttribute: (key: string) => void;
    handleScan: (decodedText: string) => Promise<void>;
    handleCancelEdit: () => void;

    // Auth & Refs
    user: Session | null;
    storageLocations: StorageLocation[];
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    pendingDraft: Partial<InventoryItem> | null;
    pendingExitAction: (() => void) | null;
    setPendingExitAction: React.Dispatch<React.SetStateAction<(() => void) | null>>;
}

const ItemDetailContext = createContext<ItemDetailContextType | undefined>(undefined);

export function ItemDetailProvider({
    children,
    initialItem,
    storageLocations,
    categories,
    attributeTypes,
    allAttributes,
    user
}: {
    children: React.ReactNode;
    initialItem: InventoryItem;
    storageLocations: StorageLocation[];
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    user: Session | null;
}) {
    const router = useRouter();
    const { toast } = useToast();

    // Data Hook
    const {
        item, setItem,
        isEditing, setIsEditing,
        isSaving, setIsSaving,
        editData, setEditData,
        hasChanges,
        history, setHistory,
        stocks, setStocks,
        activeOrders, setActiveOrders
    } = useItemDetailData(initialItem);

    // Dialogs Hook
    const { dialogs, setDialogs } = useItemDialogs();

    // Thumb settings logic
    const thumbSettings = useMemo(() =>
        (editData.thumbnailSettings as ThumbnailSettings) || { zoom: 1, x: 0, y: 0 }
        , [editData.thumbnailSettings]);

    const updateThumb = useCallback((settings: Partial<ThumbnailSettings>) => {
        setEditData(prev => {
            const current = (prev.thumbnailSettings as ThumbnailSettings) || { zoom: 1, x: 0, y: 0 };
            return {
                ...prev,
                thumbnailSettings: { ...current, ...settings }
            };
        });
    }, [setEditData]);

    const {
        setAspectRatio,
        baseScale,
        maxBounds,
        handleMainMouseDown,
        resetSettings: resetThumbSettings
    } = useItemThumbnail(thumbSettings, isEditing, updateThumb);

    // Gallery Hook
    const {
        currentGalleryIndex, setCurrentGalleryIndex,
        isMainImageZoomed, setIsMainImageZoomed,
        allGalleryImages,
        openGallery
    } = useItemGallery(item);

    // Images/Uploads Hook
    const {
        uploads,
        isAnyUploading,
        handleImageUpdate,
        handleImageRemove,
        handleSetMain,
        resetUploads
    } = useItemImages(item, setItem);

    const reservedQuantity = useMemo(() => activeOrders.reduce((acc, order) => acc + order.quantity, 0), [activeOrders]);
    const displayUnit = useMemo(() => formatUnit(item.unit), [item.unit]);

    // Controller Hook
    const {
        isMounted,
        tabletTab, setTabletTab,
        timeframe, setTimeframe,
        adjustType, setAdjustType,
        isOnline,
        handleScan,
        handleCancelEdit,
        pendingDraft,
        pendingExitAction, setPendingExitAction
    } = useItemDetailController(
        item,
        isEditing,
        hasChanges,
        editData,
        isMainImageZoomed,
        allGalleryImages.length,
        setCurrentGalleryIndex,
        setIsMainImageZoomed,
        setEditData,
        setDialogs,
        router
    );

    const fetchData = useCallback(async () => {
        const { getItemHistory, getItemActiveOrders } = await import("../../../item-history.actions");
        const { getItemStocks } = await import("../../../stock-actions");
        const [historyRes, stocksRes, ordersRes] = await Promise.all([
            getItemHistory(item.id),
            getItemStocks(item.id),
            getItemActiveOrders(item.id)
        ]);

        if (historyRes.success && historyRes.data) setHistory(historyRes.data);
        if (stocksRes.success && stocksRes.data) setStocks(stocksRes.data);
        if (ordersRes.success && ordersRes.data) setActiveOrders(ordersRes.data);
    }, [item.id, setHistory, setStocks, setActiveOrders]);

    // Operations Hook
    const {
        handleSave,
        handleArchive,
        handleRestore,
        handleDelete,
        handleDownload,
        handleExportHistory,
        handleStartEdit,
        handleAttributeChange,
        handleRemoveAttribute
    } = useItemOperations({
        item,
        editData,
        uploads,
        thumbSettings,
        history,
        categories,
        storageLocations,
        setIsSaving,
        setIsEditing,
        setEditData,
        setDialogs,
        resetUploads,
        fetchData
    });

    const value = useMemo(() => ({
        item, setItem,
        isEditing, setIsEditing,
        isSaving,
        editData, setEditData,
        hasChanges,
        history,
        stocks,
        activeOrders,
        reservedQuantity,
        displayUnit,
        dialogs, setDialogs,
        tabletTab, setTabletTab,
        timeframe, setTimeframe,
        adjustType, setAdjustType,
        isMounted,
        isOnline,
        thumbSettings,
        baseScale,
        maxBounds,
        handleMainMouseDown,
        setAspectRatio,
        updateThumb,
        resetThumbSettings,
        currentGalleryIndex, setCurrentGalleryIndex,
        isMainImageZoomed, setIsMainImageZoomed,
        allGalleryImages,
        openGallery,
        uploads,
        isAnyUploading,
        handleImageUpdate,
        handleImageRemove,
        handleSetMain,
        fetchData,
        handleSave,
        handleArchive,
        handleRestore,
        handleDelete,
        handleDownload,
        handleExportHistory,
        handleStartEdit,
        handleAttributeChange,
        handleRemoveAttribute,
        handleScan,
        handleCancelEdit,
        user,
        storageLocations,
        categories,
        attributeTypes,
        allAttributes,
        pendingDraft,
        pendingExitAction, setPendingExitAction
    }), [
        item, setItem, isEditing, setIsEditing, isSaving, editData, setEditData, hasChanges,
        history, stocks, activeOrders, reservedQuantity, displayUnit, dialogs, setDialogs,
        tabletTab, setTabletTab, timeframe, setTimeframe, adjustType, setAdjustType,
        isMounted, isOnline, thumbSettings, baseScale, maxBounds, handleMainMouseDown,
        setAspectRatio, updateThumb, resetThumbSettings, currentGalleryIndex, setCurrentGalleryIndex,
        isMainImageZoomed, setIsMainImageZoomed, allGalleryImages, openGallery, uploads,
        isAnyUploading, handleImageUpdate, handleImageRemove, handleSetMain, fetchData,
        handleSave, handleArchive, handleRestore, handleDelete, handleDownload,
        handleExportHistory, handleStartEdit, handleAttributeChange, handleRemoveAttribute,
        handleScan, handleCancelEdit, user, storageLocations, categories, attributeTypes,
        allAttributes, pendingDraft, pendingExitAction, setPendingExitAction
    ]);

    return (
        <ItemDetailContext.Provider value={value}>
            {children}
        </ItemDetailContext.Provider>
    );
}

export function useItemDetail() {
    const context = useContext(ItemDetailContext);
    if (!context) throw new Error("useItemDetail must be used within an ItemDetailProvider");
    return context;
}
