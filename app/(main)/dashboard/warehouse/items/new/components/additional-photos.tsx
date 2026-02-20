import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface AdditionalPhotosProps {
    previews: string[] | undefined;
    uploading?: boolean;
    loadingIndex: number | null;
    progress?: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onReplace: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: (index: number) => void;
}

export function AdditionalPhotos({
    previews,
    uploading,
    loadingIndex,
    progress,
    onChange,
    onReplace,
    onRemove
}: AdditionalPhotosProps) {
    return (
        <div className="grid grid-cols-3 gap-3 pb-4">
            {previews?.map((preview: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-[var(--radius)] overflow-hidden border border-slate-200 shadow-sm group transition-all">
                    {uploading && loadingIndex === idx ? (
                        <div className="flex flex-col items-center justify-center gap-2 w-full h-full bg-slate-50/50">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-primary transition-all duration-300 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
                                </svg>
                                <span className="absolute text-xs font-bold text-primary">{progress}%</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Image src={preview} alt={`Дополнительное фото ${idx + 1}`} fill className="object-cover" />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 z-50 backdrop-blur-[2px]">
                                <label className="w-10 h-10 flex items-center justify-center bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-lg group/btn active:scale-90" title="Заменить">
                                    <RefreshCcw className="w-5 h-5 text-primary group-hover/btn:rotate-180 transition-transform duration-500" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => onReplace(idx, e)}
                                    />
                                </label>
                                <Button
                                    onClick={(e) => { e.preventDefault(); onRemove(idx); }}
                                    size="icon"
                                    variant="destructive"
                                    className="w-10 h-10 rounded-full shadow-lg active:scale-90"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            ))}

            {(!previews || previews.length < 3) && (
                <label className="aspect-square rounded-[var(--radius)] border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group relative">
                    {uploading && loadingIndex === (previews?.length || 0) ? (
                        <div className="flex flex-col items-center justify-center gap-2 w-full h-full">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                    <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                    <path className="text-primary transition-all duration-300 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${progress}, 100`} />
                                </svg>
                                <span className="absolute text-xs font-bold text-primary">{progress}%</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={onChange} />
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                                <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Добавить</span>
                        </>
                    )}
                </label>
            )}
        </div>
    )
}
