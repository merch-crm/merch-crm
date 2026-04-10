export function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "week":
      start.setDate(end.getDate() - 7);
      break;
    case "month":
      start.setMonth(end.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(end.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(end.getFullYear() - 1);
      break;
    case "all":
    default:
      start.setFullYear(2020, 0, 1);
  }

  return { start, end };
}

export const acquisitionSourceLabels: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  vk: "ВКонтакте",
  website: "Сайт",
  referral: "Рекомендация",
  exhibition: "Выставка",
  ads: "Реклама",
  other: "Другое",
  "": "Не указан",
};

export const acquisitionSourceIcons: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Send",
  whatsapp: "MessageCircle",
  vk: "Globe",
  website: "Globe",
  referral: "Users",
  exhibition: "Calendar",
  ads: "Megaphone",
  other: "HelpCircle",
  "": "HelpCircle",
};
