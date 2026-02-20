import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompactDropzoneProps {
    label: React.ReactNode;
    preview: string | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    uploading?: boolean;
    progress?: number;
}

export function CompactDropzone({ label, preview, onChange, onRemove, uploading, progress }: CompactDropzoneProps) {
    return (
        <div className="flex flex-col min-h-0 space-y-2 flex-1">
            <div className="mb-2">
                <label className="text-base font-bold text-slate-900">{label}</label>
            </div>
            <div className={cn(
                "relative aspect-square w-full rounded-[var(--radius)] overflow-hidden border-2 border-dashed transition-all group",
                preview ? "border-slate-200 bg-white shadow-sm ring-1 ring-slate-100" : "border-slate-200 bg-slate-50/50 hover:bg-white"
            )}>
                {uploading ? (
                    <div className="flex flex-col items-center justify-center gap-2 w-full h-full animate-in fade-in duration-300">
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-primary transition-all duration-300 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
                            </svg>
                            <span className="absolute text-xs font-bold text-primary">{progress}%</span>
                        </div>
                    </div>
                ) : preview ? (
                    <>
                        <Image src={preview} alt="Image preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 z-50 backdrop-blur-[2px]">
                            <label className="flex items-center gap-2 px-6 py-3 bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-xl group/btn active:scale-95">
                                <RefreshCcw className="w-4 h-4 text-primary group-hover/btn:rotate-180 transition-transform duration-500" />
                                <span className="text-xs font-bold text-slate-900">Заменить</span>
                                <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                            </label>
                            <Button
                                onClick={(e) => { e.preventDefault(); onRemove(); }}
                                variant="destructive"
                                className="flex items-center gap-2 px-6 py-6 rounded-full shadow-xl active:scale-95 h-auto"
                            >
                                <Trash2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                                <span className="text-xs font-bold ">Удалить</span>
                            </Button>
                        </div>
                    </>
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                            <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Добавить</span>
                    </label>
                )}
            </div>
        </div>
    );
}
