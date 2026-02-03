import { StorageManager } from "@/components/admin/storage-manager";
import { Metadata } from "next";
import { HardDrive } from "lucide-react";

export const metadata: Metadata = {
    title: "Управление хранилищем | MerchCRM Admin",
    description: "Настройка и мониторинг локального и облачного S3 хранилища",
};

export default function AdminStoragePage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                    <HardDrive className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-normal">Хранилище</h1>
                    <p className="text-slate-500 text-[11px] font-medium mt-0.5">Настройка и мониторинг локального и облачного S3 хранилища</p>
                </div>
            </div>

            <StorageManager />
        </div>
    );
}
