import { useState, useEffect, useCallback } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { forceSingular } from "@/app/(main)/dashboard/warehouse/category-utils";
import { findItemBySKU } from "@/app/(main)/dashboard/warehouse/actions";
import type { InventoryItem, Category, DialogState } from "@/app/(main)/dashboard/warehouse/types";

export type TabletTab = 'characteristic' | 'placement' | 'cost' | 'history';

export function useItemDetailController(
    item: InventoryItem,
    isEditing: boolean,
    hasChanges: boolean,
    editData: Partial<InventoryItem>,
    isMainImageZoomed: boolean,
    allGalleryImagesLength: number,
    setCurrentGalleryIndex: React.Dispatch<React.SetStateAction<number>>,
    setIsMainImageZoomed: React.Dispatch<React.SetStateAction<boolean>>,
    setEditData: React.Dispatch<React.SetStateAction<InventoryItem>>,
    setDialogs: React.Dispatch<React.SetStateAction<DialogState>>,
    router: AppRouterInstance
) {
    const { toast } = useToast();
    const { setCustomTrail } = useBreadcrumbs();

    const [isMounted, setIsMounted] = useState(false);
    const [pendingDraft, setPendingDraft] = useState<Partial<InventoryItem> | null>(null);
    const [pendingExitAction, setPendingExitAction] = useState<(() => void) | null>(null);
    const [tabletTab, setTabletTab] = useState<TabletTab>("characteristic");
    const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'half-year' | 'year' | 'all'>('month');
    const [adjustType, setAdjustType] = useState<"in" | "out" | "set" | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        const draft = localStorage.getItem(`item_draft_${item.id}`);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setPendingDraft(parsed);
                setDialogs(prev => ({ ...prev, draftConfirm: true }));
            } catch (e) {
                console.error("Failed to parse draft", e);
            }
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [item.id, setDialogs]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isMainImageZoomed) return;

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                setCurrentGalleryIndex((prev: number) => (prev - 1 + allGalleryImagesLength) % allGalleryImagesLength);
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setCurrentGalleryIndex((prev: number) => (prev + 1) % allGalleryImagesLength);
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
    }, [isMainImageZoomed, allGalleryImagesLength, setCurrentGalleryIndex, setIsMainImageZoomed]);

    useEffect(() => {
        if (isEditing && isMounted && hasChanges) {
            const timer = setTimeout(() => {
                localStorage.setItem(`item_draft_${item.id}`, JSON.stringify(editData));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [editData, isEditing, item.id, isMounted, hasChanges]);

    useEffect(() => {
        if (!item) return;

        const trail = [{ label: "Склад", href: "/dashboard/warehouse" }];
        const cat = item.category as (Category & { parent?: { id: string; name: string; singularName?: string | null } }) | null;

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
            trail.push({ label: "Без категории", href: "/dashboard/warehouse/orphaned" });
        }

        trail.push({
            label: (() => {
                const c = item.category as Extract<InventoryItem['category'], { singularName?: string | null }>;
                const singularName = c?.singularName || (c?.name ? forceSingular(c.name) : "");
                if (singularName) {
                    const pluralOptions = [c?.name, c?.pluralName].filter(Boolean) as string[];
                    const sortedPlurals = pluralOptions.sort((a, b) => b.length - a.length);

                    for (const plural of sortedPlurals) {
                        if (item.name.toLowerCase().startsWith(plural.toLowerCase())) {
                            return singularName + item.name.substring(plural.length);
                        }
                    }

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

    const handleScan = useCallback(async (decodedText: string) => {
        if (isEditing) {
            setEditData(prev => ({ ...prev, sku: decodedText }));
            toast(`SKU обновлен: ${decodedText}`, "success");
            playSound("scan_success");
            setDialogs(prev => ({ ...prev, scanner: false }));
        } else {
            if (decodedText === item.sku || decodedText === item.id) {
                toast("Товар подтвержден (SKU совпадает)", "success");
                playSound("scan_success");
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                setDialogs(prev => ({ ...prev, scanner: false }));
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
                setDialogs(prev => ({ ...prev, scanner: false }));
            }
        }
    }, [isEditing, item.id, item.sku, router, setDialogs, setEditData, toast]);

    const handleCancelEdit = useCallback(() => {
        if (hasChanges) {
            setDialogs(prev => ({ ...prev, unsavedChanges: true }));
            setPendingExitAction(() => () => {
                localStorage.removeItem(`item_draft_${item.id}`);
            });
        } else {
            localStorage.removeItem(`item_draft_${item.id}`);
        }
    }, [hasChanges, item.id, setDialogs]);

    return {
        isMounted,
        pendingDraft, setPendingDraft,
        pendingExitAction, setPendingExitAction,
        tabletTab, setTabletTab,
        timeframe, setTimeframe,
        adjustType, setAdjustType,
        isOnline,
        handleScan,
        handleCancelEdit
    };
}
