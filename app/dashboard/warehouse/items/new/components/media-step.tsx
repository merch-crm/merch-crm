"use client";

import { Upload, X, Trash2, Move } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaStepProps {
    formData: any;
    updateFormData: (updates: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export function MediaStep({ formData, updateFormData, onNext, onBack }: MediaStepProps) {
    // Helper to generate preview URL
    const createPreview = (file: File) => {
        return URL.createObjectURL(file);
    };

    // Handlers needed for each file input type
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData({
                imageFile: file,
                imagePreview: createPreview(file)
            });
        }
    };

    const handleBackImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData({
                imageBackFile: file,
                imageBackPreview: createPreview(file)
            });
        }
    };

    const handleSideImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            updateFormData({
                imageSideFile: file,
                imageSidePreview: createPreview(file)
            });
        }
    };

    const handleDetailsImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // Append new files to existing ones or replace? Usually append is nicer for multiple inputs.
            // But here we keep it simple: append.
            const newFiles = [...(formData.imageDetailsFiles || []), ...files];
            const newPreviews = [...(formData.imageDetailsPreviews || []), ...files.map(createPreview)];

            updateFormData({
                imageDetailsFiles: newFiles,
                imageDetailsPreviews: newPreviews
            });
        }
    };

    const removeMainImage = () => {
        updateFormData({ imageFile: null, imagePreview: null });
    };

    const removeBackImage = () => {
        updateFormData({ imageBackFile: null, imageBackPreview: null });
    };

    const removeSideImage = () => {
        updateFormData({ imageSideFile: null, imageSidePreview: null });
    };

    const removeDetailImage = (index: number) => {
        const newFiles = [...(formData.imageDetailsFiles || [])];
        const newPreviews = [...(formData.imageDetailsPreviews || [])];

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);

        updateFormData({
            imageDetailsFiles: newFiles,
            imageDetailsPreviews: newPreviews
        });
    };

    return (
        <div className="flex flex-col min-h-full">
            <div className="flex-1 p-8 lg:p-12">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Галерея фотографий</h2>
                            <p className="text-slate-500 font-medium mt-1">Загрузите качественные изображения для карточки товара</p>
                        </div>
                    </div>

                    {/* Main Projections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ImageUploadZone
                            label="Лицевая сторона"
                            preview={formData.imagePreview}
                            onChange={handleMainImageChange}
                            onRemove={removeMainImage}
                            required
                            hint="Главное фото"
                        />
                        <ImageUploadZone
                            label="Вид со спины"
                            preview={formData.imageBackPreview}
                            onChange={handleBackImageChange}
                            onRemove={removeBackImage}
                        />
                        <ImageUploadZone
                            label="Детализация"
                            preview={formData.imageSidePreview}
                            onChange={handleSideImageChange}
                            onRemove={removeSideImage}
                        />
                    </div>

                    {/* Details Gallery */}
                    <div className="pt-10 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Галерея деталей</h3>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">До 10 дополнительных фотографий с разных ракурсов</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {/* Existing Details */}
                            {formData.imageDetailsPreviews?.map((preview: string, idx: number) => (
                                <div key={idx} className="relative aspect-square rounded-[14px] overflow-hidden border border-slate-200 group shadow-sm hover:shadow-lg transition-all">
                                    <img src={preview} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                        <button
                                            onClick={() => removeDetailImage(idx)}
                                            className="w-10 h-10 bg-white/20 hover:bg-rose-500 rounded-[14px] text-white backdrop-blur-md transition-all flex items-center justify-center border border-white/20"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Button */}
                            {(!formData.imageDetailsPreviews || formData.imageDetailsPreviews.length < 10) && (
                                <label className="aspect-square rounded-[14px] border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group text-slate-400 hover:text-indigo-600">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleDetailsImagesChange}
                                    />
                                    <div className="w-12 h-12 rounded-[14px] bg-white group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center transition-all shadow-sm border border-slate-100">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Добавить</span>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 z-30">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="px-6 h-12 rounded-[14px] text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Назад
                    </button>
                    <button
                        onClick={onNext}
                        className="px-10 h-12 bg-slate-900 text-white rounded-[14px] font-black text-xs uppercase tracking-widest hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
                    >
                        Продолжить
                        <Move className="w-4 h-4 rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ImageUploadZone({
    label,
    preview,
    onChange,
    onRemove,
    required,
    hint
}: {
    label: string,
    preview: string | null,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onRemove: () => void,
    required?: boolean,
    hint?: string
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {label} {required && <span className="text-rose-500">*</span>}
                    </span>
                    {hint && <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-0.5">{hint}</span>}
                </div>
                {preview && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
                        className="text-[9px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
                    >
                        Удалить
                    </button>
                )}
            </div>

            <div className={cn(
                "aspect-[4/5] rounded-[14px] border-2 border-dashed transition-all relative overflow-hidden group cursor-pointer",
                preview
                    ? "border-slate-100 bg-slate-50 shadow-inner"
                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            )}>
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-300 group-hover:text-slate-900 transition-colors">
                        <div className="w-12 h-12 rounded-[14px] bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
                            <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Загрузить</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={onChange}
                    onClick={(e) => (e.target as any).value = null} // Allow re-selecting same file
                />
            </div>
        </div>
    );
}
