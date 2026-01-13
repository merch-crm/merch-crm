import { Settings } from "lucide-react";

export default function ProductionPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="p-4 bg-indigo-50 rounded-full">
                <Settings className="h-12 w-12 text-indigo-600 animate-spin-slow" />
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-slate-900">Модуль &quot;Производство&quot; в разработке</h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    Мы активно работаем над созданием инструментов для управления производственными процессами.
                    Совсем скоро здесь появится график очереди печати и мониторинг состояния оборудования.
                </p>
            </div>
        </div>
    );
}

// Add animation to tailwind or globals if needed, but using standard lucide spin for now if possible
// Or just static
