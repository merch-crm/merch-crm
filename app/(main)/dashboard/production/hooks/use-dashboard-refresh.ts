"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseDashboardRefreshOptions {
 /** Интервал автообновления в миллисекундах (0 = отключено) */
 autoRefreshInterval?: number;
 /** Callback при обновлении */
 onRefresh?: () => void;
}

interface UseDashboardRefreshReturn {
 /** Выполняется ли обновление */
 isRefreshing: boolean;
 /** Время последнего обновления */
 lastRefreshedAt: Date | null;
 /** Вручную запустить обновление */
 refresh: () => void;
 /** Включить/выключить автообновление */
 toggleAutoRefresh: () => void;
 /** Включено ли автообновление */
 autoRefreshEnabled: boolean;
}

export function useDashboardRefresh(
 options: UseDashboardRefreshOptions = {}
): UseDashboardRefreshReturn {
 const { autoRefreshInterval = 0, onRefresh } = options;
 const router = useRouter();

 const [isRefreshing, setIsRefreshing] = useState(false);
 const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
 const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefreshInterval > 0);

 const refresh = useCallback(() => {
  setIsRefreshing(true);
  
  // Обновляем страницу через router
  router.refresh();
  
  // Имитируем задержку для UI
  setTimeout(() => {
   setIsRefreshing(false);
   setLastRefreshedAt(new Date());
   onRefresh?.();
  }, 500);
 }, [router, onRefresh]);

 const toggleAutoRefresh = useCallback(() => {
  setAutoRefreshEnabled((prev) => !prev);
 }, []);

 // Автообновление
 useEffect(() => {
  if (!autoRefreshEnabled || autoRefreshInterval <= 0) return;

  const interval = setInterval(() => {
   refresh();
  }, autoRefreshInterval);

  return () => clearInterval(interval);
 }, [autoRefreshEnabled, autoRefreshInterval, refresh]);

 return {
  isRefreshing,
  lastRefreshedAt,
  refresh,
  toggleAutoRefresh,
  autoRefreshEnabled,
 };
}
