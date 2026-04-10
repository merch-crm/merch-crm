// Утилиты для расчёта временных периодов (НЕ server action)
import {
 startOfDay,
 startOfWeek,
 startOfMonth,
 subDays,
} from "date-fns";
import type { StatsPeriod } from "../types";

/** Возвращает диапазон дат для заданного периода */
export function getPeriodRange(period: StatsPeriod): { start: Date; end: Date } {
 const now = new Date();
 const end = now;
 let start: Date;

 switch (period) {
  case "day":
   start = startOfDay(now);
   break;
  case "week":
   start = startOfWeek(now, { weekStartsOn: 1 });
   break;
  case "month":
   start = startOfMonth(now);
   break;
  default:
   start = subDays(now, 7);
 }

 return { start, end };
}
