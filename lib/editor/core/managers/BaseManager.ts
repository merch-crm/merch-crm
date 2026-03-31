import type { Editor } from "../Editor";
import * as fabric from "fabric";

export abstract class BaseManager {
    constructor(protected editor: Editor) { }

    protected get canvas(): fabric.Canvas {
        return this.editor.getCanvas();
    }
}
