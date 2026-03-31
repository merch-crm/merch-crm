/**
 * Утилиты для загрузки файлов
 */

interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

interface UploadOptions {
    collectionId: string;
    designId: string;
    versionId: string;
    onProgress?: (progress: UploadProgress) => void;
}

interface UploadedFile {
    id: string;
    filename: string;
    originalName: string;
    format: string;
    fileType: "preview" | "source";
    size: number;
    width: number | null;
    height: number | null;
    path: string;
}

interface UploadResult {
    success: boolean;
    files?: UploadedFile[];
    error?: string;
}

/**
 * Загрузка файлов с отслеживанием прогресса
 */
export async function uploadPrintFiles(
    files: File[],
    options: UploadOptions
): Promise<UploadResult> {
    const { collectionId, designId, versionId, onProgress } = options;

    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        // Отслеживание прогресса
        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress({
                    loaded: event.loaded,
                    total: event.total,
                    percent: Math.round((event.loaded / event.total) * 100),
                });
            }
        });

        xhr.addEventListener("load", () => {
            try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } catch {
                resolve({ success: false, error: "Ошибка парсинга ответа" });
            }
        });

        xhr.addEventListener("error", () => {
            resolve({ success: false, error: "Ошибка сети при загрузке" });
        });

        xhr.addEventListener("timeout", () => {
            resolve({ success: false, error: "Превышено время ожидания" });
        });

        const url = `/api/upload/prints?collectionId=${collectionId}&designId=${designId}&versionId=${versionId}`;

        xhr.open("POST", url);
        xhr.timeout = 300000; // 5 минут
        xhr.send(formData);
    });
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Б";

    const k = 1024;
    const sizes = ["Б", "КБ", "МБ", "ГБ"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Валидация файла перед загрузкой
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 500 * 1024 * 1024; // 500 МБ

    const ALLOWED_EXTENSIONS = [
        "png", "jpg", "jpeg", "webp", "gif",
        "psd", "ai", "cdr", "eps", "pdf", "tiff", "tif", "svg",
    ];

    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Формат .${ext} не поддерживается`,
        };
    }

    if (file.size > MAX_SIZE) {
        return {
            valid: false,
            error: `Файл превышает максимальный размер (500 МБ)`,
        };
    }

    return { valid: true };
}

/**
 * Получить URL для скачивания (оригинальный файл)
 */
export function getDownloadUrl(filePath: string): string {
    // Возвращаем прямой путь к оригинальному файлу
    return filePath;
}

/**
 * Проверка, является ли файл изображением для превью
 */
export function isPreviewFormat(filename: string): boolean {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    return ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
}
