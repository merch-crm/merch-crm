"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function BackupCard() {
    const { toast } = useToast();

    const handleDownload = () => {
        toast("Подготовка архива... Загрузка начнется автоматически", "info");
        window.open("/api/admin/backup", "_parent");
    };

    return (
        <div className="p-6 bg-white rounded-[18px] border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                    <Download className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900 mb-1">Резервная копия БД</h3>
                    <p className="text-slate-500 text-sm mb-4 font-medium leading-relaxed">
                        Скачать полный дамп базы данных со всеми таблицами в формате JSON.
                        Файл содержит структуру и данные.
                    </p>
                    <Button
                        onClick={handleDownload}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                    >
                        Скачать архив
                    </Button>
                </div>
            </div>
        </div>
    );
}
