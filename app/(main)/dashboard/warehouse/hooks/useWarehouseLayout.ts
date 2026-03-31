import { useState, useCallback, useEffect } from "react";
import { getAllUsers } from "../warehouse-stats-actions";
import { isSuccess } from "@/lib/types";
import { getInventoryItems } from "../item-actions";
import { getStorageLocations } from "../storage-actions";
import { getInventoryHistory } from "../history-actions";
import { getInventoryCategories } from "../category-actions";
import { getInventoryAttributeTypes } from "../attribute-actions";
import { InventoryItem, StorageLocation, Category, AttributeType } from "../types";
import type { Session } from "@/lib/session";

export interface HistoryEntry {
    id: string;
    type: string;
    changeAmount: number;
    createdAt: Date;
}

export function useWarehouseLayout(activeTab: string) {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [locations, setLocations] = useState<StorageLocation[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [attributeTypes, setAttributeTypes] = useState<AttributeType[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
    const [isClearingHistory, setIsClearingHistory] = useState(false);

    const fetchSession = useCallback(async () => {
        if (!session) {
            try {
                const response = await fetch("/api/auth/get-session");
                if (response.ok) {
                    const data = await response.json();
                    setSession(data);
                }
            } catch (error) {
                console.error("[useWarehouseLayout] Failed to fetch session:", error);
            }
        }
    }, [session]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    const loadDialogData = useCallback(async (type: string) => {
        if (type === 'storage' && !locations.length) {
            const [i, l, u] = await Promise.all([getInventoryItems(), getStorageLocations(), getAllUsers()]);
            setItems(isSuccess(i) ? i.data.items : []);
            setLocations(('data' in l && l.data) ? l.data : []);
            setUsers(('data' in u && u.data) ? u.data : []);
        }
        if (type === 'history' && !history.length) {
            const h = await getInventoryHistory();
            setHistory(('data' in h && h.data) ? h.data : []);
        }
        if (type === 'characteristics' && !categories.length) {
            const [c, at] = await Promise.all([getInventoryCategories(), getInventoryAttributeTypes()]);
            setCategories(('data' in c && c.data) ? c.data : []);
            setAttributeTypes(('data' in at && at.data) ? at.data as AttributeType[] : []);
        }
    }, [locations.length, history.length, categories.length]);

    useEffect(() => {
        if (activeTab === 'storage' || activeTab === 'history' || activeTab === 'characteristics') {
            loadDialogData(activeTab);
        }
    }, [activeTab, loadDialogData]);

    return {
        state: {
            items, locations, categories, attributeTypes, users, session, history,
            isScannerOpen, isClearHistoryOpen, isClearingHistory
        },
        actions: {
            setIsScannerOpen,
            setIsClearHistoryOpen,
            setIsClearingHistory,
            loadDialogData
        }
    };
}
