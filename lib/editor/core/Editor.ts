import type * as fabric from "fabric";
import { loadFabric } from "./FabricLoader";
import type { Canvas } from "../types";
import { EventEmitter } from "./EventEmitter";
import { HistoryManager } from "./History";
import { ObjectManager } from "./managers/ObjectManager";
import { StyleManager } from "./managers/StyleManager";
import { ExportManager } from "./managers/ExportManager";
import {
    DEFAULT_EDITOR_CONFIG,
} from "../constants";
import type {
    IEditor,
    EditorConfig,
    LayerItem,
    TextStyles,
    FilterValue,
    FilterType,
    ExportOptions,
    ExportResult,
    AddImageOptions,
    HistoryState,
    WatermarkConfig,
} from "../types";

export class Editor extends EventEmitter implements IEditor {
    public canvas: Canvas | null = null;
    public _config: EditorConfig;
    public history: HistoryManager;
    public fabric: typeof import("fabric") | null = null;
    public objects: Map<string, LayerItem> = new Map();
    public watermarkObject: fabric.FabricObject | null = null;
    public _zoom: number = 1;
    private _isReady: boolean = false;
    public idCounter: number = 0;

    private objectManager: ObjectManager;
    private styleManager: StyleManager;
    private exportManager: ExportManager;

    constructor(config: Partial<EditorConfig> = {}) {
        super();
        this._config = { ...DEFAULT_EDITOR_CONFIG, ...config };
        this.history = new HistoryManager(this._config.maxHistory);

        this.history.on("history:changed", (state: unknown) => {
            this.emit("history:changed", state as HistoryState);
        });

        this.objectManager = new ObjectManager(this);
        this.styleManager = new StyleManager(this);
        this.exportManager = new ExportManager(this);
    }

    // ============ ИНИЦИАЛИЗАЦИЯ ============
    
    async initialize(canvasElement: HTMLCanvasElement): Promise<void> {
        // Загружаем библиотеку лениво
        const fabricLib = await loadFabric();
        this.fabric = fabricLib;

        this.canvas = new fabricLib.Canvas(canvasElement, {
            width: this._config.width,
            height: this._config.height,
            backgroundColor: this._config.backgroundColor,
            preserveObjectStacking: true,
            selection: true,
            controlsAboveOverlay: true,
        });

        this.applySelectionStyle();
        this.attachCanvasEvents();
        this._isReady = true;
        this.emit("ready", { editor: this });
    }

    private applySelectionStyle(): void {
        const style = this._config.selectionStyle;
        const fabricLib = this.fabric;
        if (!fabricLib) return;

        fabricLib.Object.prototype.set({
            transparentCorners: style.transparentCorners,
            cornerColor: style.cornerColor,
            cornerStrokeColor: style.cornerStrokeColor,
            cornerSize: style.cornerSize,
            cornerStyle: style.cornerStyle,
            borderColor: style.borderColor,
            borderScaleFactor: style.borderScaleFactor,
            padding: style.padding,
        });
    }

    private attachCanvasEvents(): void {
        if (!this.canvas || !this.fabric) return;

        this.canvas.on("selection:created", (e) => {
            this.emit("selection:changed", {
                objects: this.getSelectedObjects(),
                e: e.e as fabric.TPointerEvent,
            });
        });

        this.canvas.on("selection:updated", (e) => {
            this.emit("selection:changed", {
                objects: this.getSelectedObjects(),
                e: e.e as fabric.TPointerEvent,
            });
        });

        this.canvas.on("selection:cleared", (e) => {
            this.emit("selection:changed", { objects: [], e: e.e as fabric.TPointerEvent });
        });

        this.canvas.on("object:modified", (e) => {
            this.objectManager.updateLayerZIndexes();
            this.emit("object:modified", { object: e.target as fabric.FabricObject });
        });

        this.canvas.on("object:moving", (e) => {
            this.emit("object:moving", { object: e.target as fabric.FabricObject });
        });
    }

    // ============ ГЕТТЕРЫ ============

    get isReady(): boolean { return this._isReady; }
    get config(): EditorConfig { return this._config; }
    get zoom(): number { return this._zoom; }
    getCanvas(): Canvas {
        if (!this.canvas) throw new Error("Editor not initialized");
        return this.canvas;
    }

    // ============ ОБЪЕКТЫ (ДЕЛЕГИРОВАНИЕ) ============

    async addImage(url: string, options: Partial<AddImageOptions> = {}): Promise<LayerItem> {
        return this.objectManager.addImage(url, options);
    }

    addText(text: string = "Текст", options: Partial<TextStyles> = {}): LayerItem {
        return this.objectManager.addText(text, options);
    }

    removeObject(id: string): void { this.objectManager.removeObject(id); }
    getObject(id: string): LayerItem | null { return this.objectManager.getObject(id); }
    getLayers(): LayerItem[] { return this.objectManager.getLayers(); }
    getSelectedObjects(): LayerItem[] { return this.objectManager.getSelectedObjects(); }
    selectObject(id: string): void { this.objectManager.selectObject(id); }
    deselectAll(): void { this.objectManager.deselectAll(); }

    bringForward(id: string): void { this.objectManager.bringForward(id); }
    sendBackward(id: string): void { this.objectManager.sendBackward(id); }
    bringToFront(id: string): void { this.objectManager.bringToFront(id); }
    sendToBack(id: string): void { this.objectManager.sendToBack(id); }

    // ============ ФОН ============

    async setBackgroundImage(url: string): Promise<void> {
        if (!this.canvas || !this.fabric) throw new Error("Canvas not initialized");

        const img = await this.fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        const scale = Math.max(
            this._config.width / img.width!,
            this._config.height / img.height!
        );

        img.set({
            scaleX: scale,
            scaleY: scale,
            originX: "left",
            originY: "top",
        });
        this.canvas.backgroundImage = img;
        this.canvas.renderAll();
    }

    setBackgroundColor(color: string): void {
        if (!this.canvas) return;
        this.canvas.backgroundColor = color;
        this.canvas.renderAll();
    }

    resize(width: number, height: number): void {
        this._config.width = width;
        this._config.height = height;
        if (this.canvas) {
            this.canvas.setDimensions({ width, height });
            this.canvas.renderAll();
        }
    }

    // ============ СТИЛИ (ДЕЛЕГИРОВАНИЕ) ============

    setObjectPosition(id: string, x: number, y: number): void { this.styleManager.setObjectPosition(id, x, y); }
    setObjectScale(id: string, scaleX: number, scaleY: number): void { this.styleManager.setObjectScale(id, scaleX, scaleY); }
    setObjectRotation(id: string, angle: number): void { this.styleManager.setObjectRotation(id, angle); }
    setObjectOpacity(id: string, opacity: number): void { this.styleManager.setObjectOpacity(id, opacity); }
    flipObject(id: string, direction: "horizontal" | "vertical"): void { this.styleManager.flipObject(id, direction); }

    setTextStyles(id: string, styles: Partial<TextStyles>): void { this.styleManager.setTextStyles(id, styles); }

    applyFilter(id: string, filter: FilterValue): void { this.styleManager.applyFilter(id, filter); }
    removeFilter(id: string, filterType: FilterType): void { this.styleManager.removeFilter(id, filterType); }
    getFilters(id: string): FilterValue[] { return this.styleManager.getFilters(id); }

    setWatermarkEnabled(enabled: boolean): void { this.styleManager.setWatermarkEnabled(enabled); }
    setWatermarkConfig(config: Partial<WatermarkConfig>): void { this.styleManager.setWatermarkConfig(config); }

    // ============ ИСТОРИЯ ============

    undo(): void { this.history.undo(); }
    redo(): void { this.history.redo(); }
    canUndo(): boolean { return this.history.canUndo(); }
    canRedo(): boolean { return this.history.canRedo(); }
    getHistoryState(): HistoryState { return this.history.getState(); }

    // ============ ZOOM & ЭКСПОРТ (ДЕЛЕГИРОВАНИЕ) ============

    setZoom(zoom: number): void { this.exportManager.setZoom(zoom); }
    zoomIn(): void { this.exportManager.zoomIn(); }
    zoomOut(): void { this.exportManager.zoomOut(); }
    resetZoom(): void { this.exportManager.resetZoom(); }
    fitToScreen(): void { this.exportManager.fitToScreen(); }

    async exportImage(options: ExportOptions): Promise<ExportResult> {
        return this.exportManager.exportImage(options);
    }

    toJSON(): object { return this.exportManager.toJSON(); }
    async loadFromJSON(json: unknown): Promise<void> { return this.exportManager.loadFromJSON(json); }

    // ============ LIFECYCLE ============

    destroy(): void {
        if (this.canvas) {
            this.canvas.dispose();
            this.canvas = null;
        }
        this.objects.clear();
        this.history.clear();
        this.removeAllListeners();
        this._isReady = false;
    }
}

// Экспорт фабричной функции
export function createEditor(config?: Partial<EditorConfig>): Editor {
    return new Editor(config);
}
