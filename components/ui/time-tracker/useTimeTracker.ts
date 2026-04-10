"use client";

import * as React from"react";
import { differenceInSeconds } from"date-fns";

/**
 * Хук для управления состоянием прошедшего времени в таймере.
 * 
 * @param startTime - Дата начала отсчета (если null, таймер сброшен)
 * @param isActive - Флаг активности таймера (отсчет идет только если true)
 * @returns elapsed - Количество секунд с момента startTime
 */
export function useTimeTracker(startTime?: Date | null, isActive: boolean = true, initialElapsed: number = 0) {
    const [elapsed, setElapsed] = React.useState(initialElapsed);

    React.useEffect(() => {
        // Если нет даты начала - таймер полностью сброшен
        if (!startTime) {
            setElapsed(0);
            return;
        }

        // Если таймер не активен (пауза) - показываем накопленное время
        if (!isActive) {
            setElapsed(initialElapsed);
            return;
        }

        const updateElapsed = () => {
            const currentSeconds = differenceInSeconds(new Date(), new Date(startTime));
            setElapsed(initialElapsed + currentSeconds);
        };

        // Запуск сразу
        updateElapsed();

        // Интервал каждую секунду
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [startTime, isActive, initialElapsed]);

    return elapsed;
}
