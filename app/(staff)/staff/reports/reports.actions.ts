'use server'

import { db } from '@/lib/db'
import { dailyWorkStats } from '@/lib/schema/presence'
import { eq, and, gte, lte } from 'drizzle-orm'
import { getSession } from '@/lib/session'
import { logError } from '@/lib/error-logger'

export async function getDailyReport(date: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)

        // Получаем статистику за день
        const stats = await db.query.dailyWorkStats.findMany({
            where: eq(dailyWorkStats.date, targetDate)
        })

        // Получаем настройки для определения опозданий
        const settings = await db.query.presenceSettings.findMany()
        const settingsMap = settings.reduce((acc, s) => {
            acc[s.key] = s.value as string | number | boolean
            return acc
        }, {} as Record<string, string | number | boolean>)

        const workStartTime = settingsMap.work_start_time || '09:00'
        const lateThreshold = settingsMap.late_threshold_minutes || 15

        // Получаем всех пользователей
        const allUsers = await db.query.users.findMany({
            columns: { id: true, name: true, email: true }
        })

        const userMap = allUsers.reduce((acc, u) => {
            acc[u.id] = u
            return acc
        }, {} as Record<string, typeof allUsers[0]>)

        // Формируем отчёт
        const employees = stats.map(stat => {
            const user = userMap[stat.userId]
            const workStartString = `${date}T${workStartTime}:00`
            const workStart = new Date(workStartString)
            const isLate = stat.firstSeenAt ?
                new Date(stat.firstSeenAt) > new Date(workStart.getTime() + Number(lateThreshold) * 60 * 1000) :
                false

            return {
                userId: stat.userId,
                userName: user?.name || 'Unknown',
                email: user?.email || '',
                firstSeen: stat.firstSeenAt?.toISOString() || null,
                lastSeen: stat.lastSeenAt?.toISOString() || null,
                workHours: (stat.workSeconds || 0) / 3600,
                idleHours: (stat.idleSeconds || 0) / 3600,
                breakHours: (stat.breakSeconds || 0) / 3600,
                productivity: stat.productivity || 0,
                isLate,
                lateMinutes: stat.lateArrivalMinutes || 0
            }
        })

        const totalEmployees = allUsers.length
        const presentToday = stats.length
        const averageWorkHours = employees.length > 0
            ? employees.reduce((sum, e) => sum + e.workHours, 0) / employees.length
            : 0
        const lateArrivals = employees.filter(e => e.isLate).length

        return {
            success: true,
            data: {
                date,
                totalEmployees,
                presentToday,
                averageWorkHours,
                lateArrivals,
                employees
            }
        }
    } catch (error) {
        logError({ error: error as Error, path: 'reports.actions', method: 'getDailyReport' })
        return { success: false, error: 'Failed to fetch daily report' }
    }
}

export async function getWeeklyReport(date: string) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const targetDate = new Date(date)
        const dayOfWeek = targetDate.getDay()
        const startOfWeek = new Date(targetDate)
        startOfWeek.setDate(targetDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        startOfWeek.setHours(0, 0, 0, 0)

        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)

        // Получаем статистику за неделю
        const stats = await db.query.dailyWorkStats.findMany({
            where: and(
                gte(dailyWorkStats.date, startOfWeek),
                lte(dailyWorkStats.date, endOfWeek)
            )
        })

        // Получаем всех пользователей
        const allUsers = await db.query.users.findMany({
            columns: { id: true, name: true, email: true }
        })

        const userMap = allUsers.reduce((acc, u) => {
            acc[u.id] = u
            return acc
        }, {} as Record<string, typeof allUsers[0]>)

        // Группируем по дням
        const dailyData: Record<string, {
            date: string
            present: number
            avgHours: number
            lateCount: number
        }> = {}

        const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek)
            d.setDate(startOfWeek.getDate() + i)
            const dateKey = d.toISOString().split('T')[0]
            dailyData[dateKey] = {
                date: days[i],
                present: 0,
                avgHours: 0,
                lateCount: 0
            }
        }

        // Заполняем данными
        for (const stat of stats) {
            const dateKey = stat.date.toISOString().split('T')[0]
            if (dailyData[dateKey]) {
                dailyData[dateKey].present++
                dailyData[dateKey].avgHours += (stat.workSeconds || 0) / 3600
                if (stat.lateArrivalMinutes && stat.lateArrivalMinutes > 0) {
                    dailyData[dateKey].lateCount++
                }
            }
        }

        // Вычисляем средние
        Object.keys(dailyData).forEach(key => {
            if (dailyData[key].present > 0) {
                dailyData[key].avgHours = dailyData[key].avgHours / dailyData[key].present
            }
        })

        // Группируем по сотрудникам
        const employeeStats: Record<string, {
            userId: string
            userName: string
            totalHours: number
            daysPresent: number
            lateCount: number
            avgProductivity: number
        }> = {}

        for (const stat of stats) {
            if (!employeeStats[stat.userId]) {
                const user = userMap[stat.userId]
                employeeStats[stat.userId] = {
                    userId: stat.userId,
                    userName: user?.name || 'Unknown',
                    totalHours: 0,
                    daysPresent: 0,
                    lateCount: 0,
                    avgProductivity: 0
                }
            }
            employeeStats[stat.userId].totalHours += (stat.workSeconds || 0) / 3600
            employeeStats[stat.userId].daysPresent++
            if (stat.lateArrivalMinutes && stat.lateArrivalMinutes > 0) {
                employeeStats[stat.userId].lateCount++
            }
            employeeStats[stat.userId].avgProductivity += Number(stat.productivity) || 0
        }

        // Вычисляем средние
        Object.values(employeeStats).forEach(emp => {
            if (emp.daysPresent > 0) {
                emp.avgProductivity = emp.avgProductivity / emp.daysPresent
            }
        })

        return {
            success: true,
            data: {
                startDate: startOfWeek.toISOString().split('T')[0],
                endDate: endOfWeek.toISOString().split('T')[0],
                dailyBreakdown: Object.values(dailyData),
                employees: Object.values(employeeStats).sort((a, b) => b.totalHours - a.totalHours),
                summary: {
                    totalWorkDays: 5,
                    avgDailyPresence: stats.length / 7,
                    avgDailyHours: Object.values(dailyData).reduce((sum, d) => sum + d.avgHours, 0) / 7,
                    totalLateArrivals: stats.filter(s => s.lateArrivalMinutes && s.lateArrivalMinutes > 0).length
                }
            }
        }
    } catch (error) {
        logError({ error: error as Error, path: 'reports.actions', method: 'getWeeklyReport' })
        return { success: false, error: 'Failed to fetch weekly report' }
    }
}

export async function getMonthlyReport(year: number, month: number) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        const startOfMonth = new Date(year, month - 1, 1)
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

        // Получаем статистику за месяц
        const stats = await db.query.dailyWorkStats.findMany({
            where: and(
                gte(dailyWorkStats.date, startOfMonth),
                lte(dailyWorkStats.date, endOfMonth)
            )
        })

        // Получаем всех пользователей
        const allUsers = await db.query.users.findMany({
            columns: { id: true, name: true, email: true }
        })

        const userMap = allUsers.reduce((acc, u) => {
            acc[u.id] = u
            return acc
        }, {} as Record<string, typeof allUsers[0]>)

        // Группируем по сотрудникам
        const employeeStats: Record<string, {
            userId: string
            userName: string
            email: string
            totalHours: number
            daysPresent: number
            lateCount: number
            earlyDepartures: number
            avgProductivity: number
            dailyAvgHours: number
        }> = {}

        for (const stat of stats) {
            if (!employeeStats[stat.userId]) {
                const user = userMap[stat.userId]
                employeeStats[stat.userId] = {
                    userId: stat.userId,
                    userName: user?.name || 'Unknown',
                    email: user?.email || '',
                    totalHours: 0,
                    daysPresent: 0,
                    lateCount: 0,
                    earlyDepartures: 0,
                    avgProductivity: 0,
                    dailyAvgHours: 0
                }
            }
            employeeStats[stat.userId].totalHours += (stat.workSeconds || 0) / 3600
            employeeStats[stat.userId].daysPresent++
            if (stat.lateArrivalMinutes && stat.lateArrivalMinutes > 0) {
                employeeStats[stat.userId].lateCount++
            }
            if (stat.earlyDepartureMinutes && stat.earlyDepartureMinutes > 0) {
                employeeStats[stat.userId].earlyDepartures++
            }
            employeeStats[stat.userId].avgProductivity += Number(stat.productivity) || 0
        }

        // Вычисляем средние
        Object.values(employeeStats).forEach(emp => {
            if (emp.daysPresent > 0) {
                emp.avgProductivity = emp.avgProductivity / emp.daysPresent
                emp.dailyAvgHours = emp.totalHours / emp.daysPresent
            }
        })

        // Рабочие дни в месяце (исключая выходные)
        let workDaysCount = 0
        const tempDate = new Date(startOfMonth)
        while (tempDate <= endOfMonth) {
            const day = tempDate.getDay()
            if (day !== 0 && day !== 6) workDaysCount++
            tempDate.setDate(tempDate.getDate() + 1)
        }

        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]

        return {
            success: true,
            data: {
                year,
                month,
                monthName: monthNames[month - 1],
                workDays: workDaysCount,
                employees: Object.values(employeeStats).sort((a, b) => b.totalHours - a.totalHours),
                summary: {
                    totalEmployees: allUsers.length,
                    avgAttendance: (stats.length / (workDaysCount || 1) / (allUsers.length || 1)) * 100,
                    avgMonthlyHours: Object.values(employeeStats).reduce((sum, e) => sum + e.totalHours, 0) / (Object.values(employeeStats).length || 1),
                    totalLateArrivals: Object.values(employeeStats).reduce((sum, e) => sum + e.lateCount, 0),
                    totalEarlyDepartures: Object.values(employeeStats).reduce((sum, e) => sum + e.earlyDepartures, 0)
                }
            }
        }
    } catch (error) {
        logError({ error: error as Error, path: 'reports.actions', method: 'getMonthlyReport' })
        return { success: false, error: 'Failed to fetch monthly report' }
    }
}

export async function exportReport(type: 'daily' | 'weekly' | 'monthly', params: { date?: string; year?: number; month?: number }) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized' }
        }

        let result: {
            success: boolean
            data?: Record<string, unknown>
            error?: string
        }

        switch (type) {
            case 'daily':
                result = await getDailyReport(params.date!)
                break
            case 'weekly':
                result = await getWeeklyReport(params.date!)
                break
            case 'monthly':
                result = await getMonthlyReport(params.year!, params.month!)
                break
        }

        if (!result.success || !result.data) {
            return { success: false, error: result.error || 'No data generated' }
        }

        const data = result.data

        // Генерируем CSV
        let csv = ''

        if (type === 'daily' && 'employees' in data && data.employees) {
            csv = 'Имя,Email,Приход,Уход,Часы работы,Опоздание\n'
            for (const emp of data.employees as Record<string, unknown>[]) {
                csv += `"${emp.userName}","${emp.email}","${emp.firstSeen || '-'}","${emp.lastSeen || '-'}",${(emp.workHours as number).toFixed(2)},${emp.isLate ? 'Да' : 'Нет'}\n`
            }
        } else if (type === 'monthly' && 'employees' in data && data.employees) {
            csv = 'Имя,Email,Дней присутствия,Всего часов,Среднее в день,Опоздания\n'
            for (const emp of data.employees as Record<string, unknown>[]) {
                csv += `"${emp.userName}","${emp.email}",${emp.daysPresent},${(emp.totalHours as number).toFixed(2)},${(emp.dailyAvgHours as number).toFixed(2)},${emp.lateCount}\n`
            }
        }

        return {
            success: true,
            data: {
                csv,
                filename: `report_${type}_${new Date().toISOString().split('T')[0]}.csv`
            }
        }
    } catch (error) {
        logError({ error: error as Error, path: 'reports.actions', method: 'exportReport' })
        return { success: false, error: 'Failed to export report' }
    }
}
