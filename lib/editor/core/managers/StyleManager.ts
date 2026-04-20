import type * as fabric from "fabric";
import { BaseManager } from "./BaseManager";
import type {
    TextStyles,
    FilterValue,
    FilterType,
    WatermarkConfig,
} from "../../types";

export class StyleManager extends BaseManager {
    setObjectPosition(id: string, x: number, y: number): void {
        const layer = this.editor.objects.get(id);
        if (!layer) return;

        layer.fabricObject.set({ left: x, top: y });
        layer.fabricObject.setCoords();
        this.editor.canvas?.renderAll();
    }

    setObjectScale(id: string, scaleX: number, scaleY: number): void {
        const layer = this.editor.objects.get(id);
        if (!layer) return;

        layer.fabricObject.set({ scaleX, scaleY });
        layer.fabricObject.setCoords();
        this.editor.canvas?.renderAll();
    }

    setObjectRotation(id: string, angle: number): void {
        const layer = this.editor.objects.get(id);
        if (!layer) return;

        layer.fabricObject.set({ angle });
        layer.fabricObject.setCoords();
        this.editor.canvas?.renderAll();
    }

    setObjectOpacity(id: string, opacity: number): void {
        const layer = this.editor.objects.get(id);
        if (!layer) return;

        layer.fabricObject.set({ opacity });
        layer.opacity = opacity;
        this.editor.canvas?.renderAll();
    }

    flipObject(id: string, direction: "horizontal" | "vertical"): void {
        const layer = this.editor.objects.get(id);
        if (!layer) return;

        if (direction === "horizontal") {
            layer.fabricObject.set({ flipX: !layer.fabricObject.flipX });
        } else {
            layer.fabricObject.set({ flipY: !layer.fabricObject.flipY });
        }
        this.editor.canvas?.renderAll();
    }

    setTextStyles(id: string, styles: Partial<TextStyles>): void {
        const layer = this.editor.objects.get(id);
        if (!layer || layer.type !== "text") return;

        const textbox = layer.fabricObject as fabric.Textbox;

        if (styles.fontFamily !== undefined) textbox.set("fontFamily", styles.fontFamily);
        if (styles.fontSize !== undefined) textbox.set("fontSize", styles.fontSize);
        if (styles.fontWeight !== undefined) textbox.set("fontWeight", styles.fontWeight);
        if (styles.fontStyle !== undefined) textbox.set("fontStyle", styles.fontStyle);
        if (styles.fill !== undefined) textbox.set("fill", styles.fill);
        if (styles.textAlign !== undefined) textbox.set("textAlign", styles.textAlign);
        if (styles.underline !== undefined) textbox.set("underline", styles.underline);
        if (styles.linethrough !== undefined) textbox.set("linethrough", styles.linethrough);
        if (styles.charSpacing !== undefined) textbox.set("charSpacing", styles.charSpacing * 10);
        if (styles.lineHeight !== undefined) textbox.set("lineHeight", styles.lineHeight);

        this.editor.canvas?.renderAll();
    }

    applyFilter(id: string, filter: FilterValue): void {
        const layer = this.editor.objects.get(id);
        if (!layer || layer.type !== "image") return;

        const image = layer.fabricObject as fabric.Image;
        const filters = image.filters || [];

        const existingIndex = filters.findIndex(
            (f) => f && (f as unknown as { type: string }).type === filter.type
        );
        if (existingIndex !== -1) {
            filters.splice(existingIndex, 1);
        }

        const fabricFilter = this.createFabricFilter(filter);
        if (fabricFilter) {
            filters.push(fabricFilter as unknown as fabric.filters.BaseFilter<string, Record<string, unknown>>);
        }

        image.filters = filters;
        image.applyFilters();
        this.editor.canvas?.renderAll();
    }

    public createFabricFilter(filter: FilterValue): fabric.filters.BaseFilter<string, Record<string, unknown>> | null {
        const fabricLib = this.fabric;
        switch (filter.type) {
            case "brightness":
                return new fabricLib.filters.Brightness({ brightness: filter.value });
            case "contrast":
                return new fabricLib.filters.Contrast({ contrast: filter.value });
            case "saturation":
                return new fabricLib.filters.Saturation({ saturation: filter.value });
            case "blur":
                return new fabricLib.filters.Blur({ blur: filter.value });
            case "grayscale":
                return filter.value ? new fabricLib.filters.Grayscale() : null;
            case "sepia":
                return filter.value ? new fabricLib.filters.Sepia() : null;
            case "invert":
                return filter.value ? new fabricLib.filters.Invert() : null;
            case "noise":
                return new fabricLib.filters.Noise({ noise: filter.value });
            case "pixelate":
                return new fabricLib.filters.Pixelate({ blocksize: filter.value });
            default:
                return null;
        }
    }

    removeFilter(id: string, filterType: FilterType): void {
        const layer = this.editor.objects.get(id);
        if (!layer || layer.type !== "image") return;

        const image = layer.fabricObject as fabric.Image;
        if (!image.filters) return;

        image.filters = image.filters.filter(
            (f) => f && (f as unknown as { type: string }).type !== filterType
        );
        image.applyFilters();
        this.editor.canvas?.renderAll();
    }

    getFilters(id: string): FilterValue[] {
        const layer = this.editor.objects.get(id);
        if (!layer || layer.type !== "image") return [];

        const image = layer.fabricObject as fabric.Image;
        if (!image.filters) return [];

        return image.filters
            .filter(Boolean)
            .map((f) => {
                const filter = f as unknown as { type: string };
                return {
                    type: filter.type as FilterType,
                    value: this.getFilterValue(f),
                };
            });
    }

    private getFilterValue(filter: fabric.filters.BaseFilter<string, Record<string, unknown>>): number {
        const f = filter as unknown as Record<string, number | undefined>;
        if (f.brightness !== undefined) return f.brightness;
        if (f.contrast !== undefined) return f.contrast;
        if (f.saturation !== undefined) return f.saturation;
        if (f.blur !== undefined) return f.blur;
        if (f.noise !== undefined) return f.noise;
        if (f.blocksize !== undefined) return f.blocksize;
        return 1;
    }

    setWatermarkEnabled(enabled: boolean): void {
        this.editor._config.watermark.enabled = enabled;
    }

    setWatermarkConfig(config: Partial<WatermarkConfig>): void {
        this.editor._config.watermark = { ...this.editor._config.watermark, ...config };
    }
}
