import type * as fabric from "fabric";

export type Canvas = fabric.Canvas;
export type FabricObject = fabric.Object;
export type Image = fabric.FabricImage;
export type IText = fabric.IText;
export type Textbox = fabric.Textbox;
export type FabricObjectProps = fabric.TFabricObjectProps;

export interface FabricObjectWithData extends fabric.Object {
    data?: EditorObjectData;
}

// ============ КОНФИГУРАЦИЯ ============

export interface EditorConfig {
    /** Максимальное количество слоёв */
    maxLayers: number;
    /** Максимальное количество шагов истории */
    maxHistory: number;
    /** Ширина canvas по умолчанию */
    width: number;
    /** Высота canvas по умолчанию */
    height: number;
    /** Цвет фона */
    backgroundColor: string;
    /** Настройки водяного знака */
    watermark: WatermarkConfig;
    /** Настройки контролов выделения */
    selectionStyle: SelectionStyle;
}

export interface WatermarkConfig {
    enabled: boolean;
    type: "text" | "image" | "both";
    text?: string;
    imagePath?: string;
    position: WatermarkPosition;
    opacity: number;
    scale: number;
    rotation: number;
    color: string;
    fontSize: number;
}

export type WatermarkPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center"
    | "tile";

export interface SelectionStyle {
    cornerColor: string;
    cornerStrokeColor: string;
    cornerSize: number;
    cornerStyle: "circle" | "rect";
    transparentCorners: boolean;
    borderColor: string;
    borderScaleFactor: number;
    padding: number;
}

// ============ ОБЪЕКТЫ (СЛОИ) ============

export type EditorObjectType = "image" | "text" | "shape" | "watermark";

export interface EditorObjectData {
    id: string;
    name: string;
    type: EditorObjectType;
    visible: boolean;
    locked: boolean;
    opacity: number;
    zIndex: number;
}

export interface LayerItem extends EditorObjectData {
    thumbnail?: string;
    fabricObject: FabricObject;
}

// ============ ИСТОРИЯ (UNDO/REDO) ============

export interface Command {
    execute(): void;
    undo(): void;
    redo?: () => void;
}

export interface HistoryState {
    undoStack: Command[];
    redoStack: Command[];
    canUndo: boolean;
    canRedo: boolean;
}

// ============ ТЕКСТ ============

export interface TextStyles {
    fontFamily: string;
    fontSize: number;
    fontWeight: "normal" | "bold";
    fontStyle: "normal" | "italic";
    fill: string;
    textAlign: "left" | "center" | "right";
    underline: boolean;
    linethrough: boolean;
    charSpacing: number;
    lineHeight: number;
}

export interface SystemFont {
    id: string;
    name: string;
    family: string;
    fileName: string;
    filePath: string;
}

// ============ ФИЛЬТРЫ ============

export type FilterType =
    | "brightness"
    | "contrast"
    | "saturation"
    | "blur"
    | "grayscale"
    | "sepia"
    | "invert"
    | "noise"
    | "pixelate"
    | "sharpen";

export interface FilterValue {
    type: FilterType;
    value: number;
}

export interface ImageFilters {
    brightness: number;   // -1 to 1, default 0
    contrast: number;     // -1 to 1, default 0
    saturation: number;   // -1 to 1, default 0
    blur: number;         // 0 to 1, default 0
    grayscale: boolean;
    sepia: boolean;
    invert: boolean;
    noise: number;        // 0 to 1000, default 0
    pixelate: number;     // 1 to 20, default 1
}

// ============ ЭКСПОРТ ============

export type ExportFormat = "png" | "jpeg" | "webp";

export interface ExportOptions {
    format: ExportFormat;
    quality: number;        // 0-1 для jpeg/webp
    multiplier: number;     // масштаб экспорта
    withWatermark: boolean;
    backgroundColor?: string;
}

export interface ExportResult {
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
}

// ============ СОБЫТИЯ ============

export type EditorEventType =
    | "ready"
    | "object:added"
    | "object:removed"
    | "object:modified"
    | "object:selected"
    | "selection:cleared"
    | "history:changed"
    | "zoom:changed"
    | "canvas:modified";

export interface EditorEventMap {
    ready: { editor: IEditor };
    "object:added": { object: LayerItem };
    "object:removed": { objectId: string };
    "object:modified": { object: LayerItem };
    "object:selected": { objects: LayerItem[] };
    "selection:cleared": Record<string, never>;
    "history:changed": HistoryState;
    "zoom:changed": { zoom: number };
    "canvas:modified": Record<string, never>;
}

// ============ ГЛАВНЫЙ КЛАСС ============

export interface IEditor {
    // Состояние
    readonly isReady: boolean;
    readonly config: EditorConfig;
    readonly zoom: number;

    // Canvas
    getCanvas(): Canvas;
    setBackgroundImage(url: string): Promise<void>;
    setBackgroundColor(color: string): void;
    resize(width: number, height: number): void;

    // Объекты
    addImage(url: string, options?: Partial<AddImageOptions>): Promise<LayerItem>;
    addText(text: string, options?: Partial<TextStyles>): LayerItem;
    removeObject(id: string): void;
    getObject(id: string): LayerItem | null;
    getLayers(): LayerItem[];
    getSelectedObjects(): LayerItem[];
    selectObject(id: string): void;
    deselectAll(): void;

    // Порядок слоёв
    bringForward(id: string): void;
    sendBackward(id: string): void;
    bringToFront(id: string): void;
    sendToBack(id: string): void;

    // Трансформации
    setObjectPosition(id: string, x: number, y: number): void;
    setObjectScale(id: string, scaleX: number, scaleY: number): void;
    setObjectRotation(id: string, angle: number): void;
    setObjectOpacity(id: string, opacity: number): void;
    flipObject(id: string, direction: "horizontal" | "vertical"): void;

    // Текст
    setTextStyles(id: string, styles: Partial<TextStyles>): void;

    // Фильтры
    applyFilter(id: string, filter: FilterValue): void;
    removeFilter(id: string, filterType: FilterType): void;
    getFilters(id: string): FilterValue[];

    // Watermark
    setWatermarkEnabled(enabled: boolean): void;
    setWatermarkConfig(config: Partial<WatermarkConfig>): void;

    // История
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    getHistoryState(): HistoryState;

    // Zoom
    setZoom(zoom: number): void;
    zoomIn(): void;
    zoomOut(): void;
    resetZoom(): void;
    fitToScreen(): void;

    // Экспорт
    exportImage(options: ExportOptions): Promise<ExportResult>;
    toJSON(): object;
    loadFromJSON(json: object): Promise<void>;

    // События
    on<K extends EditorEventType>(event: K, callback: (data: EditorEventMap[K]) => void): void;
    off<K extends EditorEventType>(event: K, callback: (data: EditorEventMap[K]) => void): void;

    // Lifecycle
    destroy(): void;
}

export interface AddImageOptions {
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    opacity: number;
    name: string;
}
