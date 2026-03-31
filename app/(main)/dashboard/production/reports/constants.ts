import { subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";

/**
 * Период отчёта
 */
export interface ReportPeriod {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
}

export const PERIOD_OPTIONS: ReportPeriod[] = [
    {
        id: "today",
        label: "Сегодня",
        startDate: new Date(),
        endDate: new Date(),
    },
    {
        id: "week",
        label: "Неделя",
        startDate: subDays(new Date(), 7),
        endDate: new Date(),
    },
    {
        id: "month",
        label: "Месяц",
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
    },
    {
        id: "quarter",
        label: "Квартал",
        startDate: subMonths(startOfMonth(new Date()), 2),
        endDate: new Date(),
    },
];
