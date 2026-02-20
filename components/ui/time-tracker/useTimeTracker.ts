"use client";

import * as React from "react";
import { differenceInSeconds } from "date-fns";

/**
 * Хук для управления состоянием прошедшего времени в таймере.
 * 
 * @param startTime - Дата начала отсчета (если null, таймер сброшен)
 * @param isActive - Флаг активности таймера (отсчет идет только если true)
 * @returns elapsed - Количество секунд с момента startTime
 */
export function useTimeTracker(startTime?: Date | null, isActive: boolean = true) {
    const [elapsed, setElapsed] = React.useState(0);

    React.useEffect(() => {
        if (!startTime || !isActive) {
            setElapsed(0);
            return;
        }

        const updateElapsed = () => {
            setElapsed(differenceInSeconds(new Date(), new Date(startTime)));
        };

        // Запуск сразу
        updateElapsed();

        // Интервал каждую секунду
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [startTime, isActive]);

    return elapsed;
}
