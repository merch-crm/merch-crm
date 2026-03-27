import { db } from '@/lib/db';
import { placementItems, placementAreas, calculatorDefaults, users } from '../schema';
import { DEFAULT_CONSUMABLES, type CalculatorType } from '@/lib/types/calculators';
import { eq } from 'drizzle-orm';

/**
 * Данные для сидирования изделий (в мм, т.к. схема использует мм)
 */
const INITIAL_PLACEMENT_ITEMS = [
  {
    type: 't-shirt',
    name: 'Футболка',
    description: 'Классическая футболка из хлопка',
    areas: [
      { name: 'Грудь (A4)', code: 'front-a4', maxWidthMm: 210, maxHeightMm: 300, workPrice: '150' },
      { name: 'Грудь (A3)', code: 'front-a3', maxWidthMm: 300, maxHeightMm: 420, workPrice: '200' },
      { name: 'Спина (A3)', code: 'back-a3', maxWidthMm: 300, maxHeightMm: 420, workPrice: '200' },
      { name: 'Рукав', code: 'sleeve', maxWidthMm: 100, maxHeightMm: 100, workPrice: '100' },
    ]
  },
  {
    type: 'hoodie',
    name: 'Худи / Свитшот',
    description: 'Плотная одежда с начёсом или без',
    areas: [
      { name: 'Грудь (A4)', code: 'front-a4', maxWidthMm: 210, maxHeightMm: 300, workPrice: '180' },
      { name: 'Грудь (A3)', code: 'front-a3', maxWidthMm: 300, maxHeightMm: 420, workPrice: '250' },
      { name: 'Спина (A3)', code: 'back-a3', maxWidthMm: 300, maxHeightMm: 420, workPrice: '250' },
      { name: 'Карман-кенгуру', code: 'pocket', maxWidthMm: 250, maxHeightMm: 150, workPrice: '200' },
    ]
  },
  {
    type: 'shopper',
    name: 'Шоппер',
    description: 'Эко-сумка из ткани',
    areas: [
      { name: 'Основная сторона (A4)', code: 'side-a4', maxWidthMm: 210, maxHeightMm: 300, workPrice: '120' },
      { name: 'Основная сторона (A3)', code: 'side-a3', maxWidthMm: 300, maxHeightMm: 400, workPrice: '180' },
    ]
  },
  {
    type: 'cap',
    name: 'Кепка / Бейсболка',
    description: 'Головные уборы',
    areas: [
      { name: 'Лоб', code: 'front', maxWidthMm: 120, maxHeightMm: 60, workPrice: '150' },
      { name: 'Бок', code: 'side', maxWidthMm: 60, maxHeightMm: 50, workPrice: '120' },
    ]
  }
];

/**
 * Получить ID системного пользователя для seed
 */
async function getSystemUserId(): Promise<string> {
  const [systemUser] = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.isSystem, true))
    .limit(1);

  if (!systemUser) {
    throw new Error('Системный пользователь не найден. Сначала запустите seed пользователей.');
  }

  return systemUser.id;
}

/**
 * Основная функция сидирования калькуляторов
 */
export async function seedCalculators(): Promise<void> {
  console.log('🚀 Начинаю сидирование модуля калькуляторов...');

  try {
    await seedPlacementItems();
    await seedCalculatorDefaults();
    console.log('✅ Модуль калькуляторов успешно сидирован');
  } catch (error) {
    console.error('❌ Ошибка при сидировании калькуляторов:', error);
    throw error;
  }
}

/**
 * Сидирование изделий и областей нанесения
 */
export async function seedPlacementItems(): Promise<void> {
  console.log('🌱 Сидирование изделий для нанесения...');

  const createdBy = await getSystemUserId();

  for (const item of INITIAL_PLACEMENT_ITEMS) {
    // Создаём изделие
    const [newItem] = await db.insert(placementItems).values({
      type: item.type,
      name: item.name,
      description: item.description,
      isActive: true,
      sortOrder: INITIAL_PLACEMENT_ITEMS.indexOf(item),
      createdBy,
    }).onConflictDoNothing().returning({ id: placementItems.id });

    if (!newItem) continue; // пропускаем если уже существует

    // Создаём области нанесения
    for (const area of item.areas) {
      await db.insert(placementAreas).values({
        productId: newItem.id,
        name: area.name,
        code: area.code,
        maxWidthMm: area.maxWidthMm,
        maxHeightMm: area.maxHeightMm,
        workPrice: area.workPrice,
        isActive: true,
        sortOrder: item.areas.indexOf(area),
        createdBy,
      }).onConflictDoNothing();
    }
  }

  console.log(`✅ Создано ${INITIAL_PLACEMENT_ITEMS.length} изделий`);
}

/**
 * Сидирование дефолтных настроек калькуляторов
 */
export async function seedCalculatorDefaults(): Promise<void> {
  console.log('🌱 Сидирование дефолтов калькуляторов...');

  const userId = await getSystemUserId();

  const calculatorTypes: CalculatorType[] = [
    'dtf', 'uv-dtf', 'dtg', 'sublimation', 'embroidery', 'silkscreen', 'thermotransfer'
  ];

  for (const type of calculatorTypes) {
    const consumables = DEFAULT_CONSUMABLES[type];

    await db.insert(calculatorDefaults).values({
      calculatorType: type,
      consumablesConfig: consumables,
      userId,
    }).onConflictDoUpdate({
      target: calculatorDefaults.calculatorType,
      set: { consumablesConfig: consumables },
    });
  }

  console.log(`✅ Создано ${calculatorTypes.length} конфигураций`);
}
