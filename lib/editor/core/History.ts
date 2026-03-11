import { ICommand } from "../commands/Command";
import { EventEmitter } from "./EventEmitter";
import type { HistoryState } from "../types";

export class HistoryManager extends EventEmitter {
    private undoStack: ICommand[] = [];
    private redoStack: ICommand[] = [];
    private maxHistory: number;
    private isExecuting: boolean = false;

    constructor(maxHistory: number = 50) {
        super();
        this.maxHistory = maxHistory;
    }

    execute(command: ICommand): void {
        if (this.isExecuting) return;

        this.isExecuting = true;
        try {
            command.execute();
            this.undoStack.push(command);
            this.redoStack = []; // Очищаем redo при новом действии

            // Ограничиваем размер стека
            if (this.undoStack.length > this.maxHistory) {
                this.undoStack.shift();
            }

            this.emitChange();
        } finally {
            this.isExecuting = false;
        }
    }

    undo(): boolean {
        if (!this.canUndo() || this.isExecuting) return false;

        this.isExecuting = true;
        try {
            const command = this.undoStack.pop()!;
            command.undo();
            this.redoStack.push(command);
            this.emitChange();
            return true;
        } finally {
            this.isExecuting = false;
        }
    }

    redo(): boolean {
        if (!this.canRedo() || this.isExecuting) return false;

        this.isExecuting = true;
        try {
            const command = this.redoStack.pop()!;
            // redo - это либо метод redo, либо просто execute для базовых
            if ('redo' in command && typeof (command as { redo: () => void }).redo === 'function') {
                (command as { redo: () => void }).redo();
            } else {
                command.execute();
            }
            this.undoStack.push(command);
            this.emitChange();
            return true;
        } finally {
            this.isExecuting = false;
        }
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    getState(): HistoryState {
        return {
            undoStack: [...this.undoStack],
            redoStack: [...this.redoStack],
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
        };
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.emitChange();
    }

    private emitChange(): void {
        this.emit("history:changed", this.getState());
    }
}
