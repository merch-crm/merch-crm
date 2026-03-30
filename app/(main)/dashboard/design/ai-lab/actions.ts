"use server";

import { ReplicateService } from "@/lib/services/ai/replicate-service";
import { withAuth } from "@/lib/action-helpers";
import { z } from "zod";

const imageUrlSchema = z.string().url("Неверный формат URL изображения");

export async function processBackgroundRemoval(imageUrl: string) {
    return withAuth(async () => {
        const validatedUrl = imageUrlSchema.parse(imageUrl);
        const service = ReplicateService.getInstance();
        try {
            const result = await service.removeBackground(validatedUrl);
            return { success: true, data: result };
        } catch (error) {
            console.error("AI Lab Error (Background Removal):", error);
            return { success: false, error: "Ошибка при удалении фона. Пожалуйста, попробуйте еще раз." };
        }
    }, { errorPath: "ai-lab/processBackgroundRemoval" });
}

export async function processUpscaling(imageUrl: string, _scale: number = 2) {
    return withAuth(async () => {
        const validatedUrl = imageUrlSchema.parse(imageUrl);
        const service = ReplicateService.getInstance();
        try {
            const result = await service.upscaleImage(validatedUrl);
            return { success: true, data: result };
        } catch (error) {
            console.error("AI Lab Error (Upscaling):", error);
            return { success: false, error: "Ошибка при масштабировании изображения. Попробуйте файл меньшего размера." };
        }
    }, { errorPath: "ai-lab/processUpscaling" });
}

export async function processVectorization(imageUrl: string) {
    return withAuth(async () => {
        imageUrlSchema.parse(imageUrl);
        // В будущем здесь будет вызов специализированного API для векторизации
        await new Promise(resolve => setTimeout(resolve, 2000));
        return { 
            success: true, 
            data: {
                url: "/vector_placeholder.svg", 
                message: "Векторизация завершена (демо-режим). SVG файл готов к скачиванию." 
            }
        };
    }, { errorPath: "ai-lab/processVectorization" });
}
