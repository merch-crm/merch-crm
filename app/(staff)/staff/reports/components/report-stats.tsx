"use client";

import { Card, CardBody } from '@/components/ui/card-bento'
import { cn } from '@/lib/utils'
import { type IconType } from '@/components/ui/stat-card'

export function StatCard({
  title,
  value,
  icon: Icon,
  color
}: {
  title: string
  value: string | number
  icon: IconType
  color: 'blue' | 'emerald' | 'orange' | 'indigo'
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100'
  }

  return (
    <Card className="crm-card border-none shadow-sm bg-white overflow-hidden">
      <CardBody className="p-6 flex items-center gap-3">
        <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center ring-4', colors[color])}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
          <p className="text-xs leading-tight text-neutral-500 font-bold text-slate-400 mt-2 leading-none">{title}</p>
        </div>
      </CardBody>
    </Card>
  )
}

export function StatSummaryCard({ title, count, icon: Icon, color }: { title: string, count: number, icon: IconType, color: 'emerald' | 'rose' | 'indigo' }) {
  const configs = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' }
  }
  const config = configs[color]

  return (
    <Card className="crm-card border-none shadow-sm bg-white overflow-hidden h-full">
      <CardBody className="p-5 flex items-center gap-3">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center ring-4", config.bg, config.text, config.ring)}>
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-3xl font-black text-slate-900 leading-none">{count}</p>
          <p className="text-xs leading-tight text-neutral-500 font-bold text-slate-400 mt-2">{title}</p>
        </div>
      </CardBody>
    </Card>
  )
}
