import type { IEditor } from "../types";

export interface ICommand {
    execute(): void;
    undo(): void;
}

export abstract class BaseCommand implements ICommand {
    protected editor: IEditor;

    constructor(editor: IEditor) {
        this.editor = editor;
    }

    abstract execute(): void;
    abstract undo(): void;

    redo(): void {
        this.execute();
    }
}
