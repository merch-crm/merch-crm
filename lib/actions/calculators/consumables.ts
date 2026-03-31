/**
 * @fileoverview Server Actions для работы с настройками расходников
 * @module lib/actions/calculators/consumables
 * @requires drizzle
 * @audit Создан 2026-03-25
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
  ConsumablesConfig,
  DEFAULT_CONSUMABLES,
} from '@/lib/types/calculators';
import { ActionResult, ok, err } from '@/lib/types';


/**
 * Получение конфигурации расходников для калькулятора
 * @param calculatorType - Тип калькулятора
 * @returns Конфигурация расходников
 */
export async function getConsumablesConfig(
  calculatorType: CalculatorType
): Promise<ActionResult<ConsumablesConfig>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return err('Пользователь не авторизован');
    }

    const result = await db.query.calculatorDefaults.findFirst({
      where: eq(calculatorDefaults.calculatorType, calculatorType),
    });

    if (result && result.consumablesConfig) {
      return ok(result.consumablesConfig as ConsumablesConfig);
    }

    // Возвращаем значения по умолчанию
    return ok(DEFAULT_CONSUMABLES[calculatorType]);
  } catch (error) {
    console.error('Ошибка получения конфигурации расходников:', error);
    return err('Не удалось загрузить настройки расходников');
  }
}

/**
 * Сохранение конфигурации расходников
 * @param calculatorType - Тип калькулятора
 * @param config - Новая конфигурация
 * @returns Результат операции
 */
export async function saveConsumablesConfig(
  calculatorType: CalculatorType,
  config: ConsumablesConfig
): Promise<ActionResult<ConsumablesConfig>> {
  return withAuth(async () => {
    try {
      // Получаем текущего пользователя внутри callback
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return err('Пользователь не авторизован');
      }

      // Проверяем существование записи
      const existing = await db.query.calculatorDefaults.findFirst({
        where: eq(calculatorDefaults.calculatorType, calculatorType),
      });

      if (existing) {
        // Обновляем существующую
        await db
          .update(calculatorDefaults)
          .set({
            consumablesConfig: config,
            updatedAt: new Date(),
          })
          .where(eq(calculatorDefaults.calculatorType, calculatorType));
      } else {
        // Создаём новую
        await db.insert(calculatorDefaults).values({
          userId: currentUser.id,
          calculatorType,
          consumablesConfig: config,
        });
      }

      revalidatePath('/dashboard/production/calculator');

      return ok(config);
    } catch (error) {
      console.error('Ошибка сохранения конфигурации расходников:', error);
      return err('Не удалось сохранить настройки расходников');
    }
  }, { errorPath: 'saveConsumablesConfig' });
}

/**
 * Сброс конфигурации расходников к значениям по умолчанию
 * @param calculatorType - Тип калькулятора
 * @returns Результат операции
 */
export async function resetConsumablesConfig(
  calculatorType: CalculatorType
): Promise<ActionResult<ConsumablesConfig>> {
  return withAuth(async () => {
    try {
      const defaultConfig = DEFAULT_CONSUMABLES[calculatorType];

      // Проверяем существование записи
      const existing = await db.query.calculatorDefaults.findFirst({
        where: eq(calculatorDefaults.calculatorType, calculatorType),
      });

      if (existing) {
        await db
          .update(calculatorDefaults)
          .set({
            consumablesConfig: defaultConfig,
            updatedAt: new Date(),
          })
          .where(eq(calculatorDefaults.calculatorType, calculatorType));
      }

      revalidatePath('/dashboard/production/calculators');

      return ok(defaultConfig);
    } catch (error) {
      console.error('Ошибка сброса конфигурации расходников:', error);
      return err('Не удалось сбросить настройки расходников');
    }
  }, { errorPath: 'resetConsumablesConfig' });
}
