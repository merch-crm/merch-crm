import Image from "next/image";
import { Package } from "lucide-react";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";

interface ImageGalleryProps {
    formData: ItemFormData;
}

export function ImageGallery({ formData }: ImageGalleryProps) {
    const images = [
        formData.imagePreview,
        formData.imageBackPreview,
        formData.imageSidePreview,
        ...(formData.imageDetailsPreviews || [])
    ].filter(Boolean) as string[];

    if (images.length === 0) return null;

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                        <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 ">Галерея</h3>
                        <p className="text-xs font-bold text-slate-700">Визуальные материалы</p>
                    </div>
                </div>
            </div>

            <div className="p-6 sm:p-6">
                <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4 custom-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-32 h-32 sm:w-40 sm:h-40 xl:w-full xl:aspect-square shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                            <Image src={img} alt={`Фото товара ${idx + 1}`} fill className="object-cover" unoptimized />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
