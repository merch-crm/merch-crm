"use client";

import { useState, useCallback, useTransition } from "react";

interface ServerActionState<T> {
    /** Данные результата */
    data: T | null;
    /** Текст ошибки */
    error: string | null;
    /** Идёт выполнение */
    loading: boolean;
    /** Был ли хотя бы один вызов */
    called: boolean;
}

type ActionResult<T = unknown> = { success: true; data?: T } | { success: false; error: string };

/**
 * Обёртка над server actions с loading/error/data состояниями.
 * Использует useTransition для неблокирующих обновлений.
 *
 * @example
 * const { execute, loading, error, data } = useServerAction(createOrder);
 *
 * <button onClick={() => execute(formData)} disabled={loading}>
 *   {loading ? "Создание..." : "Создать"}
 * </button>
 * {error && <p className="text-red-500">{error}</p>}
 */
export function useServerAction<TInput, TData = unknown>(
    action: (input: TInput) => Promise<ActionResult<TData>>,
    options?: {
        onSuccess?: (data?: TData) => void;
        onError?: (error: string) => void;
    }
) {
    const [state, setState] = useState<ServerActionState<TData>>({
        data: null,
        error: null,
        loading: false,
        called: false,
    });
    const [, startTransition] = useTransition();

    const execute = useCallback(
        (input: TInput) => {
            setState(prev => ({ ...prev, loading: true, error: null, called: true }));

            startTransition(async () => {
                try {
                    const result = await action(input);

                    if (result.success) {
                        setState({ data: result.data ?? null, error: null, loading: false, called: true });
                        options?.onSuccess?.(result.data);
                    } else {
                        setState(prev => ({ ...prev, error: result.error, loading: false }));
                        options?.onError?.(result.error);
                    }
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка";
                    setState(prev => ({ ...prev, error: errorMessage, loading: false }));
                    options?.onError?.(errorMessage);
                }
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [action]
    );

    const reset = useCallback(() => {
        setState({ data: null, error: null, loading: false, called: false });
    }, []);

    return {
        execute,
        reset,
        ...state,
    };
}
