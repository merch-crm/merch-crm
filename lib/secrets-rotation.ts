/**
 * Обеспечивает плавную смену AUTH_SECRET без разлогина пользователей
 */

import { createHmac } from "crypto";
import { safeCompare } from "./crypto";

interface SecretConfig {
  /** Текущий активный секрет */
  current: string;
  /** Предыдущий секрет (для валидации старых токенов) */
  previous?: string;
}

/**
 * Получает конфигурацию секретов из переменных окружения
 */
export function getSecretConfig(): SecretConfig {
  const current = process.env.AUTH_SECRET;
  const previous = process.env.AUTH_SECRET_PREVIOUS;

  if (!current) {
    throw new Error("AUTH_SECRET не установлен");
  }

  if (current.length < 32) {
    throw new Error("AUTH_SECRET должен быть минимум 32 символа");
  }

  return {
    current,
    previous: previous && previous.length >= 32 ? previous : undefined,
  };
}

/**
 * Подписывает данные текущим секретом
 */
export function signData(data: string): string {
  const { current } = getSecretConfig();
  return createHmac("sha256", current).update(data).digest("hex");
}

/**
 * Проверяет подпись с учётом ротации (проверяет оба секрета)
 */
export function verifySignature(data: string, signature: string): boolean {
  const { current, previous } = getSecretConfig();

  // Проверяем текущим секретом
  const currentSignature = createHmac("sha256", current).update(data).digest("hex");
  
  if (safeCompare(signature, currentSignature)) {
    return true;
  }

  // Если есть предыдущий секрет — проверяем им тоже
  if (previous) {
    const previousSignature = createHmac("sha256", previous).update(data).digest("hex");
    return safeCompare(signature, previousSignature);
  }

  return false;
}



/**
 * Проверяет, нужна ли ротация (есть старый секрет в использовании)
 */
export function isRotationInProgress(): boolean {
  const { previous } = getSecretConfig();
  return !!previous;
}

/**
 * Информация о статусе ротации для админ-панели
 */
export function getRotationStatus(): {
  inProgress: boolean;
  recommendation: string;
} {
  const inProgress = isRotationInProgress();

  return {
    inProgress,
    recommendation: inProgress
      ? "Ротация активна. Удалите AUTH_SECRET_PREVIOUS через 7 дней после смены."
      : "Ротация не требуется. Рекомендуется менять секрет каждые 90 дней.",
  };
}
