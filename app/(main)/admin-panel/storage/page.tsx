import { StorageManager } from "@/components/admin/storage-manager";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Управление хранилищем | MerchCRM Admin",
    description: "Настройка и мониторинг локального и облачного S3 хранилища",
};

export default function AdminStoragePage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-normal">Хранилище системы</h1>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Локальные диски и S3 провайдеры</p>
            </div>

            <StorageManager />
        </div>
    );
}
