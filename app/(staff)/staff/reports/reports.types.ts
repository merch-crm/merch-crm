export interface DailyEmployeeStats {
    userId: string
    userName: string
    email: string
    firstSeen: string | null
    lastSeen: string | null
    workHours: number
    idleHours: number
    breakHours: number
    productivity: number | string
    isLate: boolean
    lateMinutes: number
}

export interface DailyReport {
    date: string
    totalEmployees: number
    presentToday: number
    averageWorkHours: number
    lateArrivals: number
    employees: DailyEmployeeStats[]
}

export interface DayBreakdown {
    date: string
    present: number
    avgHours: number
    lateCount: number
}

export interface WeeklyEmployeeStats {
    userId: string
    userName: string
    totalHours: number
    daysPresent: number
    lateCount: number
    avgProductivity: number
}

export interface WeeklyReport {
    startDate: string
    endDate: string
    dailyBreakdown: DayBreakdown[]
    employees: WeeklyEmployeeStats[]
    summary: {
        totalWorkDays: number
        avgDailyPresence: number
        avgDailyHours: number
        totalLateArrivals: number
    }
}

export interface MonthlyEmployeeStats {
    userId: string
    userName: string
    email: string
    totalHours: number
    daysPresent: number
    lateCount: number
    earlyDepartures: number
    avgProductivity: number
    dailyAvgHours: number
}

export interface MonthlyReport {
    year: number
    month: number
    monthName: string
    workDays: number
    employees: MonthlyEmployeeStats[]
    summary: {
        totalEmployees: number
        avgAttendance: number
        avgMonthlyHours: number
        totalLateArrivals: number
        totalEarlyDepartures: number
    }
}

export type ReportType = 'daily' | 'weekly' | 'monthly'
