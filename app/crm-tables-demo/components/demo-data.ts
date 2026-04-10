"use client";

export const operations = [
  { id: 1, type: "Перемещение", typeIcon: "swap", change: "+1", changeType: "positive", warehouse: "Леонид → Одежда", reason: "aaaaaa", author: "Администратор", date: "06.03.26", time: "09:19" },
  { id: 2, type: "Перемещение", typeIcon: "swap", change: "+4", changeType: "positive", warehouse: "Леонид → Леонид", reason: "Перемещение", author: "Администратор", date: "06.03.26", time: "09:08" },
  { id: 3, type: "Корректировка", typeIcon: "refresh", change: "-1", changeType: "negative", warehouse: "Леонид", reason: "поставка", author: "Администратор", date: "06.03.26", time: "08:57" },
  { id: 4, type: "Корректировка", typeIcon: "refresh", change: "+5", changeType: "positive", warehouse: "Леонид", reason: "поставка", author: "Администратор", date: "06.03.26", time: "08:57" },
  { id: 5, type: "Расход", typeIcon: "expense", change: "-1", changeType: "negative", warehouse: "Леонид", reason: "поставка", author: "Администратор", date: "06.03.26", time: "08:57" },
  { id: 6, type: "Приход", typeIcon: "income", change: "+9", changeType: "positive", warehouse: "Леонид", reason: "поставка", author: "Администратор", date: "06.03.26", time: "08:56" },
  { id: 7, type: "Корректировка", typeIcon: "refresh", change: "-14", changeType: "negative", warehouse: "Леонид", reason: "ревизия", author: "Администратор", date: "06.03.26", time: "08:11" },
];
