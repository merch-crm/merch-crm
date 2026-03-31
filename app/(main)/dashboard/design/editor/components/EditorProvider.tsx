"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    ReactNode,
} from "react";
// fabric импортируется через Editor (lib/editor)
import { Editor, createEditor, EditorConfig, LayerItem, HistoryState, EditorEventMap, IEditor, Image, Textbox } from "@/lib/editor";
import { EditorHotkeys } from "./EditorHotkeys";

// ============ ТИПЫ КОНТЕКСТА ============

interface EditorContextValue {
    // Редактор
    editor: IEditor | null;
    isReady: boolean;

    // Состояние
    layers: LayerItem[];
    selectedObjects: LayerItem[];
    zoom: number;
    historyState: HistoryState;

    // Активная панель
    activePanel: PanelType | null;
    setActivePanel: (panel: PanelType | null) => void;

    // Действия с объектами
    addImage: (url: string) => Promise<LayerItem | null>;
    addText: (text?: string) => LayerItem | null;
    removeSelected: () => void;
    duplicateSelected: () => void;

    // Выделение
    selectLayer: (id: string) => void;
    deselectAll: () => void;

    // Порядок слоёв
    moveLayerUp: (id: string) => void;
    moveLayerDown: (id: string) => void;
    moveLayerToTop: (id: string) => void;
    moveLayerToBottom: (id: string) => void;

    // Видимость и блокировка
    toggleLayerVisibility: (id: string) => void;
    toggleLayerLock: (id: string) => void;

    // История
    undo: () => void;
    redo: () => void;

    // Zoom
    setZoom: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetZoom: () => void;

    // Экспорт
    exportAsImage: (format: "png" | "jpeg", withWatermark?: boolean) => Promise<Blob | null>;

    // Canvas ref
    canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

export type PanelType = "layers" | "properties" | "text" | "filters" | "fonts";

// ============ КОНТЕКСТ ============

const EditorContext = createContext<EditorContextValue | null>(null);

// ============ ПРОВАЙДЕР ============

interface EditorProviderProps {
    children: ReactNode;
    config?: Partial<EditorConfig>;
    backgroundImage?: string;
    onReady?: (editor: IEditor) => void;
    onModified?: () => void;
}

export function EditorProvider({
    children,
    config,
    backgroundImage,
    onReady,
    onModified,
}: EditorProviderProps) {
    const editorRef = useRef<Editor | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

    const [isReady, setIsReady] = useState(false);
    const [layers, setLayers] = useState<LayerItem[]>([]);
    const [selectedObjects, setSelectedObjects] = useState<LayerItem[]>([]);
    const [zoom, setZoomState] = useState(1);
    const [historyState, setHistoryState] = useState<HistoryState>({
        undoStack: [],
        redoStack: [],
        canUndo: false,
        canRedo: false,
    });
    const [activePanel, setActivePanel] = useState<PanelType | null>("layers");

    // Инициализация редактора
    useEffect(() => {
        const containerNode = canvasContainerRef.current;
        if (!containerNode || editorRef.current) return;

        // Создаём canvas элемент
        const canvasEl = document.createElement("canvas");
        canvasEl.id = "merch-editor-canvas";
        containerNode.appendChild(canvasEl);
        canvasElementRef.current = canvasEl;

        // Создаём редактор
        const editor = createEditor(config);
        editorRef.current = editor;

        // Подписываемся на события
        editor.on("ready", ({ editor }: EditorEventMap["ready"]) => {
            setIsReady(true);
            updateLayers();
            onReady?.(editor);
        });

        editor.on("object:added", () => {
            updateLayers();
            onModified?.();
        });

        editor.on("object:removed", () => {
            updateLayers();
            onModified?.();
        });

        editor.on("object:modified", () => {
            updateLayers();
            onModified?.();
        });

        editor.on("object:selected", ({ objects }: EditorEventMap["object:selected"]) => {
            setSelectedObjects(objects);
            // Автоматически открываем панель свойств
            if (objects.length > 0) {
                const firstType = objects[0].type;
                if (firstType === "text") {
                    setActivePanel("text");
                } else if (firstType === "image") {
                    setActivePanel("properties");
                }
            }
        });

        editor.on("selection:cleared", () => {
            setSelectedObjects([]);
        });

        editor.on("history:changed", (state: HistoryState) => {
            setHistoryState(state);
        });

        editor.on("zoom:changed", ({ zoom }: EditorEventMap["zoom:changed"]) => {
            setZoomState(zoom);
        });

        // Инициализируем
        editor.initialize(canvasEl);

        // Загружаем фоновое изображение если есть
        if (backgroundImage) {
            editor.setBackgroundImage(backgroundImage).catch(console.error);
        }

        return () => {
            editor.destroy();
            editorRef.current = null;
            if (canvasElementRef.current && containerNode) {
                containerNode.removeChild(canvasElementRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Загрузка фона при изменении
    useEffect(() => {
        if (editorRef.current && isReady && backgroundImage) {
            editorRef.current.setBackgroundImage(backgroundImage).catch(console.error);
        }
    }, [backgroundImage, isReady]);

    // Обновление списка слоёв
    const updateLayers = useCallback(() => {
        if (editorRef.current) {
            setLayers(editorRef.current.getLayers());
        }
    }, []);

    // ============ ДЕЙСТВИЯ ============

    const addImage = useCallback(async (url: string): Promise<LayerItem | null> => {
        if (!editorRef.current) return null;
        try {
            return await editorRef.current.addImage(url);
        } catch (error) {
            console.error("Failed to add image:", error);
            return null;
        }
    }, []);

    const addText = useCallback((text?: string): LayerItem | null => {
        if (!editorRef.current) return null;
        try {
            return editorRef.current.addText(text);
        } catch (error) {
            console.error("Failed to add text:", error);
            return null;
        }
    }, []);

    const removeSelected = useCallback(() => {
        if (!editorRef.current) return;
        const selected = editorRef.current.getSelectedObjects();
        selected.forEach((obj) => {
            editorRef.current!.removeObject(obj.id);
        });
    }, []);

    const duplicateSelected = useCallback(async () => {
        if (!editorRef.current) return;
        const selected = editorRef.current.getSelectedObjects();

        for (const obj of selected) {
            if (obj.type === "image") {
                const fabricImg = obj.fabricObject as Image;
                const src = fabricImg.getSrc();
                if (src) {
                    await editorRef.current.addImage(src, {
                        left: (obj.fabricObject.left ?? 0) + 20,
                        top: (obj.fabricObject.top ?? 0) + 20,
                    });
                }
            } else if (obj.type === "text") {
                const fabricText = obj.fabricObject as Textbox;
                editorRef.current.addText(fabricText.text || "Текст");
            }
        }
    }, []);

    const selectLayer = useCallback((id: string) => {
        editorRef.current?.selectObject(id);
    }, []);

    const deselectAll = useCallback(() => {
        editorRef.current?.deselectAll();
    }, []);

    // Порядок слоёв
    const moveLayerUp = useCallback((id: string) => {
        editorRef.current?.bringForward(id);
        updateLayers();
    }, [updateLayers]);

    const moveLayerDown = useCallback((id: string) => {
        editorRef.current?.sendBackward(id);
        updateLayers();
    }, [updateLayers]);

    const moveLayerToTop = useCallback((id: string) => {
        editorRef.current?.bringToFront(id);
        updateLayers();
    }, [updateLayers]);

    const moveLayerToBottom = useCallback((id: string) => {
        editorRef.current?.sendToBack(id);
        updateLayers();
    }, [updateLayers]);

    // Видимость и блокировка
    const toggleLayerVisibility = useCallback((id: string) => {
        const layer = editorRef.current?.getObject(id);
        if (!layer) return;

        const isVisible = !layer.visible;
        layer.fabricObject.set("visible", isVisible);
        layer.visible = isVisible;
        editorRef.current?.getCanvas().renderAll();
        updateLayers();
    }, [updateLayers]);

    const toggleLayerLock = useCallback((id: string) => {
        const layer = editorRef.current?.getObject(id);
        if (!layer) return;

        const isLocked = !layer.locked;
        layer.fabricObject.set({
            selectable: !isLocked,
            evented: !isLocked,
        });
        layer.locked = isLocked;
        editorRef.current?.getCanvas().renderAll();
        updateLayers();
    }, [updateLayers]);

    // История
    const undo = useCallback(() => {
        editorRef.current?.undo();
    }, []);

    const redo = useCallback(() => {
        editorRef.current?.redo();
    }, []);

    // Zoom
    const setZoom = useCallback((zoom: number) => {
        editorRef.current?.setZoom(zoom);
    }, []);

    const zoomIn = useCallback(() => {
        editorRef.current?.zoomIn();
    }, []);

    const zoomOut = useCallback(() => {
        editorRef.current?.zoomOut();
    }, []);

    const resetZoom = useCallback(() => {
        editorRef.current?.resetZoom();
    }, []);

    // Экспорт
    const exportAsImage = useCallback(
        async (format: "png" | "jpeg", withWatermark = false): Promise<Blob | null> => {
            if (!editorRef.current) return null;
            try {
                const result = await editorRef.current.exportImage({
                    format,
                    quality: format === "jpeg" ? 0.92 : 1,
                    multiplier: 1,
                    withWatermark,
                });
                return result.blob;
            } catch (error) {
                console.error("Export failed:", error);
                return null;
            }
        },
        []
    );

    // ============ ЗНАЧЕНИЕ КОНТЕКСТА ============

    const value: EditorContextValue = {
        editor: editorRef.current,
        isReady,
        layers,
        selectedObjects,
        zoom,
        historyState,
        activePanel,
        setActivePanel,
        addImage,
        addText,
        removeSelected,
        duplicateSelected,
        selectLayer,
        deselectAll,
        moveLayerUp,
        moveLayerDown,
        moveLayerToTop,
        moveLayerToBottom,
        toggleLayerVisibility,
        toggleLayerLock,
        undo,
        redo,
        setZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        exportAsImage,
        canvasContainerRef,
    };

    return (
        <EditorContext.Provider value={value}>
            <EditorHotkeys />
            {children}
        </EditorContext.Provider>
    );
}

// ============ ХУКИ ============

export function useEditor(): EditorContextValue {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("Editor context was not found. This hook must be used within EditorProvider");
    }
    return context;
}

export function useEditorSelection() {
    const { selectedObjects, selectLayer, deselectAll, removeSelected, duplicateSelected } = useEditor();
    return { selectedObjects, selectLayer, deselectAll, removeSelected, duplicateSelected };
}

export function useEditorLayers() {
    const {
        layers,
        moveLayerUp,
        moveLayerDown,
        moveLayerToTop,
        moveLayerToBottom,
        toggleLayerVisibility,
        toggleLayerLock,
    } = useEditor();
    return {
        layers,
        moveLayerUp,
        moveLayerDown,
        moveLayerToTop,
        moveLayerToBottom,
        toggleLayerVisibility,
        toggleLayerLock,
    };
}

export function useEditorHistory() {
    const { historyState, undo, redo } = useEditor();
    return { ...historyState, undo, redo };
}

export function useEditorZoom() {
    const { zoom, setZoom, zoomIn, zoomOut, resetZoom } = useEditor();
    return { zoom, setZoom, zoomIn, zoomOut, resetZoom };
}
