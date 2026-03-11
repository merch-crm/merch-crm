import { fabric } from "fabric";
import { BaseCommand } from "./Command";
import type { IEditor, EditorObjectData } from "../types";

export class AddObjectCommand extends BaseCommand {
    private fabricObject: fabric.Object;
    private objectData: EditorObjectData;

    constructor(
        editor: IEditor,
        fabricObject: fabric.Object,
        objectData: EditorObjectData
    ) {
        super(editor);
        this.fabricObject = fabricObject;
        this.objectData = objectData;
    }

    execute(): void {
        const canvas = this.editor.getCanvas();
        canvas.add(this.fabricObject);
        canvas.setActiveObject(this.fabricObject);
        canvas.renderAll();
    }

    undo(): void {
        const canvas = this.editor.getCanvas();
        canvas.remove(this.fabricObject);
        canvas.renderAll();
    }
}
