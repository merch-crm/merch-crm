import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { BrandingUiState } from "../hooks/useBrandingForm";

interface BrandingModalProps {
    ui: BrandingUiState;
    closeModal: () => void;
}

export function BrandingModal({ ui, closeModal }: BrandingModalProps) {
    return (
        <ResponsiveModal
            isOpen={ui.modal.open}
            onClose={closeModal}
            title={ui.modal.title}
            description={ui.modal.message}
            className="max-w-md"
        >
            <div className="flex flex-col">
                {/* Header Icon Section */}
                <div className={cn(
                    "px-6 py-8 flex flex-col items-center text-center gap-3",
                    ui.modal.type === "success" ? "bg-emerald-50/50" : "bg-rose-50/50"
                )}>
                    <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300",
                        ui.modal.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                    )}>
                        {ui.modal.type === "success" ? (
                            <CheckCircle2 className="w-8 h-8" />
                        ) : (
                            <AlertCircle className="w-8 h-8" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">{ui.modal.title}</h3>
                        <p className="text-sm font-bold text-slate-500 mt-2 max-w-[280px] leading-relaxed">
                            {ui.modal.message}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 pt-2 flex flex-col gap-3">
                    {ui.modal.showRefresh && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                closeModal();
                                window.location.reload();
                            }}
                            className="h-12 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Обновить страницу
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={closeModal}
                        className={cn(
                            "h-12 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 border-none",
                            ui.modal.type === "success"
                                ? "bg-emerald-500 shadow-emerald-200"
                                : "bg-rose-500 shadow-rose-200"
                        )}
                    >
                        Понятно
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
