"use client";

import { useEffect } from "react";
import { useEditor, useEditorHistory } from "./EditorProvider";

export function EditorHotkeys() {
    const {
        removeSelected,
        duplicateSelected,
        deselectAll,
        selectedObjects,
    } = useEditor();
    const { undo, redo, canUndo, canRedo } = useEditorHistory();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            const isShift = e.shiftKey;

            // Не обрабатываем если фокус в input/textarea
            if (
                document.activeElement?.tagName === "INPUT" ||
                document.activeElement?.tagName === "TEXTAREA"
            ) {
                return;
            }

            // Undo: Ctrl+Z
            if (isCtrl && e.key === "z" && !isShift) {
                e.preventDefault();
                if (canUndo) undo();
                return;
            }

            // Redo: Ctrl+Y или Ctrl+Shift+Z
            if ((isCtrl && e.key === "y") || (isCtrl && e.key === "z" && isShift)) {
                e.preventDefault();
                if (canRedo) redo();
                return;
            }

            // Delete: Delete или Backspace
            if (e.key === "Delete" || e.key === "Backspace") {
                if (selectedObjects.length > 0) {
                    e.preventDefault();
                    removeSelected();
                }
                return;
            }

            // Duplicate: Ctrl+D
            if (isCtrl && e.key === "d") {
                e.preventDefault();
                duplicateSelected();
                return;
            }

            // Deselect: Escape
            if (e.key === "Escape") {
                deselectAll();
                return;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        undo,
        redo,
        canUndo,
        canRedo,
        removeSelected,
        duplicateSelected,
        deselectAll,
        selectedObjects,
    ]);

    return null;
}
