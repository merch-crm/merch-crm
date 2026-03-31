import { EditorConfig, SelectionStyle, WatermarkConfig, TextStyles, ImageFilters } from "./types";

// Цвета дизайн-системы Lumin-Apple
export const COLORS = {
    primary: "#5d00ff",
    primaryLight: "#8b5cf6",
    background: "#ffffff",
    surface: "#f5f5f7",
    border: "#e5e5e5",
    text: "#1d1d1f",
    textSecondary: "#86868b",
    success: "#34c759",
    warning: "#ff9500",
    error: "#ff3b30",
} as const;

// Стиль выделения объектов
export const DEFAULT_SELECTION_STYLE: SelectionStyle = {
    cornerColor: COLORS.primary,
    cornerStrokeColor: COLORS.primary,
    cornerSize: 10,
    cornerStyle: "circle",
    transparentCorners: false,
    borderColor: COLORS.primary,
    borderScaleFactor: 2,
    padding: 5,
};

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
    enabled: false,
    type: "text",
    text: "© Merch CRM",
    position: "bottom-right",
    opacity: 0.3,
    scale: 1,
    rotation: 0,
    color: "#000000",
    fontSize: 24,
};

// Конфигурация редактора по умолчанию
export const DEFAULT_EDITOR_CONFIG: EditorConfig = {
    maxLayers: 10,
    maxHistory: 50,
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
    watermark: DEFAULT_WATERMARK_CONFIG,
    selectionStyle: DEFAULT_SELECTION_STYLE,
};

// Стили текста по умолчанию
export const DEFAULT_TEXT_STYLES: TextStyles = {
    fontFamily: "Arial",
    fontSize: 24,
    fontWeight: "normal",
    fontStyle: "normal",
    fill: "#000000",
    textAlign: "left",
    underline: false,
    linethrough: false,
    charSpacing: 0,
    lineHeight: 1.2,
};

// Фильтры по умолчанию
export const DEFAULT_IMAGE_FILTERS: ImageFilters = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    grayscale: false,
    sepia: false,
    invert: false,
    noise: 0,
    pixelate: 1,
};

// Ограничения
export const LIMITS = {
    maxLayers: 10,
    maxHistory: 50,
    maxFonts: 30,
    minZoom: 0.1,
    maxZoom: 5,
    zoomStep: 0.1,
    maxImageSize: 50 * 1024 * 1024, // 50MB
    allowedImageTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
} as const;

// Горячие клавиши
export const HOTKEYS = {
    undo: { key: "z", ctrl: true },
    redo: { key: "y", ctrl: true },
    redoAlt: { key: "z", ctrl: true, shift: true },
    delete: { key: "Delete" },
    deleteAlt: { key: "Backspace" },
    selectAll: { key: "a", ctrl: true },
    copy: { key: "c", ctrl: true },
    paste: { key: "v", ctrl: true },
    duplicate: { key: "d", ctrl: true },
    zoomIn: { key: "=", ctrl: true },
    zoomOut: { key: "-", ctrl: true },
    resetZoom: { key: "0", ctrl: true },
    bringForward: { key: "]", ctrl: true },
    sendBackward: { key: "[", ctrl: true },
    bringToFront: { key: "]", ctrl: true, shift: true },
    sendToBack: { key: "[", ctrl: true, shift: true },
} as const;
