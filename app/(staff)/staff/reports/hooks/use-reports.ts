"use client";

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { getDailyReport, getWeeklyReport, getMonthlyReport, exportReport } from '../reports.actions'
import type { DailyReport, WeeklyReport, MonthlyReport, ReportType } from '../reports.types'

interface UseReportsProps {
  initialDaily: DailyReport | null
  initialWeekly: WeeklyReport | null
  initialMonthly: MonthlyReport | null
}

export function useReports({ initialDaily, initialWeekly, initialMonthly }: UseReportsProps) {
  const [reportType, setReportType] = useState<ReportType>('daily')
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(initialDaily)
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(initialWeekly)
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(initialMonthly)
  const [isPending, startTransition] = useTransition()
  const [currentDate, setCurrentDate] = useState(new Date())

  const fetchReport = (type: ReportType, date: Date) => {
    startTransition(async () => {
      const dateStr = date.toISOString().split('T')[0]

      switch (type) {
        case 'daily':
          const daily = await getDailyReport(dateStr)
          if (daily.success) setDailyReport(daily.data ?? null)
          break
        case 'weekly':
          const weekly = await getWeeklyReport(dateStr)
          if (weekly.success) setWeeklyReport(weekly.data ?? null)
          break
        case 'monthly':
          const monthly = await getMonthlyReport(date.getFullYear(), date.getMonth() + 1)
          if (monthly.success) setMonthlyReport(monthly.data ?? null)
          break
      }
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)

    switch (reportType) {
      case 'daily':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
    }

    setCurrentDate(newDate)
    fetchReport(reportType, newDate)
  }

  const changeReportType = (type: ReportType) => {
    setReportType(type)
    fetchReport(type, currentDate)
  }

  const handleExport = async () => {
    startTransition(async () => {
      const dateStr = currentDate.toISOString().split('T')[0]

      const result = await exportReport(reportType, {
        date: dateStr,
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
      })

      if (result.success && result.data) {
        const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.data.filename
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Отчёт экспортирован')
      } else {
        toast.error('Ошибка экспорта')
      }
    })
  }

  const formatDateRange = () => {
    switch (reportType) {
      case 'daily':
        return currentDate.toLocaleDateString('ru-RU', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })
      case 'weekly':
        return weeklyReport ? `${weeklyReport.startDate} — ${weeklyReport.endDate}` : ''
      case 'monthly':
        return monthlyReport ? `${monthlyReport.monthName} ${monthlyReport.year}` : ''
    }
  }

  return {
    reportType,
    changeReportType,
    dailyReport,
    weeklyReport,
    monthlyReport,
    isPending,
    currentDate,
    navigateDate,
    handleExport,
    formatDateRange
  }
}
