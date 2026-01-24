"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getStorageQuotaSettings, updateStorageQuotaSettings, StorageQuotaSettings } from "@/app/dashboard/admin/storage-actions";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}

export function StorageQuotaDialog({ open, onOpenChange, onSaved }: Props) {
    const { toast } = useToast();
    const [settings, setSettings] = useState<StorageQuotaSettings>({
        maxS3Size: 0,
        maxLocalSize: 0,
        warningThreshold: 0.8
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const loadSettings = async () => {
            setLoading(true);
            const res = await getStorageQuotaSettings();
            if (!cancelled) {
                if ("error" in res) {
                    toast(res.error as string, "error");
                } else if (res.data) {
                    setSettings(res.data);
                }
                setLoading(false);
            }
        };

        loadSettings();

        return () => {
            cancelled = true;
        };
    }, [open, toast]);

    const handleSave = async () => {
        setSaving(true);
        const res = await updateStorageQuotaSettings(settings);
        if ("error" in res) {
            toast(res.error as string, "error");
        } else {
            toast("Настройки сохранены", "success");
            onOpenChange(false);
            onSaved();
        }
        setSaving(false);
    };

    // Converters for GB <-> Bytes
    const toGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);
    const fromGB = (gb: string) => Math.round(parseFloat(gb) * 1024 * 1024 * 1024);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl p-8 bg-white overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-#5d00ff rounded-[18px]">
                            <Settings size={24} />
                        </div>
                        Лимиты хранилища
                    </DialogTitle>
                    <DialogDescription className="text-sm font-medium text-slate-500">
                        Настройте максимальный размер хранилища для уведомлений.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-10 text-center text-slate-400 font-bold">Загрузка...</div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 text-sm block mb-2">Лимит S3 (GB)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={toGB(settings.maxS3Size)}
                                onChange={e => setSettings({ ...settings, maxS3Size: fromGB(e.target.value) })}
                                className="bg-slate-50 border-none rounded-[18px] font-bold text-slate-900 h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-bold text-slate-700 text-sm block mb-2">Лимит локального диска (GB)</label>
                            <Input
                                type="number"
                                step="0.1"
                                value={toGB(settings.maxLocalSize)}
                                onChange={e => setSettings({ ...settings, maxLocalSize: fromGB(e.target.value) })}
                                className="bg-slate-50 border-none rounded-[18px] font-bold text-slate-900 h-12 px-4 shadow-sm"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="font-bold text-slate-700 text-sm block mb-2">Порог предупреждения (%)</label>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[18px] shadow-sm border border-slate-100">
                                <input
                                    type="range"
                                    min="10"
                                    max="95"
                                    step="5"
                                    value={settings.warningThreshold * 100}
                                    onChange={e => setSettings({ ...settings, warningThreshold: parseInt(e.target.value) / 100 })}
                                    className="flex-1 accent-#5d00ff h-2 bg-slate-200 rounded-[18px] appearance-none cursor-pointer"
                                />
                                <span className="font-bold text-#5d00ff w-12 text-right text-lg">
                                    {Math.round(settings.warningThreshold * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button onClick={handleSave} disabled={saving || loading} className="w-full bg-#5d00ff hover:bg-indigo-700 text-white rounded-[18px] py-6 font-bold  tracking-normal text-xs shadow-lg shadow-indigo-200">
                        {saving ? "Сохранение..." : "Сохранить настройки"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
