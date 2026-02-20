import { Search, Layers, Plus, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PromocodesHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onOpenBulk: () => void;
    onOpenCreate: () => void;
    onExport: () => void;
}

export function PromocodesHeader({ searchQuery, setSearchQuery, onOpenBulk, onOpenCreate, onExport }: PromocodesHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex-1 md:min-w-[280px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="ПОИСК КОДА..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-full text-xs font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all placeholder:text-slate-300 shadow-sm"
                />
            </div>
            <Button
                onClick={onOpenBulk}
                variant="outline"
                className="h-12 w-12 sm:w-auto sm:px-6 rounded-full sm:rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center sm:gap-2"
                title="Массовая генерация"
            >
                <Layers className="w-5 h-5 opacity-60" />
                <span className="hidden sm:inline">Массовая генерация</span>
            </Button>
            <Button
                onClick={onOpenCreate}
                variant="default"
                className="h-12 w-12 sm:w-auto sm:px-8 rounded-full sm:rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all flex items-center justify-center sm:gap-2 active:scale-[0.98]"
                title="Создать"
            >
                <Plus className="w-5 h-5 pointer-events-none" />
                <span className="hidden sm:inline">Создать</span>
            </Button>
            <Button
                onClick={onExport}
                variant="outline"
                className="h-12 w-12 p-0 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center"
                title="Экспорт в CSV"
            >
                <Download className="w-5 h-5 opacity-60" />
            </Button>
        </div>
    );
}
