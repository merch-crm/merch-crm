import type * as fabric from "fabric";
import { BaseCommand } from "./Command";
import type { IEditor, EditorObjectData } from "../types";

export class RemoveObjectCommand extends BaseCommand {
    private fabricObject: fabric.Object;
    private objectData: EditorObjectData;
    private zIndex: number;

    constructor(
        editor: IEditor,
        fabricObject: fabric.Object,
        objectData: EditorObjectData,
        zIndex: number
    ) {
        super(editor);
        this.fabricObject = fabricObject;
        this.objectData = objectData;
        this.zIndex = zIndex;
    }

    execute(): void {
        const canvas = this.editor.getCanvas();
        canvas.remove(this.fabricObject);
        canvas.renderAll();
    }

    undo(): void {
        const canvas = this.editor.getCanvas();
        canvas.add(this.fabricObject);
        // Восстанавливаем z-index
        const obj = this.fabricObject as fabric.Object & { moveTo: (index: number) => fabric.Object };
        obj.moveTo(this.zIndex);
        canvas.renderAll();
    }
}
