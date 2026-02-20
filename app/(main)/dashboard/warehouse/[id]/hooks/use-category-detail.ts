import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { pluralize } from "@/lib/pluralize";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { deleteInventoryItems, archiveInventoryItems } from "../../bulk-actions";
import { getInventoryCategories, deleteInventoryCategory } from "../../category-actions";
import { getItemStocks } from "../../stock-actions";;
import type { Category, InventoryItem, InventoryFilters, StorageLocation } from "../../types";

export function useCategoryDetail(
    category: Category,
    parentCategory: Category | undefined,
    initialSubCategories: Category[] = [],
    items: InventoryItem[] = []
) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const [subCategories, setSubCategories] = useState<Category[]>(initialSubCategories);
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    const [ui, setUi] = useState({
        activeId: null as string | null,
        selectedIds: [] as string[],
        mounted: false,
        isSearchExpanded: false,
        subCurrentPage: 1,
        isDeleting: false
    });

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        status: (searchParams.get("status") as InventoryFilters["status"]) || "all",
        storage: searchParams.get("storage") || "all"
    });

    const [dialogs, setDialogs] = useState({
        label: { isOpen: false, item: null as InventoryItem | null },
        adjust: { isOpen: false, item: null as InventoryItem | null, stocks: [] as { storageLocationId: string; quantity: number }[] },
        massActions: { isBulkMoveOpen: false, isBulkCategoryOpen: false, showArchiveReason: false },
        delete: { ids: [] as string[], category: null as Category | null },
        edit: { category: null as Category | null }
    });

    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setUi(prev => ({ ...prev, mounted: true }));
        getInventoryCategories().then(res => {
            if ('data' in res && res.data) setAllCategories(res.data as Category[]);
        });
    }, []);

    useEffect(() => {
        setSubCategories(initialSubCategories);
    }, [initialSubCategories]);

    useEffect(() => {
        const trail = [{ label: "Склад", href: "/dashboard/warehouse" }];
        if (parentCategory) {
            trail.push({ label: parentCategory.name, href: `/dashboard/warehouse/${parentCategory.id}` });
        }
        trail.push({ label: category.name, href: `/dashboard/warehouse/${category.id}` });
        setCustomTrail(trail);
        return () => setCustomTrail(null);
    }, [category, parentCategory, setCustomTrail]);

    const updateUrl = useCallback((params: Record<string, string | null>) => {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== "all") url.searchParams.set(key, value);
            else url.searchParams.delete(key);
        });
        if (!params.page && (params.search !== undefined || params.status !== undefined || params.storage !== undefined)) {
            url.searchParams.set("page", "1");
        }
        router.push(url.pathname + url.search, { scroll: false });
    }, [router]);

    useEffect(() => {
        if (filters.search !== (searchParams.get("search") || "")) {
            updateUrl({ search: filters.search });
        }
    }, [filters.search, updateUrl, searchParams]);

    const toggleSelectItem = useCallback((id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setUi(prev => ({
            ...prev,
            selectedIds: prev.selectedIds.includes(id)
                ? prev.selectedIds.filter(i => i !== id)
                : [...prev.selectedIds, id]
        }));
    }, []);

    const toggleSelectAll = useCallback(() => {
        setUi(prev => ({
            ...prev,
            selectedIds: prev.selectedIds.length === (items?.length || 0) && (items?.length || 0) > 0
                ? []
                : (items || []).map(i => i.id)
        }));
    }, [items]);

    const handlePrintLabel = useCallback((item: InventoryItem) => {
        setDialogs(prev => ({ ...prev, label: { isOpen: true, item } }));
    }, []);

    const handleBulkPrint = useCallback(() => {
        if (ui.selectedIds.length === 0) return;
        const selectedItems = (items || []).filter(i => ui.selectedIds.includes(i.id));
        if (selectedItems.length > 0) {
            setDialogs(prev => ({ ...prev, label: { isOpen: true, item: selectedItems[0] } }));
        }
    }, [ui.selectedIds, items]);

    const handleOpenAdjust = useCallback(async (item: InventoryItem) => {
        setDialogs(prev => ({ ...prev, adjust: { ...prev.adjust, isOpen: true, item, stocks: [] } }));
        try {
            const res = await getItemStocks(item.id);
            if (res.success && res.data) {
                setDialogs(prev => ({ ...prev, adjust: { ...prev.adjust, stocks: res.data as { storageLocationId: string; quantity: number }[] } }));
            }
        } catch (err) {
            console.error("Failed to fetch item stocks", err);
        }
    }, []);

    const handleDeleteItems = async (ids: string[]) => {
        setUi(prev => ({ ...prev, isDeleting: true }));
        try {
            const res = await deleteInventoryItems(ids);
            if (res?.success) {
                toast(`Удалено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
                playSound("client_deleted");
                setUi(prev => ({ ...prev, selectedIds: prev.selectedIds.filter(id => !ids.includes(id)) }));
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setUi(prev => ({ ...prev, isDeleting: false }));
            setDialogs(prev => ({ ...prev, delete: { ...prev.delete, ids: [] } }));
        }
    };

    const handleArchiveItems = async (reason: string) => {
        setUi(prev => ({ ...prev, isDeleting: true }));
        try {
            const res = await archiveInventoryItems(ui.selectedIds, reason || "Массовая архивация");
            if (res?.success) {
                toast("Архивировано: " + ui.selectedIds.length + " " + pluralize(ui.selectedIds.length, 'позиция', 'позиции', 'позиций'), "success");
                playSound("notification_success");
                setUi(prev => ({ ...prev, selectedIds: prev.selectedIds.filter(id => !ui.selectedIds.includes(id)) }));
                setDialogs(prev => ({ ...prev, massActions: { ...prev.massActions, showArchiveReason: false } }));
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при архивации", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setUi(prev => ({ ...prev, isDeleting: false }));
        }
    };

    const handleDeleteCategory = async (id: string) => {
        setUi(prev => ({ ...prev, isDeleting: true }));
        try {
            const res = await deleteInventoryCategory(id);
            if (res?.success) {
                toast("Категория удалена", "success");
                playSound("client_deleted");
                router.refresh();
            } else {
                toast(res?.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Произошла ошибка", "error");
        } finally {
            setUi(prev => ({ ...prev, isDeleting: false }));
            setDialogs(prev => ({ ...prev, delete: { ...prev.delete, category: null } }));
        }
    };

    return {
        subCategories, setSubCategories,
        allCategories, setAllCategories,
        ui, setUi,
        filters, setFilters,
        dialogs, setDialogs,
        updateUrl,
        toggleSelectItem,
        toggleSelectAll,
        handlePrintLabel,
        handleBulkPrint,
        handleOpenAdjust,
        handleDeleteItems,
        handleArchiveItems,
        handleDeleteCategory,
        searchParams,
        router,
        toast
    };
}
