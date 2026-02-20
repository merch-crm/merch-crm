import { useState } from "react";
import { type InventoryItem, type DialogState } from "@/lib/types";

export function useItemDialogs() {
    const [dialogs, setDialogs] = useState<DialogState>({
        archiveReason: false,
        draftConfirm: false,
        unsavedChanges: false,
        deleteConfirm: false,
        duplicateConfirm: { open: false },
        transfer: false,
        label: false,
        scanner: false
    });

    const openDialog = (key: keyof DialogState, data?: InventoryItem) => {
        setDialogs((prev: DialogState) => {
            if (key === 'duplicateConfirm' && data) {
                return { ...prev, duplicateConfirm: { open: true, item: data } };
            }
            return { ...prev, [key]: true } as DialogState;
        });
    };

    const closeDialog = (key: keyof DialogState) => {
        setDialogs((prev: DialogState) => {
            if (key === 'duplicateConfirm') {
                return { ...prev, duplicateConfirm: { ...prev.duplicateConfirm, open: false } };
            }
            return { ...prev, [key]: false } as DialogState;
        });
    };

    return { dialogs, setDialogs, openDialog, closeDialog };
}
