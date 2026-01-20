import { BackupCard } from "./backup-card";

export default function SecurityPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Безопасность</h1>
                <p className="text-slate-500 font-medium mt-2">Управление доступом и резервное копирование</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BackupCard />

                {/* Placeholder for future logs */}
                <div className="p-6 bg-slate-50 rounded-[18px] border border-slate-200 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                    <p className="font-bold text-slate-400">Журнал аудита</p>
                    <p className="text-xs text-slate-400 mt-1">Скоро появится</p>
                </div>
            </div>
        </div>
    );
}
