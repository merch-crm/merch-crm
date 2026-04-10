"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { StatsPeriod } from "../types";

interface UsePeriodFilterOptions {
 /** Значение по умолчанию */
 defaultPeriod?: StatsPeriod;
 /** Синхронизировать с URL */
 syncWithUrl?: boolean;
 /** Параметр URL */
 urlParam?: string;
}

interface UsePeriodFilterReturn {
 /** Текущий период */
 period: StatsPeriod;
 /** Установить период */
 setPeriod: (period: StatsPeriod) => void;
 /** Сбросить на значение по умолчанию */
 resetPeriod: () => void;
}

export function usePeriodFilter(
 options: UsePeriodFilterOptions = {}
): UsePeriodFilterReturn {
 const {
  defaultPeriod = "week",
  syncWithUrl = false,
  urlParam = "period",
 } = options;

 const searchParams = useSearchParams();
 const router = useRouter();
 const pathname = usePathname();

 // Получаем начальное значение из URL или используем default
 const initialPeriod = syncWithUrl
  ? (searchParams.get(urlParam) as StatsPeriod) || defaultPeriod
  : defaultPeriod;

 const [period, setLocalPeriod] = useState<StatsPeriod>(initialPeriod);

 const setPeriod = useCallback(
  (newPeriod: StatsPeriod) => {
   setLocalPeriod(newPeriod);

   if (syncWithUrl) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(urlParam, newPeriod);
    router.replace(`${pathname}?${params.toString()}`);
   }
  },
  [syncWithUrl, searchParams, router, pathname, urlParam]
 );

 const resetPeriod = useCallback(() => {
  setPeriod(defaultPeriod);
 }, [defaultPeriod, setPeriod]);

 return {
  period,
  setPeriod,
  resetPeriod,
 };
}
