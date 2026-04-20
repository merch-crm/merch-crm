import type { Editor } from "../Editor";
import type * as fabric from "fabric";

export abstract class BaseManager {
    constructor(protected editor: Editor) { }

    protected get canvas(): fabric.Canvas {
        return this.editor.getCanvas();
    }

    protected get fabric(): typeof import("fabric") {
        if (!this.editor.fabric) {
            throw new Error("Fabric.js is not loaded yet");
        }
        return this.editor.fabric;
    }
}
