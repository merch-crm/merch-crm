import { StorageManager } from "@/components/admin/storage-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Управление хранилищем | MerchCRM Admin",
    description: "Настройка и мониторинг локального и облачного S3 хранилища",
};

export default function AdminStoragePage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Хранилище системы</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Локальные диски и S3 провайдеры</p>
            </div>

            <StorageManager />
        </div>
    );
}
