"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { checkClientDuplicates } from "../actions/core.actions";

interface DuplicateClient {
  id: string;
  firstName: string;
  lastName: string;
  patronymic?: string | null;
  company?: string | null;
  phone: string;
  email?: string | null;
  clientType?: "b2c" | "b2b" | null;
}

interface UseDuplicateCheckOptions {
  /** ID текущего клиента (при редактировании) — исключается из результатов */
  excludeClientId?: string;
  /** Задержка перед проверкой (мс) */
  debounceMs?: number;
  /** Минимальная длина телефона для проверки */
  minPhoneLength?: number;
  /** Минимальная длина имени для проверки */
  minNameLength?: number;
}

interface CheckData {
  phone?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  company?: string;
}

export function useDuplicateCheck(options: UseDuplicateCheckOptions = {}) {
  const {
    excludeClientId,
    debounceMs = 500,
    minPhoneLength = 6,
    minNameLength = 2,
  } = options;

  const [duplicates, setDuplicates] = useState<DuplicateClient[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<string>("");

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const checkDuplicates = useCallback(async (data: CheckData) => {
    // Создаем ключ для дедупликации запросов
    const checkKey = JSON.stringify(data);
    if (checkKey === lastCheckRef.current) {
      return;
    }

    // Проверяем, достаточно ли данных для поиска
    const phoneDigits = data.phone?.replace(/\D/g, "") || "";
    const hasEnoughPhone = phoneDigits.length >= minPhoneLength;
    const hasEnoughName =
      (data.lastName?.trim().length || 0) >= minNameLength &&
      (data.firstName?.trim().length || 0) >= minNameLength;
    const hasEnoughEmail = (data.email?.trim().length || 0) > 3 && data.email?.includes("@");
    const hasEnoughCompany = (data.company?.trim().length || 0) >= 3;

    if (!hasEnoughPhone && !hasEnoughName && !hasEnoughEmail && !hasEnoughCompany) {
      setDuplicates([]);
      return;
    }

    // Отменяем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Запускаем новый таймер
    timeoutRef.current = setTimeout(async () => {
      lastCheckRef.current = checkKey;
      setIsChecking(true);
      setIsDismissed(false);

      try {
        const result = await checkClientDuplicates({
          phone: hasEnoughPhone ? data.phone : undefined,
          email: hasEnoughEmail ? data.email : undefined,
          lastName: hasEnoughName ? data.lastName : undefined,
          firstName: hasEnoughName ? data.firstName : undefined,
          company: hasEnoughCompany ? data.company : undefined,
        });

        if (result.success && result.data) {
          const safeData = result.data || [];
          // Фильтруем текущего клиента (при редактировании)
          const filtered = excludeClientId
            ? safeData.filter(d => d.id !== excludeClientId)
            : safeData;

          setDuplicates(filtered.map(d => ({
            id: d.id,
            firstName: d.firstName || "",
            lastName: d.lastName || "",
            patronymic: d.patronymic,
            company: d.company,
            phone: d.phone,
            email: d.email,
            clientType: d.clientType as "b2c" | "b2b" | null,
          })));
        } else {
          setDuplicates([]);
        }
      } catch (error) {
        console.error("Error checking duplicates:", error);
        setDuplicates([]);
      } finally {
        setIsChecking(false);
      }
    }, debounceMs);
  }, [excludeClientId, debounceMs, minPhoneLength, minNameLength]);

  const clearDuplicates = useCallback(() => {
    setDuplicates([]);
    setIsDismissed(false);
    lastCheckRef.current = "";
  }, []);

  const dismissDuplicates = useCallback(() => {
    setIsDismissed(true);
  }, []);

  return {
    duplicates: isDismissed ? [] : duplicates,
    allDuplicates: duplicates, // Всегда возвращает найденные дубликаты
    isChecking,
    isDismissed,
    checkDuplicates,
    clearDuplicates,
    dismissDuplicates,
    hasDuplicates: duplicates.length > 0,
  };
}
