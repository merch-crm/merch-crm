"use client";

import { useState } from "react";
import { Trash2, Move, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemFormData } from "../../../types";
import Image from "next/image";
import { compressImage } from "@/lib/image-processing";

interface MediaStepProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function MediaStep({ formData, updateFormData, onNext, onBack }: MediaStepProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const thumbSettings = (formData.thumbSettings as { zoom: number; x: number; y: number }) || { zoom: 1, x: 0, y: 0 };

    const handleFileProcessing = async (file: File) => {
        setIsProcessing(true);
        try {
            const result = await compressImage(file, { maxSizeMB: 1, type: "image/jpeg" });
            setIsProcessing(false);
            return result;
        } catch (error) {
            console.error("Compression error:", error);
            setIsProcessing(false);
            return null;
        }
    };

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                updateFormData({
                    imageFile: processed.file,
                    imagePreview: processed.preview
                });
            }
        }
    };

    const handleBackImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                updateFormData({
                    imageBackFile: processed.file,
                    imageBackPreview: processed.preview
                });
            }
        }
    };

    const handleSideImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processed = await handleFileProcessing(file);
            if (processed) {
                updateFormData({
                    imageSideFile: processed.file,
                    imageSidePreview: processed.preview
                });
            }
        }
    };

    const handleDetailsImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setIsProcessing(true);
            const processedFiles = [];
            const processedPreviews = [];

            for (const file of files) {
                const result = await handleFileProcessing(file);
                if (result) {
                    processedFiles.push(result.file);
                    processedPreviews.push(result.preview);
                }
            }

            updateFormData({
                imageDetailsFiles: [...(formData.imageDetailsFiles || []), ...processedFiles],
                imageDetailsPreviews: [...(formData.imageDetailsPreviews || []), ...processedPreviews]
            });
            setIsProcessing(false);
        }
    };

    const updateThumb = (updates: Partial<{ zoom: number, x: number, y: number }>) => {
        updateFormData({
            thumbSettings: { ...thumbSettings, ...updates }
        });
    };

    const removeMainImage = () => updateFormData({ imageFile: null, imagePreview: null });
    const removeBackImage = () => updateFormData({ imageBackFile: null, imageBackPreview: null });
    const removeSideImage = () => updateFormData({ imageSideFile: null, imageSidePreview: null });

    const removeDetailImage = (index: number) => {
        const newFiles = [...(formData.imageDetailsFiles || [])];
        const newPreviews = [...(formData.imageDetailsPreviews || [])];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        updateFormData({ imageDetailsFiles: newFiles, imageDetailsPreviews: newPreviews });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="flex-1 flex flex-col p-5 min-h-0">
                {/* Header Area */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-widest">Галерея фотографий</h2>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1 opacity-60">Визуализация карточки товара</p>
                    </div>
                    {isProcessing && (
                        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100 animate-pulse">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Сжатие...</span>
                        </div>
                    )}
                </div>

                {/* Unified Single Block Container */}
                <div className="flex-1 bg-white rounded-[24px] border border-slate-200/80 flex flex-col min-h-0 overflow-hidden">
                    <div className="flex-1 flex min-h-0 divide-x divide-slate-100">
                        {/* LEFT: MAIN PHOTO */}
                        <div className="w-[40%] flex flex-col p-6 min-h-0 bg-slate-50/20">
                            <div className="flex items-center justify-between mb-4 shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Лицевая сторона *</span>
                                {formData.imagePreview && (
                                    <button onClick={removeMainImage} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600">Удалить</button>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                <div className={cn(
                                    "relative flex-1 rounded-[24px] overflow-hidden border-2 border-dashed transition-all group",
                                    formData.imagePreview ? "border-slate-200 bg-white" : "border-slate-200 bg-white shadow-inner hover:border-indigo-400 hover:bg-slate-50"
                                )}>
                                    {formData.imagePreview ? (
                                        <Image src={formData.imagePreview} alt="Main" fill className="object-cover" />
                                    ) : (
                                        <label className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer text-slate-300">
                                            <input type="file" accept="image/*" className="hidden" onChange={handleMainImageChange} />
                                            <div className="w-14 h-14 rounded-[20px] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 group-hover:bg-white transition-all">
                                                <Plus className="w-7 h-7" />
                                            </div>
                                            <div className="text-center">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Загрузить</span>
                                                <span className="text-[8px] font-bold opacity-40 uppercase">JPG, PNG до 5МБ</span>
                                            </div>
                                        </label>
                                    )}
                                </div>

                                {formData.imagePreview && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 shrink-0">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-[14px] bg-white border border-slate-200 overflow-hidden relative shrink-0 shadow-sm">
                                                <div className="absolute inset-0" style={{ transform: `scale(${thumbSettings.zoom}) translate(${thumbSettings.x}%, ${thumbSettings.y}%)` }}>
                                                    <Image src={formData.imagePreview} alt="" fill className="object-cover" />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                                                        <span>Масштаб</span>
                                                        <span className="text-indigo-600">{Math.round(thumbSettings.zoom * 100)}%</span>
                                                    </div>
                                                    <input type="range" min="1" max="3" step="0.1" value={thumbSettings.zoom} onChange={(e) => updateThumb({ zoom: parseFloat(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-indigo-600 cursor-pointer" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">X</span>
                                                        <input type="range" min="-50" max="50" step="1" value={thumbSettings.x} onChange={(e) => updateThumb({ x: parseInt(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-slate-400 cursor-pointer" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Y</span>
                                                        <input type="range" min="-50" max="50" step="1" value={thumbSettings.y} onChange={(e) => updateThumb({ y: parseInt(e.target.value) })} className="w-full h-1 bg-slate-200 rounded-full appearance-none accent-slate-400 cursor-pointer" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: STORYBOARD & GALLERY */}
                        <div className="flex-1 flex flex-col min-h-0 bg-white p-6">
                            <div className="flex-1 flex flex-col min-h-0 space-y-6">
                                {/* Storyboard Row */}
                                <div className="space-y-3 shrink-0">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">Ракурсы и раскадровка</span>
                                    <div className="grid grid-cols-2 gap-6 h-[160px]">
                                        <CompactDropzone label="Вид со спины" preview={formData.imageBackPreview ?? null} onChange={handleBackImageChange} onRemove={removeBackImage} />
                                        <CompactDropzone label="Детализация / Бок" preview={formData.imageSidePreview ?? null} onChange={handleSideImageChange} onRemove={removeSideImage} />
                                    </div>
                                </div>

                                {/* Detail Gallery Row */}
                                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                                    <div className="flex items-center justify-between px-1 shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Галерея деталей</span>
                                        <span className="text-[9px] font-black text-slate-300">{(formData.imageDetailsPreviews?.length || 0)}/10</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="flex flex-wrap gap-3">
                                            {formData.imageDetailsPreviews?.map((preview: string, idx: number) => (
                                                <div key={idx} className="relative w-[80px] h-[80px] rounded-[14px] overflow-hidden border border-slate-100 shadow-sm group hover:scale-[1.02] transition-transform">
                                                    <Image src={preview} alt="" fill className="object-cover" />
                                                    <button onClick={() => removeDetailImage(idx)} className="absolute inset-0 bg-rose-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!formData.imageDetailsPreviews || formData.imageDetailsPreviews.length < 10) && (
                                                <label className="w-[80px] h-[80px] rounded-[14px] border-2 border-dashed border-slate-100 bg-slate-50/50 hover:border-indigo-400 hover:bg-white transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group">
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleDetailsImagesChange} />
                                                    <div className="w-7 h-7 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                    <span className="text-[8px] font-black uppercase text-slate-300">Добавить</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="bg-white border-t border-slate-100 p-4 shrink-0 px-10">
                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="px-6 py-2.5 rounded-xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Назад</button>
                    <button
                        onClick={onNext}
                        disabled={!formData.imagePreview || isProcessing}
                        className={cn(
                            "px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3",
                            (!formData.imagePreview || isProcessing)
                                ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200/50"
                        )}
                    >
                        Продолжить
                        <Move className="w-3.5 h-3.5 rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function CompactDropzone({ label, preview, onChange, onRemove }: { label: string, preview: string | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: () => void }) {
    return (
        <div className="flex flex-col min-h-0 space-y-2 flex-1">
            <div className="flex items-center justify-between px-1 shrink-0">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</span>
                {preview && (
                    <button onClick={(e) => { e.preventDefault(); onRemove(); }} className="text-[8px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600">Удалить</button>
                )}
            </div>
            <div className={cn(
                "relative flex-1 rounded-[20px] overflow-hidden border-2 border-dashed transition-all group",
                preview ? "border-slate-100 bg-white shadow-sm ring-1 ring-slate-100" : "border-slate-100 bg-slate-50/50 hover:border-indigo-300 hover:bg-white"
            )}>
                {preview ? (
                    <Image src={preview} alt={label} fill className="object-cover" />
                ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer text-slate-300">
                        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-white transition-all">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-[8px] font-black uppercase text-slate-400">Загрузить</span>
                    </label>
                )}
            </div>
        </div>
    );
}
