"use client";

/**
 * CSRF Provider — передаёт токен во все Server Actions
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface CsrfContextType {
  token: string | null;
  refreshToken: () => Promise<void>;
}

const CsrfContext = createContext<CsrfContextType>({
  token: null,
  refreshToken: async () => {},
});

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/csrf", { method: "GET" });
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Ошибка получения CSRF-токена:", error);
    }
  }, []);

  useEffect(() => {
    refreshToken();
  }, [refreshToken]);

  return (
    <CsrfContext.Provider value={{ token, refreshToken }}>
      {children}
    </CsrfContext.Provider>
  );
}

export function useCsrf() {
  return useContext(CsrfContext);
}

/**
 * Хук для вызова Server Actions с CSRF-токеном
 */
export function useSafeAction<TInput, TOutput>(
  action: (data: TInput) => Promise<{ success: boolean; data?: TOutput; error?: string }>
) {
  const { token, refreshToken } = useCsrf();

  const execute = useCallback(
    async (data: TInput) => {
      // Пытаемся получить токен если его нет
      if (!token) {
        await refreshToken();
      }

      // Устанавливаем CSRF-токен в заголовок через fetch interceptor
      // Это позволяет Next.js Server Actions видеть заголовок
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        const headers = new Headers(init?.headers);
        if (token) {
          headers.set("x-csrf-token", token);
        }
        return originalFetch(input, { ...init, headers });
      };

      try {
        const result = await action(data);
        
        // Если токен невалидный — обновляем
        if (!result.success && result.error?.includes("CSRF")) {
          await refreshToken();
        }
        
        return result;
      } finally {
        window.fetch = originalFetch;
      }
    },
    [action, token, refreshToken]
  );

  return { execute };
}
