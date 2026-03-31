/**
 * @fileoverview Типы данных для модуля заказов
 * @module types/orders
 */

import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { orders, orderItems } from "@/lib/schema";

/**
 * Статус заказа в системе
 *
 * @description
 * Жизненный цикл заказа:
 * new → design → production → done → shipped → completed
 *
 * В любой момент заказ может быть отменён (cancelled) или архивирован (archived)
 */
export type OrderStatus = "new" | "design" | "production" | "done" | "shipped" | "cancelled" | "completed" | "archived";

/**
 * Категория заказа
 *
 * @property print - Печать на одежде (DTF, шелкография)
 * @property embroidery - Вышивка
 * @property merch - Готовый мерч без нанесения
 * @property other - Прочие услуги
 */
export type OrderCategory = "print" | "embroidery" | "merch" | "other";

/**
 * Приоритет заказа
 *
 * @property low - Низкий приоритет, без срочности
 * @property normal - Стандартный приоритет (по умолчанию)
 * @property high - Высокий приоритет, требует внимания
 */
export type OrderPriority = "low" | "normal" | "high";

/**
 * Заказ из базы данных
 *
 * @description Полная модель заказа со всеми полями
 */
export type Order = InferSelectModel<typeof orders>;

/**
 * Данные для создания заказа
 *
 * @description Поля, необходимые для создания нового заказа
 */
export type NewOrder = InferInsertModel<typeof orders>;

/**
 * Позиция заказа из базы данных
 */
export type OrderItem = InferSelectModel<typeof orderItems>;

/**
 * Заказ с загруженными связями
 *
 * @description Используется на странице детального просмотра заказа
 *
 * @property client - Клиент, оформивший заказ
 * @property items - Позиции заказа
 * @property creator - Сотрудник, создавший заказ
 * @property payments - История платежей
 * @property attachments - Прикреплённые файлы (макеты, ТЗ)
 */
export interface OrderWithRelations extends Order {
  client: {
    id: string;
    name: string | null;
    firstName: string;
    lastName: string;
    phone: string;
    clientType: "b2b" | "b2c";
    company: string | null;
    email?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    address?: string | null;
  };
  items: Array<OrderItem & {
    inventory: {
      id: string;
      name: string;
      sku?: string | null;
      image?: string | null;
    } | null;
  }>;
  creator: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  payments: Array<{
    id: string;
    amount: string;
    method: string;
    isAdvance: boolean;
    comment: string | null;
    createdAt: Date;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number | null;
    contentType: string | null;
    createdAt: Date;
  }>;
  promocode: {
    id: string;
    code: string;
    discountType: string;
    discountValue: string;
  } | null;
}

/**
 * Параметры фильтрации списка заказов
 *
 * @property page - Номер страницы (начиная с 1)
 * @property limit - Количество записей на странице
 * @property status - Фильтр по статусу
 * @property search - Поиск по номеру заказа или имени клиента
 * @property dateFrom - Начало периода
 * @property dateTo - Конец периода
 * @property clientId - Фильтр по конкретному клиенту
 * @property isArchived - Показывать архивные заказы
 */
export interface GetOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  from?: Date; // Alias for dateFrom
  to?: Date;   // Alias for dateTo
  clientId?: string;
  isArchived?: boolean;
  showArchived?: boolean; // Alias for isArchived
}

/**
 * Результат запроса списка заказов
 *
 * @property orders - Массив заказов
 * @property pagination - Информация о пагинации
 */
export interface GetOrdersResult {
  orders: OrderWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Данные для создания нового заказа
 *
 * @property clientId - UUID клиента
 * @property items - Массив позиций заказа
 * @property deadline - Срок выполнения (опционально)
 * @property isUrgent - Флаг срочности
 * @property priority - Приоритет заказа
 * @property promocodeId - UUID применённого промокода
 * @property advanceAmount - Сумма предоплаты
 */
export interface CreateOrderInput {
  clientId: string;
  items: Array<{
    description: string;
    quantity: number;
    price: string;
    inventoryId?: string;
  }>;
  deadline?: Date;
  isUrgent?: boolean;
  priority?: OrderPriority;
  promocodeId?: string;
  advanceAmount?: string;
}
