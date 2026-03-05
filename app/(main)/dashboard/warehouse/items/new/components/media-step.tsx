import { Images } from "lucide-react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { StepFooter } from "./step-footer";
import { useMediaLogic } from "../hooks/useMediaLogic";
import { MainPhotoUploader } from "./main-photo-uploader";
import { ImageThumbControls } from "./image-thumb-controls";
import { AdditionalPhotos } from "./additional-photos";
import { pluralize } from "@/lib/pluralize";

interface MediaStepProps {
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export function MediaStep({ formData, updateFormData, onNext, onBack }: MediaStepProps) {
    const {
        isProcessing,
        uploadStates,
        loadingIndex,
        isMinimumRequiredMet,
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
            <div className="flex-1 flex flex-col min-h-0">
                <div className="w-full flex-1 flex flex-col min-h-0 space-y-3 pl-[var(--radius-padding)] pr-[8px] pt-[var(--radius-padding)]">
                    {/* Header Area */}
                    <div className="flex items-center gap-3 shrink-0 relative">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                            <Images className="w-6 h-6 text-white" aria-label="Images" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900">Галерея фотографий</h2>
                            <p className="text-xs text-slate-700 font-bold opacity-60">Визуализация карточки товара</p>
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
                            <div className="w-full md:w-[360px] h-full flex flex-col min-h-0 shrink-0 space-y-1.5">
                                <div>
                                    <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                                        Основной ракурс
                                        <span className="text-rose-500">*</span>
                                    </h4>
                                </div>

                                <MainPhotoUploader
                                    preview={formData.imagePreview ?? null}
                                    uploading={uploadStates.front?.uploading && loadingIndex === 0}
                                    progress={uploadStates.front?.progress}
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
                            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar mr-[8px]">
                                <div className="space-y-3 flex-1 flex flex-col min-h-0 pt-0">
                                    <div>
                                        <h4 className="text-[14px] font-bold text-slate-900">Дополнительные фото</h4>
                                        <p className="text-[11px] font-bold text-slate-700 opacity-60 mt-0.5">До 6-ти фотографий</p>
                                    </div>
                                    <AdditionalPhotos
                                        previews={formData.imageDetailsPreviews}
                                        uploading={uploadStates.details?.uploading}
                                        loadingIndex={loadingIndex}
                                        progress={uploadStates.details?.progress}
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
                    isNextDisabled={!isMinimumRequiredMet || isProcessing}
                    validationError={!isMinimumRequiredMet ? "Загрузите обязательное фото" : undefined}
                    hint={isMinimumRequiredMet && (formData.imageDetailsPreviews?.length || 0) < 6 ? `Вы можете добавить еще ${6 - (formData.imageDetailsPreviews?.length || 0)} ${pluralize(6 - (formData.imageDetailsPreviews?.length || 0), "дополнительный ракурс", "дополнительных ракурса", "дополнительных ракурсов")}` : undefined}
                />
            </div>
        </div>
    );
}
