import type * as fabric from "fabric";
import { BaseCommand } from "./Command";
import type { IEditor } from "../types";

interface ObjectState {
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
    angle: number;
    opacity: number;
    [key: string]: unknown;
}

export class ModifyObjectCommand extends BaseCommand {
    private fabricObject: fabric.Object;
    private previousState: ObjectState;
    private newState: ObjectState;

    constructor(
        editor: IEditor,
        fabricObject: fabric.Object,
        previousState: ObjectState,
        newState: ObjectState
    ) {
        super(editor);
        this.fabricObject = fabricObject;
        this.previousState = { ...previousState };
        this.newState = { ...newState };
    }

    execute(): void {
        this.fabricObject.set(this.newState);
        this.fabricObject.setCoords();
        this.editor.getCanvas().renderAll();
    }

    undo(): void {
        this.fabricObject.set(this.previousState);
        this.fabricObject.setCoords();
        this.editor.getCanvas().renderAll();
    }
}
