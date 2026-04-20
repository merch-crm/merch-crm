import type * as fabric from "fabric";
import { BaseManager } from "./BaseManager";
import { AddObjectCommand, RemoveObjectCommand } from "../../commands";
import { DEFAULT_TEXT_STYLES } from "../../constants";
import type {
    LayerItem,
    EditorObjectType,
    AddImageOptions,
    TextStyles,
    FabricObjectWithData,
    EditorObjectData
} from "../../types";

export class ObjectManager extends BaseManager {
    private idCounter: number = 0;

    private generateId(): string {
        return `obj_${Date.now()}_${++this.idCounter}`;
    }

    private createLayerItem(
        fabricObject: fabric.Object,
        type: EditorObjectType,
        name: string
    ): LayerItem {
        const id = this.generateId();
        const data: EditorObjectData = {
            id,
            name,
            type,
            visible: true,
            locked: false,
            opacity: fabricObject.opacity ?? 1,
            zIndex: this.editor.objects.size,
        };

        (fabricObject as FabricObjectWithData).set({ data });

        const layer: LayerItem = {
            ...data,
            fabricObject,
        };

        this.editor.objects.set(id, layer);
        return layer;
    }

    public getLayerFromFabricObject(obj: fabric.Object): LayerItem | null {
        const id = (obj as FabricObjectWithData).data?.id;
        return id ? this.editor.objects.get(id) ?? null : null;
    }

    async addImage(
        url: string,
        options: Partial<AddImageOptions> = {}
    ): Promise<LayerItem> {
        if (this.editor.objects.size >= this.editor._config.maxLayers) {
            throw new Error(`Максимум ${this.editor._config.maxLayers} слоёв`);
        }

        try {
            const img = await this.fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
            if (!this.editor.canvas) {
                throw new Error("Canvas not initialized");
            }

            // Масштабируем если слишком большое
            const maxScale = Math.min(
                (this.editor._config.width * 0.8) / img.width!,
                (this.editor._config.height * 0.8) / img.height!,
                1
            );
            if (maxScale < 1) {
                img.scale(maxScale);
            }

            // Центрируем по умолчанию
            const defaultOptions: AddImageOptions = {
                left: options.left ?? (this.editor._config.width - img.getScaledWidth()) / 2,
                top: options.top ?? (this.editor._config.height - img.getScaledHeight()) / 2,
                scaleX: options.scaleX ?? img.scaleX ?? 1,
                scaleY: options.scaleY ?? img.scaleY ?? 1,
                angle: options.angle ?? 0,
                opacity: options.opacity ?? 1,
                name: options.name ?? "Изображение",
            };

            img.set({
                left: defaultOptions.left,
                top: defaultOptions.top,
                scaleX: defaultOptions.scaleX,
                scaleY: defaultOptions.scaleY,
                angle: defaultOptions.angle,
                opacity: defaultOptions.opacity,
            });

            const layer = this.createLayerItem(img, "image", defaultOptions.name);

            // Добавляем через команду для истории
            const command = new AddObjectCommand(this.editor, img, layer);
            this.editor.history.execute(command);

            this.editor.emit("object:added", { object: layer });
            return layer;
        } catch (_error) {
            throw new Error("Failed to load image");
        }
    }

    addText(text: string = "Текст", options: Partial<TextStyles> = {}): LayerItem {
        if (this.editor.objects.size >= this.editor._config.maxLayers) {
            throw new Error(`Максимум ${this.editor._config.maxLayers} слоёв`);
        }

        const styles = { ...DEFAULT_TEXT_STYLES, ...options };

        const textbox = new this.fabric.Textbox(text, {
            left: 100,
            top: 100,
            width: 200,
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            fontStyle: styles.fontStyle,
            fill: styles.fill,
            textAlign: styles.textAlign,
            underline: styles.underline,
            linethrough: styles.linethrough,
            charSpacing: styles.charSpacing * 10,
            lineHeight: styles.lineHeight,
        });

        const layer = this.createLayerItem(textbox, "text", "Текст");

        const command = new AddObjectCommand(this.editor, textbox, layer);
        this.editor.history.execute(command);

        this.editor.emit("object:added", { object: layer });
        return layer;
    }

    removeObject(id: string): void {
        const layer = this.editor.objects.get(id);
        if (!layer || !this.editor.canvas) return;

        const zIndex = this.editor.canvas.getObjects().indexOf(layer.fabricObject);
        const command = new RemoveObjectCommand(this.editor, layer.fabricObject, layer, zIndex);
        this.editor.history.execute(command);

        this.editor.objects.delete(id);
        this.editor.emit("object:removed", { objectId: id });
    }

    getObject(id: string): LayerItem | null {
        return this.editor.objects.get(id) ?? null;
    }

    getLayers(): LayerItem[] {
        if (!this.editor.canvas) return [];

        return this.editor.canvas
            .getObjects()
            .filter((obj: fabric.Object) => (obj as FabricObjectWithData).data?.id && (obj as FabricObjectWithData).data?.type !== "watermark")
            .map((obj: fabric.Object) => this.editor.objects.get((obj as FabricObjectWithData).data!.id)!)
            .filter(Boolean)
            .reverse();
    }

    getSelectedObjects(): LayerItem[] {
        if (!this.editor.canvas) return [];

        return this.editor.canvas
            .getActiveObjects()
            .map((obj) => this.getLayerFromFabricObject(obj))
            .filter(Boolean) as LayerItem[];
    }

    selectObject(id: string): void {
        const layer = this.editor.objects.get(id);
        if (!layer || !this.editor.canvas) return;

        this.editor.canvas.setActiveObject(layer.fabricObject);
        this.editor.canvas.renderAll();
    }

    deselectAll(): void {
        if (!this.editor.canvas) return;
        this.editor.canvas.discardActiveObject();
        this.editor.canvas.renderAll();
    }

    bringForward(id: string): void {
        const layer = this.editor.objects.get(id);
        if (!layer || !this.editor.canvas) return;

        this.editor.canvas.bringObjectForward(layer.fabricObject);
        this.updateLayerZIndexes();
        this.editor.canvas.renderAll();
    }

    sendBackward(id: string): void {
        const layer = this.editor.objects.get(id);
        if (!layer || !this.editor.canvas) return;

        this.editor.canvas.sendObjectBackwards(layer.fabricObject);
        this.updateLayerZIndexes();
        this.editor.canvas.renderAll();
    }

    bringToFront(id: string): void {
        const layer = this.editor.objects.get(id);
        if (!layer || !this.editor.canvas) return;

        this.editor.canvas.bringObjectToFront(layer.fabricObject);
        this.updateLayerZIndexes();
        this.editor.canvas.renderAll();
    }

    sendToBack(id: string): void {
        const layer = this.editor.objects.get(id);
        if (!layer || !this.editor.canvas) return;

        this.editor.canvas.sendObjectToBack(layer.fabricObject);
        this.updateLayerZIndexes();
        this.editor.canvas.renderAll();
    }

    public updateLayerZIndexes(): void {
        if (!this.editor.canvas) return;

        this.editor.canvas.getObjects().forEach((obj: fabric.Object, index: number) => {
            const data = (obj as FabricObjectWithData).data;
            if (data?.id) {
                const layer = this.editor.objects.get(data.id);
                if (layer) {
                    layer.zIndex = index;
                }
            }
        });
    }
}
