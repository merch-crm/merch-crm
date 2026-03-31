/**
 * @fileoverview Server Actions для работы с общими настройками калькуляторов
 * @module lib/actions/calculators/settings
 * @requires drizzle
 */

'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { calculatorDefaults } from '@/lib/schema/calculator-defaults';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/action-helpers';
import { getCurrentUser } from '@/lib/auth/session';
import {
  CalculatorType,
  GlobalCalculatorSettings,
  getDefaultGlobalSettings,
  ConsumablesConfig,
  UrgencyConfig,
  MarginConfig,
  PrintConfig,
} from '@/lib/types/calculators';
import { ActionResult, ok, err } from '@/lib/types';

/**
 * Получение всех глобальных настроек калькулятора
 * @param calculatorType - Тип калькулятора
 * @returns Глобальные настройки
 */
export async function getGlobalSettings(
  calculatorType: CalculatorType
): Promise<ActionResult<GlobalCalculatorSettings>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return err('Пользователь не авторизован');
    }

    const result = await db.query.calculatorDefaults.findFirst({
      where: eq(calculatorDefaults.calculatorType, calculatorType),
    });

    const defaultSettings = getDefaultGlobalSettings(calculatorType);

    if (result) {
      return ok({
        calculatorType,
        consumablesConfig: (result.consumablesConfig || defaultSettings.consumablesConfig) as ConsumablesConfig,
        urgencyConfig: (result.urgencyConfig || defaultSettings.urgencyConfig) as UrgencyConfig,
        marginConfig: (result.marginConfig || defaultSettings.marginConfig) as MarginConfig,
        printConfig: (result.printConfig || defaultSettings.printConfig) as PrintConfig,
      });
    }

    // Возвращаем значения по умолчанию, если записи нет
    return ok(defaultSettings);
  } catch (error) {
    console.error('Ошибка получения общих настроек калькулятора:', error);
    return err('Не удалось загрузить глобальные настройки');
  }
}

/**
 * Сохранение общих настроек калькулятора
 * @param calculatorType - Тип калькулятора
 * @param settings - Новые настройки
 * @returns Результат операции
 */
export async function saveGlobalSettings(
  calculatorType: CalculatorType,
  settings: Omit<GlobalCalculatorSettings, 'calculatorType'>
): Promise<ActionResult<GlobalCalculatorSettings>> {
  return withAuth(async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return err('Пользователь не авторизован');
      }

      const existing = await db.query.calculatorDefaults.findFirst({
        where: eq(calculatorDefaults.calculatorType, calculatorType),
      });

      if (existing) {
        // Обновляем существующую
        await db
          .update(calculatorDefaults)
          .set({
            consumablesConfig: settings.consumablesConfig,
            urgencyConfig: settings.urgencyConfig,
            marginConfig: settings.marginConfig,
            printConfig: settings.printConfig,
            updatedAt: new Date(),
          })
          .where(eq(calculatorDefaults.calculatorType, calculatorType));
      } else {
        // Создаём новую
        await db.insert(calculatorDefaults).values({
          userId: currentUser.id,
          calculatorType,
          consumablesConfig: settings.consumablesConfig,
          urgencyConfig: settings.urgencyConfig,
          marginConfig: settings.marginConfig,
          printConfig: settings.printConfig,
        });
      }

      // Сброс кэша для всех калькуляторов
      revalidatePath('/dashboard/production/calculators');

      return ok({ calculatorType, ...settings });
    } catch (error) {
      console.error('Ошибка сохранения общих настроек калькулятора:', error);
      return err('Не удалось сохранить глобальные настройки');
    }
  }, { errorPath: 'saveGlobalSettings' });
}

/**
 * Сброс общих настроек калькулятора к значениям по умолчанию
 * @param calculatorType - Тип калькулятора
 * @returns Результат операции
 */
export async function resetGlobalSettings(
  calculatorType: CalculatorType
): Promise<ActionResult<GlobalCalculatorSettings>> {
  return withAuth(async () => {
    try {
      const defaultSettings = getDefaultGlobalSettings(calculatorType);

      const existing = await db.query.calculatorDefaults.findFirst({
        where: eq(calculatorDefaults.calculatorType, calculatorType),
      });

      if (existing) {
        await db
          .update(calculatorDefaults)
          .set({
            consumablesConfig: defaultSettings.consumablesConfig,
            urgencyConfig: defaultSettings.urgencyConfig,
            marginConfig: defaultSettings.marginConfig,
            printConfig: defaultSettings.printConfig,
            updatedAt: new Date(),
          })
          .where(eq(calculatorDefaults.calculatorType, calculatorType));
      }

      revalidatePath('/dashboard/production/calculators');

      return ok(defaultSettings);
    } catch (error) {
      console.error('Ошибка сброса общих настроек калькулятора:', error);
      return err('Не удалось сбросить глобальные настройки');
    }
  }, { errorPath: 'resetGlobalSettings' });
}
