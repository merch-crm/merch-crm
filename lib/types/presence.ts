// Типы для модуля учета рабочего времени (остатки от модуля присутствия)

export interface WorkSession {
    id: string;
    userId: string;
    date: Date;
    startTime: Date;
    endTime: Date | null;
    durationSeconds: number;
    sessionType: "work" | "break" | "idle";
    createdAt: Date;
}

export interface DailyWorkStats {
    id: string;
    userId: string;
    date: Date;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
    workSeconds: number;
    idleSeconds: number;
    breakSeconds: number;
    productivity: string | null;
    totalSessions: number;
    lateArrivalMinutes: number;
    earlyDepartureMinutes: number;
    createdAt: Date;
    updatedAt: Date;
}

// Типы для отчётов
export interface DailyReportRow {
    userId: string;
    userName: string;
    userAvatar: string | null;
    departmentName: string | null;
    firstSeenAt: Date | null;
    lastSeenAt: Date | null;
    workHours: number;
    idleHours: number;
    productivity: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
}

export interface WeeklyReportRow extends DailyReportRow {
    daysWorked: number;
    avgWorkHours: number;
    avgProductivity: number;
}

export interface MonthlyReportRow extends WeeklyReportRow {
    totalWorkHours: number;
    totalIdleHours: number;
}
