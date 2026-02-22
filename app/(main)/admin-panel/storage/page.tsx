import { StorageManager } from "@/components/admin/storage-manager";
import { Metadata } from "next";
import { HardDrive } from "lucide-react";
import { PageContainer } from "@/components/ui/page-container";

export const metadata: Metadata = {
    title: "Управление хранилищем | MerchCRM Admin",
    description: "Настройка и мониторинг локального и облачного S3 хранилища",
};

export default function AdminStoragePage() {
    return (
        <PageContainer>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                    <HardDrive className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Хранилище</h1>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">Настройка и мониторинг локального и облачного S3 хранилища</p>
                </div>
            </div>

            <StorageManager />
        </PageContainer>
    );
}
