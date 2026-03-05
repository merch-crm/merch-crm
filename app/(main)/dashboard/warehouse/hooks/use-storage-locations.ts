"use client";

import { useState, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { deleteStorageLocation, updateStorageLocationsOrder } from "../storage-actions";
import {
    useSensor,
    useSensors,
    PointerSensor,
    KeyboardSensor,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { StorageLocation } from "../storage.types";

export function useStorageLocations(locations: StorageLocation[]) {
    const [uiState, setUiState] = useState({
        editingLocation: null as StorageLocation | null,
        deleteId: null as string | null,
        deleteName: null as string | null,
        deleteIsSystem: false,
        deletePassword: "",
        isDeleting: false,
        activeId: null as string | null,
        dragLayout: { isWide: false, isExtraWide: false }
    });

    const [stableLayouts, setStableLayouts] = useState<Record<string, { isWide: boolean; isExtraWide: boolean }>>({});
    const cardLayoutsRef = useRef<Map<string, { isWide: boolean; isExtraWide: boolean }>>(new Map());

    const [dataState, setDataState] = useState({
        localLocations: locations,
        prevPropsLocations: locations
    });
    const { toast } = useToast();

    if (locations !== dataState.prevPropsLocations) {
        setDataState(prev => ({
            ...prev,
            prevPropsLocations: locations,
            localLocations: locations
        }));

        if (uiState.editingLocation) {
            const updated = locations.find(l => l.id === uiState.editingLocation?.id);
            if (updated && JSON.stringify(updated) !== JSON.stringify(uiState.editingLocation)) {
                setUiState(prev => ({ ...prev, editingLocation: updated }));
            }
        }
    }

    const handleDeleteClick = useCallback((e: React.MouseEvent, id: string, name: string, isSystem: boolean) => {
        e.stopPropagation();
        setUiState(prev => ({
            ...prev,
            deleteId: id,
            deleteName: name,
            deleteIsSystem: isSystem,
            deletePassword: ""
        }));
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!uiState.deleteId) return;
        setUiState(prev => ({ ...prev, isDeleting: true }));
        const res = await deleteStorageLocation(uiState.deleteId, uiState.deletePassword);
        setUiState(prev => ({ ...prev, isDeleting: false }));
        if (res.success) {
            toast("Локация удалена", "success");
        } else {
            toast(res.error || "Ошибка при удалении", "error");
        }
        setUiState(prev => ({
            ...prev,
            deleteId: null,
            deleteName: null,
            deleteIsSystem: false,
            deletePassword: ""
        }));
    }, [uiState.deleteId, uiState.deletePassword, toast]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const id = event.active.id as string;
        const layout = cardLayoutsRef.current.get(id) || { isWide: false, isExtraWide: false };
        setUiState(prev => ({
            ...prev,
            activeId: id,
            dragLayout: layout
        }));
    }, []);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        setUiState(prev => ({ ...prev, activeId: null }));
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = dataState.localLocations.findIndex((l) => l.id === active.id);
            const newIndex = dataState.localLocations.findIndex((l) => l.id === over.id);

            const newOrder = arrayMove(dataState.localLocations, oldIndex, newIndex);
            setDataState(prev => ({ ...prev, localLocations: newOrder }));

            const itemsToUpdate = newOrder.map((loc, index) => ({
                id: loc.id,
                sortOrder: index + 1,
            }));

            const result = await updateStorageLocationsOrder(itemsToUpdate);
            if (!result.success) {
                setDataState(prev => ({ ...prev, localLocations: dataState.localLocations }));
                toast(result.error || "Не удалось обновить порядок", "error");
            }
        }
    }, [dataState.localLocations, toast]);

    const onLayoutChange = useCallback((id: string, wide: boolean, extraWide: boolean) => {
        cardLayoutsRef.current.set(id, { isWide: wide, isExtraWide: extraWide });
        setStableLayouts(prev => {
            if (prev[id]?.isWide === wide && prev[id]?.isExtraWide === extraWide) return prev;
            return { ...prev, [id]: { isWide: wide, isExtraWide: extraWide } };
        });
    }, []);

    return {
        uiState,
        setUiState,
        dataState,
        stableLayouts,
        cardLayoutsRef,
        sensors,
        handleDeleteClick,
        handleConfirmDelete,
        handleDragStart,
        handleDragEnd,
        onLayoutChange
    };
}
