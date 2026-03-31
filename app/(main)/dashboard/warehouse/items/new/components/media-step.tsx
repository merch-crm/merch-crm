import { Images, PlusSquare } from "lucide-react";
import { Category, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { StepFooter } from "./step-footer";
import { useMediaLogic } from "../hooks/useMediaLogic";
import { MainPhotoUploader } from "./main-photo-uploader";
import { ImageThumbControls } from "./image-thumb-controls";
import { AdditionalPhotos } from "./additional-photos";


interface MediaStepProps {
    category: Category | null;
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function MediaStep({ category, formData, updateFormData, onNext, onBack }: MediaStepProps) {
    const {
        isProcessing,
        uploadStates,
        loadingIndex,
        thumbSettings,
        aspectRatio,
        maxBounds,
        baseScale,
        containerRef,
        containerDims,

        setAspectRatio,
        updateThumb,
        resetThumbSettings,

        handleMainImageChange,
        handleDetailImageChange,
        handleDetailImageReplace,

        removeMainImage,
        removeDetailImage
    } = useMediaLogic({ formData, updateFormData });

    return (
        <div className="flex flex-col min-h-0 h-full !overflow-visible">
            <div className="flex-1 flex flex-col min-h-0 custom-scrollbar pr-1 overflow-y-auto">
                <div className="w-full flex flex-col min-h-0 h-full p-8 pb-2">
                    {/* Header Area */}
                    <div className="flex items-center gap-3 shrink-0 mb-4 relative">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Images className="w-6 h-6 text-white" aria-label="Images" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900">Галерея фотографий</h2>
                            <p className="text-xs font-bold text-slate-700 opacity-60">Визуализация карточки товара</p>
                        </div>

                        {isProcessing && (
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <span className="text-xs font-bold  text-primary">Загрузка...</span>
                            </div>
                        )}
                    </div>

                    {/* Unified Single Block Container */}
                    <div className="flex-1 flex flex-col min-h-0 !overflow-visible">
                        <div className="flex-1 flex flex-col md:flex-row min-h-0 py-1 md:py-2 gap-3">
                            {/* LEFT: MAIN PHOTO */}
                            <div className="w-full md:w-[400px] h-full flex flex-col min-h-0 shrink-0 space-y-1.5">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                        <Images className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <h4 className="text-[13px] font-bold text-slate-800">Основной ракурс</h4>
                                </div>

                                <MainPhotoUploader
                                    category={category}
                                    preview={formData.imagePreview ?? null}
                                    uploading={loadingIndex === 0}
                                    progress={uploadStates.front?.progress ?? 0}
                                    zoom={thumbSettings.zoom ?? 1}
                                    x={thumbSettings.x ?? 0}
                                    y={thumbSettings.y ?? 0}
                                    baseScale={baseScale}
                                    aspectRatio={aspectRatio}
                                    containerRef={containerRef}
                                    onSetAspectRatio={setAspectRatio}
                                    onChange={handleMainImageChange}
                                    onRemove={removeMainImage}
                                />

                                <ImageThumbControls
                                    disabled={!formData.imagePreview}
                                    containerDims={containerDims}
                                    zoom={thumbSettings.zoom ?? 1}
                                    x={thumbSettings.x ?? 0}
                                    y={thumbSettings.y ?? 0}
                                    maxBounds={maxBounds}
                                    onUpdatePitch={updateThumb}
                                    onReset={resetThumbSettings}
                                />
                            </div>

                            {/* RIGHT: STORYBOARD & GALLERY */}
                            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-[4px]">
                                <div className="space-y-3 flex-1 flex flex-col min-h-0 pt-0 pb-12">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                            <PlusSquare className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <h4 className="text-[13px] font-bold text-slate-800">Дополнительные фото</h4>
                                    </div>
                                    <AdditionalPhotos
                                        previews={formData.imageDetailsPreviews}
                                        loadingIndex={loadingIndex}
                                        progress={uploadStates.details?.progress ?? 0}
                                        onChange={handleDetailImageChange}
                                        onReplace={handleDetailImageReplace}
                                        onRemove={removeDetailImage}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-auto mx-0 shrink-0 !overflow-visible">
                <StepFooter
                    onBack={onBack}
                    onNext={onNext}
                    isNextDisabled={isProcessing}
                    validationError={undefined}
                    hint={undefined}
                />
            </div>
        </div>
    );
}
