import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Layers, X, Calendar } from "lucide-react";

interface BulkFormState {
    discountType: string;
}

interface PromocodeBulkModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    bulk: BulkFormState;
    setBulk: React.Dispatch<React.SetStateAction<BulkFormState>>;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    currencySymbol: string;
}

export function PromocodeBulkModal({
    isOpen,
    onClose,
    isLoading,
    bulk,
    setBulk,
    onSubmit,
    currencySymbol
}: PromocodeBulkModalProps) {
    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            showVisualTitle={false}
            className="sm:max-w-[520px] p-0 overflow-hidden"
        >
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                                Массовая генерация
                            </h2>
                            <p className="text-slate-400 text-xs font-bold mt-0.5">
                                Создание группы уникальных кодов
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-all active:scale-95 p-0"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 p-6 sm:p-8 overflow-y-auto custom-scrollbar">
                    <form id="bulk-promocode-form" onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Название группы</label>
                            <Input name="name" required className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 h-12" placeholder="Напр. Акция для блогеров" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Префикс (напр. SALE-)</label>
                                <Input name="prefix" required className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 h-12" placeholder="SALE-" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Количество кодов</label>
                                <Input name="count" type="number" required min="1" max="100" defaultValue="10" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all h-12" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Тип скидки</label>
                                <input type="hidden" name="discountType" value={bulk.discountType} />
                                <Select
                                    options={[
                                        { id: "percentage", title: "Процент %" },
                                        { id: "fixed", title: `Фикс. сумма ${currencySymbol}` },
                                        { id: "free_shipping", title: "Беспл. доставка" },
                                        { id: "gift", title: "Подарок" }
                                    ]}
                                    value={bulk.discountType}
                                    onChange={(val) => setBulk(prev => ({ ...prev, discountType: val }))}
                                    autoLayout={false}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Значение</label>
                                <Input name="value" type="number" required className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-slate-300 h-12" placeholder="10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Дата истечения</label>
                            <div className="relative">
                                <input name="expiresAt" type="date" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-[var(--radius-inner)] text-sm font-bold focus:ring-4 focus:ring-primary/5 transition-all appearance-none h-12" />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-md border-t border-slate-50 sticky bottom-0 z-20">
                    <SubmitButton
                        form="bulk-promocode-form"
                        isLoading={isLoading}
                        disabled={isLoading}
                        className="w-full btn-dark text-white py-8 rounded-[var(--radius-inner)] text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 border-none h-16"
                    >
                        Сгенерировать коды
                    </SubmitButton>
                </div>
            </div>
        </ResponsiveModal>
    );
}
