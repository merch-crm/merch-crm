import { Construction } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-slate-200 shadow-sm border-dashed">
            <Construction className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Раздел настройки системы</h2>
            <p className="text-slate-500 mt-2">Этот раздел находится в разработке</p>
        </div>
    );
}
