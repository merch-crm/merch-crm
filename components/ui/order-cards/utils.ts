import { differenceInHours } from "date-fns";

export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
};

export const getDeadlineUrgency = (deadline: Date): { isOverdue: boolean; isUrgent: boolean; isSoon: boolean } => {
    const now = new Date();
    const hoursLeft = differenceInHours(deadline, now);

    return {
        isOverdue: hoursLeft < 0,
        isUrgent: hoursLeft >= 0 && hoursLeft < 4,
        isSoon: hoursLeft >= 4 && hoursLeft < 24,
    };
};
