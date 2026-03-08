/**
 * @file Тесты для хука useImageUploader
 *
 * Проверяет все 5 ключевых возможностей:
 *   1. Предвалидация (размер, тип)
 *   2. Защита от дублей
 *   3. onError коллбэк
 *   4. Реальная XHR-загрузка на сервер
 *   5. Отмена загрузки
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useImageUploader } from "./use-image-uploader";

// ─── Mock: compressImage ───────────────────────────────────────────────────────
vi.mock("@/lib/image-processing", () => ({
    compressImage: vi.fn(async (file: File) => ({
        file: new File([file], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }),
        preview: `blob:mock-preview-${file.name}`,
    })),
}));

// ─── XHR Mock Infrastructure ──────────────────────────────────────────────────
// Создаём управляемый экземпляр, который можно контролировать из тестов.
// Используем КЛАСС, а не vi.fn(), чтобы `new XMLHttpRequest()` работал корректно.

interface MockXhrInstance {
    open: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    setRequestHeader: ReturnType<typeof vi.fn>;
    upload: { onprogress: ((e: ProgressEvent) => void) | null };
    onload: (() => void) | null;
    onerror: (() => void) | null;
    onabort: (() => void) | null;
    status: number;
    responseText: string;
    // Метод для имитации успешного ответа сервера
    simulateSuccess: (url?: string) => void;
    simulateError: () => void;
    simulateProgress: (loaded: number, total: number) => void;
}

let currentXhrInstance: MockXhrInstance;

function createXhrInstance(overrides?: Partial<MockXhrInstance>): MockXhrInstance {
    const instance: MockXhrInstance = {
        open: vi.fn(),
        send: vi.fn(),
        abort: vi.fn(),
        setRequestHeader: vi.fn(),
        upload: { onprogress: null },
        onload: null,
        onerror: null,
        onabort: null,
        status: 200,
        responseText: JSON.stringify({ success: true, url: "/uploads/items/test.webp" }),
        simulateSuccess(url = "/uploads/items/test.webp") {
            this.responseText = JSON.stringify({ success: true, url });
            this.status = 200;
            if (this.onload) this.onload();
        },
        simulateError() {
            if (this.onerror) this.onerror();
        },
        simulateProgress(loaded: number, total: number) {
            if (this.upload.onprogress) {
                this.upload.onprogress({ loaded, total, lengthComputable: true } as ProgressEvent);
            }
        },
        ...overrides,
    };
    // abort активирует onabort — имитирует реальный браузер
    instance.abort = vi.fn(() => {
        if (instance.onabort) instance.onabort();
    });
    return instance;
}

// Реальный класс-заглушка, который возвращает current инстанс при `new`
class MockXHR {
    constructor() {
        return currentXhrInstance as unknown as MockXHR;
    }
}

function makeFile(name = "photo.jpg", size = 1024, type = "image/jpeg"): File {
    return new File([new ArrayBuffer(size)], name, { type });
}

describe("useImageUploader", () => {
    beforeEach(() => {
        currentXhrInstance = createXhrInstance();
        vi.stubGlobal("XMLHttpRequest", MockXHR);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ПРЕДВАЛИДАЦИЯ
    // ─────────────────────────────────────────────────────────────────────────

    it("1a. отклоняет файл больше maxOriginalSizeMB", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() =>
            useImageUploader({ maxOriginalSizeMB: 5 })
        );

        const bigFile = makeFile("big.jpg", 6 * 1024 * 1024); // 6 МБ

        let processed: unknown[] = [];
        await act(async () => {
            processed = await result.current.processFiles([bigFile], 0, undefined, onError);
        });

        expect(processed).toHaveLength(0);
        expect(onError).toHaveBeenCalledOnce();
        expect(onError.mock.calls[0][0]).toContain("слишком большой");
        // XHR вообще не трогался
        expect(currentXhrInstance.send).not.toHaveBeenCalled();
    });

    it("1b. отклоняет не-изображение (video/mp4)", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useImageUploader());

        const videoFile = new File(["data"], "video.mp4", { type: "video/mp4" });

        await act(async () => {
            await result.current.processFiles([videoFile], 0, undefined, onError);
        });

        expect(onError).toHaveBeenCalledOnce();
        expect(onError.mock.calls[0][0]).toContain("не является изображением");
    });

    it("1c. пропускает валидный файл (размер в норме)", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        // XHR сразу завершается успешно при send
        currentXhrInstance.send = vi.fn(() => {
            currentXhrInstance.simulateSuccess();
        });

        const smallFile = makeFile("ok.jpg", 500 * 1024); // 500 KB

        let processed: unknown[] = [];
        await act(async () => {
            processed = await result.current.processFiles([smallFile], 0, undefined, onError);
        });

        expect(onError).not.toHaveBeenCalled();
        expect(processed).toHaveLength(1);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 2. ЗАЩИТА ОТ ДУБЛЕЙ
    // ─────────────────────────────────────────────────────────────────────────

    it("2a. пропускает дублирующийся файл (тот же name + size)", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateSuccess());

        const file = makeFile("dup.jpg", 200 * 1024);

        // Первый вызов — проходит
        let firstResult: unknown[] = [];
        await act(async () => {
            firstResult = await result.current.processFiles([file], 0);
        });
        expect(firstResult).toHaveLength(1);

        // Второй вызов с тем же файлом — должен быть пропущен (dedup)
        let secondResult: unknown[] = [];
        await act(async () => {
            secondResult = await result.current.processFiles([file], 1);
        });
        expect(secondResult).toHaveLength(0);
    });

    it("2b. разные файлы с одинаковым именем но другим размером — не дубли", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateSuccess());

        const file1 = makeFile("photo.jpg", 100 * 1024);
        await act(async () => {
            await result.current.processFiles([file1], 0);
        });

        // Следующий файл такого же имени, но другого размера — переиспользуем тот же XHR
        const file2 = makeFile("photo.jpg", 200 * 1024);
        let r2: unknown[] = [];
        await act(async () => {
            r2 = await result.current.processFiles([file2], 1);
        });

        expect(r2).toHaveLength(1);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 3. КОЛЛБЭК onError
    // ─────────────────────────────────────────────────────────────────────────

    it("3a. onError(msg, file) при сетевой ошибке", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateError());

        const file = makeFile("net-err.jpg", 100 * 1024);

        await act(async () => {
            await result.current.processFiles([file], 0, undefined, onError);
        });

        expect(onError).toHaveBeenCalledOnce();
        const [msg, failedFile] = onError.mock.calls[0];
        expect(msg).toContain("Ошибка сети");
        expect(failedFile).toBe(file);
    });

    it("3b. onError при HTTP 500 с { success: false }", async () => {
        const onError = vi.fn();
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        currentXhrInstance.status = 500;
        currentXhrInstance.responseText = JSON.stringify({ success: false, error: "Server down" });
        currentXhrInstance.send = vi.fn(() => {
            if (currentXhrInstance.onload) currentXhrInstance.onload();
        });

        await act(async () => {
            await result.current.processFiles([makeFile("fail.jpg", 100 * 1024)], 0, undefined, onError);
        });

        expect(onError).toHaveBeenCalledOnce();
        expect(onError.mock.calls[0][0]).toContain("Ошибка сервера: 500");
    });

    it("3c. хэш удаляется при ошибке, позволяя повторить загрузку", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        // Первый запрос — ошибка сети
        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateError());
        const file = makeFile("retry.jpg", 100 * 1024);

        await act(async () => {
            await result.current.processFiles([file], 0);
        });

        // Второй запрос — успех (тот же файл, хэш должен быть удалён при ошибке)
        currentXhrInstance = createXhrInstance();
        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateSuccess());
        vi.stubGlobal("XMLHttpRequest", MockXHR);

        let retryResult: unknown[] = [];
        await act(async () => {
            retryResult = await result.current.processFiles([file], 0);
        });

        expect(retryResult).toHaveLength(1);
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 4. XHR ЗАГРУЗКА И ПРОГРЕСС
    // ─────────────────────────────────────────────────────────────────────────

    it("4a. отправляет POST /api/upload с FormData (file + folder)", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));
        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateSuccess());

        await act(async () => {
            await result.current.processFiles([makeFile("upload.jpg", 100 * 1024)], 0);
        });

        expect(currentXhrInstance.open).toHaveBeenCalledWith("POST", "/api/upload", true);
        const sendArg = currentXhrInstance.send.mock.calls[0][0];
        expect(sendArg).toBeInstanceOf(FormData);
        expect(sendArg.get("file")).toBeTruthy();
        expect(sendArg.get("folder")).toBe("items");
    });

    it("4b. onFileProcessed получает серверный URL в поле preview", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));
        const serverUrl = "/uploads/items/uuid-abc.webp";

        currentXhrInstance.send = vi.fn(() =>
            currentXhrInstance.simulateSuccess(serverUrl)
        );

        const onFileProcessed = vi.fn();
        await act(async () => {
            await result.current.processFiles(
                [makeFile("check-url.jpg", 100 * 1024)],
                0,
                onFileProcessed
            );
        });

        expect(onFileProcessed).toHaveBeenCalledOnce();
        expect(onFileProcessed.mock.calls[0][0].preview).toBe(serverUrl);
    });

    it("4c. uploadStates сбрасываются через ~1с после завершения", async () => {
        vi.useFakeTimers();

        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));
        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateSuccess());

        await act(async () => {
            await result.current.processFiles([makeFile("timer.jpg", 100 * 1024)], 0);
        });

        // Форсируем таймер очистки состояний
        await act(async () => {
            vi.advanceTimersByTime(1100);
        });

        expect(Object.keys(result.current.uploadStates)).toHaveLength(0);

        vi.useRealTimers();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // 5. ОТМЕНА ЗАГРУЗКИ (cancelUpload)
    // ─────────────────────────────────────────────────────────────────────────

    it("5a. cancelUpload вызывает xhr.abort() на активном запросе", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        // XHR «висит» — не завершается сам по себе
        currentXhrInstance.send = vi.fn();

        // Запускаем processFiles без await — он ждёт XHR
        let processingPromise: Promise<unknown[]>;
        act(() => {
            processingPromise = result.current.processFiles([makeFile("cancel.jpg", 100 * 1024)], 0);
        });

        // Tick: дать хуку дойти до xhr.send
        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        // Проверяем, что XHR начал выполняться
        expect(currentXhrInstance.send).toHaveBeenCalled();

        // Отменяем
        act(() => {
            result.current.cancelUpload(0);
        });

        expect(currentXhrInstance.abort).toHaveBeenCalledOnce();
    });

    it("5b. после cancelUpload uploadStates[index] удаляется немедленно", async () => {
        const { result } = renderHook(() => useImageUploader({ maxOriginalSizeMB: 10 }));

        currentXhrInstance.send = vi.fn(); // зависший XHR

        act(() => {
            result.current.processFiles([makeFile("cancel2.jpg", 100 * 1024)], 0);
        });

        await act(async () => {
            await new Promise((r) => setTimeout(r, 50));
        });

        // uploadStates[0] должен быть в статусе загрузки
        expect(result.current.uploadStates[0]?.uploading).toBe(true);

        // Отменяем
        act(() => {
            result.current.cancelUpload(0);
        });

        // Запись должна исчезнуть из uploadStates
        expect(result.current.uploadStates[0]).toBeUndefined();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Граничные случаи
    // ─────────────────────────────────────────────────────────────────────────

    it("edge: возвращает [] при null FileList", async () => {
        const { result } = renderHook(() => useImageUploader());
        let r: unknown[] = [];
        await act(async () => {
            r = await result.current.processFiles(null, 0);
        });
        expect(r).toHaveLength(0);
    });

    it("edge: не превышает maxFiles лимит", async () => {
        const { result } = renderHook(() =>
            useImageUploader({ maxFiles: 2, maxOriginalSizeMB: 10 })
        );

        currentXhrInstance.send = vi.fn(() => currentXhrInstance.simulateSuccess());

        const files = [
            makeFile("a.jpg", 50 * 1024),
            makeFile("b.jpg", 60 * 1024),
            makeFile("c.jpg", 70 * 1024), // третий должен быть отброшен
        ];

        let total = 0;
        await act(async () => {
            const processed = await result.current.processFiles(files, 0);
            total = processed.length;
        });

        expect(total).toBeLessThanOrEqual(2);
    });
});
