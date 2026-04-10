export interface ExportColumn {
  key: string;
  label: string;
  category: "basic" | "contacts" | "analytics" | "meta";
  default: boolean;
}

export const EXPORT_COLUMNS: ExportColumn[] = [
  // Основные
  { key: "id", label: "ID", category: "basic", default: false },
  { key: "lastName", label: "Фамилия", category: "basic", default: true },
  { key: "firstName", label: "Имя", category: "basic", default: true },
  { key: "patronymic", label: "Отчество", category: "basic", default: true },
  { key: "clientType", label: "Тип клиента", category: "basic", default: true },
  { key: "company", label: "Организация", category: "basic", default: true },

  // Контакты
  { key: "phone", label: "Телефон", category: "contacts", default: true },
  { key: "email", label: "Email", category: "contacts", default: true },
  { key: "telegram", label: "Telegram", category: "contacts", default: false },
  { key: "instagram", label: "Instagram", category: "contacts", default: false },
  { key: "city", label: "Город", category: "contacts", default: true },
  { key: "address", label: "Адрес", category: "contacts", default: false },

  // Аналитика
  { key: "totalOrdersCount", label: "Кол-во заказов", category: "analytics", default: true },
  { key: "totalOrdersAmount", label: "Сумма заказов", category: "analytics", default: true },
  { key: "averageCheck", label: "Средний чек", category: "analytics", default: true },
  { key: "lastOrderAt", label: "Последний заказ", category: "analytics", default: true },
  { key: "daysSinceLastOrder", label: "Дней без заказа", category: "analytics", default: false },
  { key: "loyaltyLevel", label: "Уровень лояльности", category: "analytics", default: true },
  { key: "rfmSegment", label: "RFM-сегмент", category: "analytics", default: false },
  { key: "funnelStage", label: "Этап воронки", category: "analytics", default: true },

  // Мета
  { key: "acquisitionSource", label: "Источник", category: "meta", default: true },
  { key: "managerName", label: "Менеджер", category: "meta", default: true },
  { key: "createdAt", label: "Дата создания", category: "meta", default: false },
  { key: "comments", label: "Комментарии", category: "meta", default: false },
];
