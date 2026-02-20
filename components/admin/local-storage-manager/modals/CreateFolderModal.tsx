"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPrefix: string;
    name: string;
    onNameChange: (name: string) => void;
    onConfirm: () => void;
    processing: boolean;
}

export function CreateFolderModal({
    isOpen,
    onClose,
    currentPrefix,
    name,
    onNameChange,
    onConfirm,
    processing
}: CreateFolderModalProps) {
    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Новая папка"
            description={`Создание в: ${currentPrefix || "/"}`}
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400">Имя папки</label>
                    <Input
                        type="text"
                        placeholder="Название папки..."
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onConfirm()}
                        autoFocus
                        className="w-full text-lg font-bold"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="px-8 rounded-[18px] font-bold text-xs text-slate-400 py-6"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={processing || !name.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-[18px] font-bold text-xs py-6 shadow-lg shadow-emerald-200"
                    >
                        {processing ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : "Создать"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
