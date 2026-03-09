"use client";

import { useState, useEffect } from "react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "sonner";
import { updateProductLine } from "../actions";
import { type InferSelectModel } from "drizzle-orm";
import { productLines } from "@/lib/schema/product-lines";

type ProductLine = InferSelectModel<typeof productLines>;

interface LineFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    line: ProductLine;
    onSuccess?: () => void;
}

export function LineFormDialog({
    open,
    onOpenChange,
    line,
    onSuccess,
}: LineFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState(line.name);
    const [description, setDescription] = useState(line.description || "");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName(line.name);
            setDescription(line.description || "");
            setError(null);
        }
    }, [open, line]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Название обязательно");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await updateProductLine(line.id, {
                name,
                description: description || undefined,
            });

            if (result.success) {
                toast.success("Линейка обновлена");
                onOpenChange(false);
                onSuccess?.();
            } else {
                setError(result.error || "Ошибка сохранения");
                toast.error(result.error || "Ошибка сохранения");
            }
        } catch {
            setError("Произошла ошибка");
            toast.error("Произошла ошибка");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ResponsiveModal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title="Редактировать линейку"
            showVisualTitle={false}
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-3">
                <h2 className="text-xl font-bold mb-4">Редактировать линейку</h2>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Название</label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Название линейки"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Описание</label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Описание линейки (опционально)"
                        rows={3}
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-500 mt-2">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <SubmitButton
                        isLoading={isSubmitting}
                        disabled={isSubmitting}
                        text="Сохранить"
                        loadingText="Сохранение..."
                    />
                </div>
            </form>
        </ResponsiveModal>
    );
}
