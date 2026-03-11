"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    getEditorProject,
    createEditorProject,
    updateEditorProject,
    autoSaveProject,
    saveEditorExport,
} from "../actions/project-actions";

interface UseProjectOptions {
    projectId?: string;
    orderId?: string;
    orderItemId?: string;
    autoSaveInterval?: number; // ms, default 30000 (30 sec)
}

interface ProjectState {
    id: string | null;
    name: string;
    width: number;
    height: number;
    canvasData: unknown;
    orderId: string | null;
    orderItemId: string | null;
    designId: string | null;
    isTemplate: boolean;
    isFinalized: boolean;
    isSaving: boolean;
    isLoading: boolean;
    hasUnsavedChanges: boolean;
    lastSaved: Date | null;
}

export function useProject(options: UseProjectOptions = {}) {
    const router = useRouter();
    const { projectId, orderId, orderItemId, autoSaveInterval = 30000 } = options;

    const [state, setState] = useState<ProjectState>({
        id: projectId || null,
        name: "Новый проект",
        width: 800,
        height: 600,
        canvasData: null,
        orderId: orderId || null,
        orderItemId: orderItemId || null,
        designId: null,
        isTemplate: false,
        isFinalized: false,
        isSaving: false,
        isLoading: !!projectId,
        hasUnsavedChanges: false,
        lastSaved: null,
    });

    const canvasDataRef = useRef<unknown>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Загрузка существующего проекта
    useEffect(() => {
        if (projectId) {
            loadProject(projectId);
        }
    }, [projectId]);

    // Автосохранение
    useEffect(() => {
        if (state.id && autoSaveInterval > 0) {
            autoSaveTimerRef.current = setInterval(() => {
                if (state.hasUnsavedChanges && canvasDataRef.current) {
                    performAutoSave();
                }
            }, autoSaveInterval);

            return () => {
                if (autoSaveTimerRef.current) {
                    clearInterval(autoSaveTimerRef.current);
                }
            };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.id, state.hasUnsavedChanges, autoSaveInterval]);

    // Предупреждение при закрытии страницы
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [state.hasUnsavedChanges]);

    const loadProject = async (id: string) => {
        setState((s) => ({ ...s, isLoading: true }));

        const result = await getEditorProject(id);

        if (result.success && result.data) {
            setState((s) => ({
                ...s,
                id: result.data!.id,
                name: result.data!.name,
                width: result.data!.width,
                height: result.data!.height,
                canvasData: result.data!.canvasData,
                orderId: result.data!.orderId,
                orderItemId: result.data!.orderItemId,
                designId: result.data!.designId,
                isTemplate: result.data!.isTemplate || false,
                isFinalized: result.data!.isFinalized || false,
                isLoading: false,
                lastSaved: result.data!.updatedAt,
            }));
            canvasDataRef.current = result.data!.canvasData;
        } else {
            toast.error(result.error || "Не удалось загрузить проект");
            setState((s) => ({ ...s, isLoading: false }));
        }
    };

    const performAutoSave = async () => {
        if (!state.id || !canvasDataRef.current) return;

        const result = await autoSaveProject(state.id, canvasDataRef.current);

        if (result.success) {
            setState((s) => ({
                ...s,
                hasUnsavedChanges: false,
                lastSaved: new Date(),
            }));
        }
    };

    // Обновление данных холста (вызывается из редактора)
    const updateCanvasData = useCallback((data: unknown) => {
        canvasDataRef.current = data;
        setState((s) => ({ ...s, hasUnsavedChanges: true }));
    }, []);

    // Сохранить проект
    const saveProject = useCallback(async (name?: string) => {
        setState((s) => ({ ...s, isSaving: true }));

        try {
            if (state.id) {
                // Обновляем существующий
                const result = await updateEditorProject(state.id, {
                    name: name || state.name,
                    canvasData: canvasDataRef.current,
                });

                if (result.success) {
                    setState((s) => ({
                        ...s,
                        name: name || s.name,
                        hasUnsavedChanges: false,
                        lastSaved: new Date(),
                        isSaving: false,
                    }));
                    toast.success("Проект сохранён");
                    return result.data;
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Создаём новый
                const result = await createEditorProject({
                    name: name || state.name,
                    width: state.width,
                    height: state.height,
                    canvasData: canvasDataRef.current || { objects: [], version: "5.3.0" },
                    orderId: state.orderId,
                    orderItemId: state.orderItemId,
                });

                if (result.success && result.data) {
                    setState((s) => ({
                        ...s,
                        id: result.data!.id,
                        name: name || s.name,
                        hasUnsavedChanges: false,
                        lastSaved: new Date(),
                        isSaving: false,
                    }));
                    toast.success("Проект создан");

                    // Обновляем URL
                    router.replace(`/dashboard/design/editor/${result.data.id}`);

                    return result.data;
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            setState((s) => ({ ...s, isSaving: false }));
            toast.error(error instanceof Error ? error.message : "Ошибка сохранения");
            return null;
        }
    }, [state.id, state.name, state.width, state.height, state.orderId, state.orderItemId, router]);

    // Экспорт изображения
    const exportImage = useCallback(async (
        blob: Blob,
        format: "png" | "jpeg",
        options?: {
            hasWatermark?: boolean;
            quality?: number;
        }
    ) => {
        if (!state.id) {
            // Сначала сохраняем проект
            const saved = await saveProject();
            if (!saved) return null;
        }

        const filename = `${state.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, "_")}_${Date.now()}.${format}`;

        const result = await saveEditorExport({
            projectId: state.id!,
            filename,
            format,
            width: state.width,
            height: state.height,
            blob,
            hasWatermark: options?.hasWatermark,
            quality: options?.quality,
        });

        if (result.success && result.data) {
            toast.success("Экспорт сохранён");
            return result.data;
        } else {
            toast.error(result.error || "Ошибка экспорта");
            return null;
        }
    }, [state.id, state.name, state.width, state.height, saveProject]);

    // Изменить размер холста
    const setCanvasSize = useCallback((width: number, height: number) => {
        setState((s) => ({
            ...s,
            width,
            height,
            hasUnsavedChanges: true,
        }));
    }, []);

    // Пометить как шаблон
    const setAsTemplate = useCallback(async (isTemplate: boolean) => {
        if (!state.id) return;

        const result = await updateEditorProject(state.id, { isTemplate });

        if (result.success) {
            setState((s) => ({ ...s, isTemplate }));
            toast.success(isTemplate ? "Сохранено как шаблон" : "Шаблон отключён");
        }
    }, [state.id]);

    // Финализировать (пометить как готовый)
    const finalize = useCallback(async () => {
        if (!state.id) return;

        // Сначала сохраняем
        await saveProject();

        const result = await updateEditorProject(state.id, { isFinalized: true });

        if (result.success) {
            setState((s) => ({ ...s, isFinalized: true }));
            toast.success("Макет помечен как финальный");
        }
    }, [state.id, saveProject]);

    return {
        // State
        ...state,

        // Actions
        updateCanvasData,
        saveProject,
        exportImage,
        setCanvasSize,
        setAsTemplate,
        finalize,
        loadProject,
    };
}
