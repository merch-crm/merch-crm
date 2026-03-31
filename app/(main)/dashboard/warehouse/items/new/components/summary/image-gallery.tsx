import { useMemo, useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { motion } from "framer-motion";
import { ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { ModernImageGallery } from "@/components/ui/modern-image-gallery";

interface ImageGalleryProps {
    formData: ItemFormData;
}

export function ImageGallery({ formData }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    const images = useMemo(() => {
        const allImages = [
            formData.imagePreview,
            formData.imageBackPreview,
            formData.imageSidePreview,
            ...(formData.imageDetailsPreviews || [])
        ].filter((img): img is string => typeof img === 'string' && img.length > 0);

        return Array.from(new Set(allImages));
    }, [formData.imagePreview, formData.imageBackPreview, formData.imageSidePreview, formData.imageDetailsPreviews]);

    if (images.length === 0) return null;

    const formattedImages = images.map((src, i) => ({ src, label: `Фото ${i + 1}`, alt: `Фото ${i + 1}` }));

    return (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-4 sm:p-6 lg:p-8 overflow-hidden flex flex-col">
            <div className="pb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                        <Package className="w-6 h-6 text-white" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">Галерея</h3>
                        <p className="text-xs font-bold text-slate-700 opacity-60">Визуальные материалы</p>
                    </div>
                </div>
            </div>

            <div className="">
                <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedIndex(idx)}
                            className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in group"
                        >
                            <Image src={img} alt={`Фото товара ${idx + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>

            <ModernImageGallery
                isOpen={selectedIndex >= 0}
                onClose={() => setSelectedIndex(-1)}
                images={formattedImages}
                initialIndex={selectedIndex >= 0 ? selectedIndex : 0}
                itemName="Новый товар"
            />
        </div>
    );
}
