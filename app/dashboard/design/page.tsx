import { Palette } from "lucide-react";

export default function DesignPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-4 bg-indigo-50 rounded-full">
                <Palette className="h-12 w-12 text-indigo-600" />
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">Модуль "Дизайн-студия" в разработке</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    Здесь будет сосредоточено управление макетами, согласованиями с клиентами и
                    инструменты для дизайнеров. Мы уже готовим этот раздел к запуску.
                </p>
            </div>
        </div>
    );
}
