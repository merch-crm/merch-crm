import { Promocode } from "../types";
import { PromocodeCard } from "./PromocodeCard";
import { Ticket } from "lucide-react";

interface PromocodesGridProps {
    data: Promocode[];
    currencySymbol: string;
    onEdit: (promo: Promocode) => void;
    onToggle: (id: string, current: boolean) => void;
    onDelete: (id: string) => void;
}

export function PromocodesGrid({ data, currencySymbol, onEdit, onToggle, onDelete }: PromocodesGridProps) {
    if (!data || data?.length === 0) {
        return (
            <div className="col-span-full py-24 bg-slate-50/50 rounded-[12px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-[12px] shadow-sm flex items-center justify-center mb-6">
                    <Ticket className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-base font-bold text-slate-400">Ничего не найдено</h3>
                <p className="text-xs text-slate-300 font-bold mt-2">Измените условия поиска или создайте новый промокод</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data?.map((promo) => (
                <PromocodeCard
                    key={promo.id}
                    promo={promo}
                    currencySymbol={currencySymbol}
                    onEdit={onEdit}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
