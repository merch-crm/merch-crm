import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MainPhotoUploaderProps {
    preview: string | null;
    uploading?: boolean;
    progress?: number;
    zoom: number;
    x: number;
    y: number;
    baseScale: number;
    aspectRatio: number | null;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onSetAspectRatio: (ratio: number) => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
}

export function MainPhotoUploader({
    preview,
    uploading,
    progress,
    zoom,
    x,
    y,
    baseScale,
    aspectRatio,
    containerRef,
    onSetAspectRatio,
    onChange,
    onRemove
}: MainPhotoUploaderProps) {
    return (
        <div className="flex flex-col justify-start items-center w-full">
            <div
                className={cn(
                    "relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-dashed transition-all group shrink-0",
                    preview ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/50 hover:bg-white shadow-sm"
                )}>
                <div ref={containerRef} className="absolute inset-0">
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center gap-3 w-full h-full animate-in fade-in duration-300">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 36 36">
                                    <path
                                        className="text-slate-100"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    />
                                    <path
                                        className="text-primary transition-all duration-300 ease-out"
                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeDasharray={`${progress}, 100`}
                                    />
                                </svg>
                                <span className="absolute text-[12px] font-bold text-primary">
                                    {progress}%
                                </span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 animate-pulse">Обработка...</span>
                        </div>
                    ) : preview ? (
                        <>
                            <div
                                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                                style={{ transform: `scale(${Number(zoom) * Number(baseScale)})` }}
                            >
                                <div
                                    className="relative w-full h-full"
                                    style={{
                                        transform: `translate(${x}%, ${y}%)`,
                                        aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto'
                                    }}
                                >
                                    <Image
                                        src={preview}
                                        alt="Main product image preview"
                                        fill
                                        priority
                                        className="object-contain"
                                        onLoad={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            onSetAspectRatio(img.naturalWidth / img.naturalHeight);
                                        }}
                                        draggable={false}
                                    />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 z-50 backdrop-blur-[2px]">
                                <label className="flex items-center gap-2 px-7 py-4 bg-white rounded-full cursor-pointer hover:bg-slate-50 transition-all shadow-xl group/btn active:scale-95">
                                    <RefreshCcw className="w-5 h-5 text-primary group-hover/btn:rotate-180 transition-transform duration-500" />
                                    <span className="text-[12px] font-bold text-slate-900">Заменить</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                                </label>
                                <Button
                                    onClick={(e) => { e.preventDefault(); onRemove(); }}
                                    variant="destructive"
                                    className="flex items-center gap-2 px-7 py-6 rounded-full shadow-xl active:scale-95 h-auto"
                                >
                                    <Trash2 className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                    <span className="text-[12px] font-bold">Удалить</span>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm transition-all group-hover:bg-primary/5 group-hover:border-primary/20">
                                <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">Добавить</span>
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={onChange}
                    accept="image/*"
                    disabled={!!preview}
                />
            </div>
        </div>
    )
}
