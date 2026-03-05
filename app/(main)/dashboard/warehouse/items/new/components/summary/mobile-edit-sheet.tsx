import { Pencil, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface MobileEditSheetProps {
    isOpen: boolean;
    tempName: string;
    onClose: () => void;
    onNameChange: (val: string) => void;
    onSaveName: () => void;
    onCancelName: () => void;
}

export function MobileEditSheet({
    isOpen,
    tempName,
    onClose,
    onNameChange,
    onSaveName,
    onCancelName
}: MobileEditSheetProps) {
    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            className="w-full sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-t-[32px] sm:rounded-[32px]"
            showVisualTitle={false}
        >
            <div className="flex flex-col overflow-hidden max-h-[90vh]">
                {/* Visual Header Handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {/* Standard Sheet Header Style */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                            <Pencil className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-none">Название</h3>
                            <p className="text-xs font-bold text-slate-700 mt-1">Редактирование</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors active:scale-95 p-0"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex-1 p-6 space-y-3 overflow-y-auto min-h-0">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Текущее название</label>
                        <textarea
                            autoFocus
                            value={tempName}
                            onChange={(e) => onNameChange(e.target.value)}
                            className="w-full min-h-[140px] p-5 rounded-3xl bg-slate-50 border-2 border-slate-100 text-lg font-bold text-slate-900 shadow-inner focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none"
                            placeholder="Введите название..."
                        />
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <p className="text-xs font-bold text-amber-600 leading-relaxed">
                            Изменение названия вручную может повлиять на автоматическое обновление при смене характеристик.
                        </p>
                    </div>
                </div>

                {/* Sticky Footer with blur */}
                <div className="p-6 pt-4 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 z-20">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={onCancelName}
                            variant="ghost"
                            className="h-11 w-full sm:flex-1 rounded-[var(--radius-inner)] text-slate-500 font-bold hover:bg-slate-50 text-sm gap-2"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={onSaveName}
                            variant="default" // or 'btn-dark' if custom variant exists, keeping simple default for now as it's typically primary
                            className="h-11 w-full sm:flex-1 rounded-[var(--radius-inner)] text-sm font-bold gap-2 shadow-sm active:scale-95"
                        >
                            <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                            Сохранить
                        </Button>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
