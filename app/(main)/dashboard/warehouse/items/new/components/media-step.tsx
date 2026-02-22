import { Images } from "lucide-react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { StepFooter } from "./step-footer";
import { useMediaLogic } from "../hooks/useMediaLogic";
import { MainPhotoUploader } from "./main-photo-uploader";
import { ImageThumbControls } from "./image-thumb-controls";
import { CompactDropzone } from "./compact-dropzone";
import { AdditionalPhotos } from "./additional-photos";

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
        handleBackImageChange,
        handleSideImageChange,
        handleDetailImageChange,
        handleDetailImageReplace,

        removeMainImage,
        removeBackImage,
        removeSideImage,
        removeDetailImage
    } = useMediaLogic({ formData, updateFormData });

    return (
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex-1 flex flex-col px-4 sm:px-10 pt-6 sm:pt-10 pb-0 min-h-0">
                <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-3">
                    {/* Header Area */}
                    <div className="flex items-center gap-3 shrink-0 relative">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                            <Images className="w-6 h-6 text-white" aria-label="Images" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-slate-900 ">Галерея фотографий</h2>
                            <p className="text-xs text-slate-700 font-bold opacity-60">Визуализация карточки товара</p>
                        </div>

                        {isProcessing && (
                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20 animate-pulse">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                <span className="text-xs font-bold  text-primary">Сжатие...</span>
                            </div>
                        )}
                    </div>

                    {/* Unified Single Block Container */}
                    <div className="flex-1 bg-white rounded-3xl flex flex-col min-h-0 overflow-hidden">
                        <div className="flex-1 flex flex-col md:flex-row min-h-0">
                            {/* LEFT: MAIN PHOTO */}
                            <div className="w-full md:w-[45%] h-full flex flex-col min-h-0 bg-slate-50/20 px-4 md:pl-8 pt-6 pb-2 space-y-3">
                                <div className="mb-2">
                                    <h4 className="text-base font-bold text-slate-900">Основной ракурс <span className="text-rose-500">*</span></h4>
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
                            <div className="flex-1 flex flex-col min-h-0 bg-white pt-6 px-8 pb-8 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col min-h-0 space-y-3">
                                    <div className="space-y-3 shrink-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[480px]">
                                            <CompactDropzone
                                                label={<>Вид со спины <span className="text-rose-500">*</span></>}
                                                preview={formData.imageBackPreview ?? null}
                                                onChange={handleBackImageChange}
                                                onRemove={removeBackImage}
                                                uploading={uploadStates.back?.uploading}
                                                progress={uploadStates.back?.progress}
                                            />
                                            <CompactDropzone
                                                label={<>Вид сбоку <span className="text-rose-500">*</span></>}
                                                preview={formData.imageSidePreview ?? null}
                                                onChange={handleSideImageChange}
                                                onRemove={removeSideImage}
                                                uploading={uploadStates.side?.uploading}
                                                progress={uploadStates.side?.progress}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 flex flex-col min-h-0">
                                        <div className="mb-2">
                                            <h4 className="text-base font-bold text-slate-900">Дополнительные фото</h4>
                                            <p className="text-xs font-bold text-slate-700 opacity-60 mt-1">До 3-х фотографий</p>
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
            </div>
            <StepFooter
                onBack={onBack}
                onNext={onNext}
                isNextDisabled={!isMinimumRequiredMet || isProcessing}
                validationError={!isMinimumRequiredMet ? "Загрузите обязательно 3 главных ракурса" : undefined}
                hint={isMinimumRequiredMet && (formData.imageDetailsPreviews?.length || 0) < 3 ? "Вы можете добавить еще 3 дополнительных ракурса" : undefined}
            />
        </div>
    );
}
