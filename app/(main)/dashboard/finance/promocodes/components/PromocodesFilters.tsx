import { Filter } from "lucide-react";
import { Select } from "@/components/ui/select";

interface FiltersType {
    status: string;
    type: string;
}

interface PromocodesFiltersProps {
    filters: FiltersType;
    setFilters: (val: FiltersType) => void;
    filteredCount: number;
    currencySymbol: string;
}

export function PromocodesFilters({ filters, setFilters, filteredCount, currencySymbol }: PromocodesFiltersProps) {
    return (
        <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-4 rounded-[20px] border border-slate-100">
            <div className="flex items-center gap-2 text-slate-400 mr-2 shrink-0">
                <Filter className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Фильтры:</span>
            </div>

            <div className="w-[180px]">
                <Select
                    options={[
                        { id: "all", title: "Все статусы" },
                        { id: "active", title: "Только активные" },
                        { id: "paused", title: "На паузе" }
                    ]}
                    value={filters.status}
                    onChange={(val) => setFilters({ ...filters, status: val })}
                    variant="minimal"
                />
            </div>

            <div className="w-[200px]">
                <Select
                    options={[
                        { id: "all", title: "Все типы скидок" },
                        { id: "percentage", title: "Процент %" },
                        { id: "fixed", title: `Фикс. сумма ${currencySymbol}` },
                        { id: "free_shipping", title: "Беспл. доставка" },
                        { id: "gift", title: "Подарок" }
                    ]}
                    value={filters.type}
                    onChange={(val) => setFilters({ ...filters, type: val })}
                    variant="minimal"
                />
            </div>

            <div className="ml-auto text-slate-400 text-xs font-bold">
                Найдено: {filteredCount}
            </div>
        </div>
    );
}
