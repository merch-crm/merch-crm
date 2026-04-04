"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
  TrendingUp, 
  Users,
  LineChart,
  BarChart3,
  Target,
  Package
} from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { 
  StatsGrid, 
  MetricCard, 
  SparklineChart, 
  RevenueChart, 
  ConversionFunnel, 
  PipelineBar,
  BentoMiniSparkline,
  BentoRevenueGauge,
  BentoUserActivityHeatmap,
  BentoProgressRing3D,
  BentoFinancialBullet,
} from '@/components/library/custom';
import { StatusTimeline } from '@/components/ui/status-timeline';

const MOCK_EVENTS = [
  {
    id: '1',
    status: 'created',
    label: 'Заказ создан',
    description: 'Менеджер: Алексей К.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    state: 'completed'
  },
  {
    id: '2',
    status: 'paid',
    label: 'Оплачен',
    description: 'Сумма: 45 000 ₽',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    state: 'completed',
    comment: 'Оплата получена через СБП'
  },
  {
    id: '3',
    status: 'processing',
    label: 'В производстве',
    description: 'Цех: Печать на текстиле',
    timestamp: new Date(),
    state: 'current'
  }
];
export default function ChartsPage() {
  return (
    <CategoryPage
      title="Графики и Визуализация"
      description="Премиальные bento-виджеты для аналитики: от тепловых карт активности до 3D-колец прогресса и финансовых «пуль-графиков»."
      count={8}
    >
      {/* Section 1: Dashboard & Metrics */}
      <section className="flex flex-col gap-3 mt-12">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base">
            <BarChart3 className="size-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-normal text-text-strong-950">Панель и Метрики</h2>
        </div>

        <StatsGrid columns={4}>
          <MetricCard
            title="Активные сделки"
            value="124"
            change={12}
            trend="up"
            icon={<Target className="size-5" />}
            sparkline={<SparklineChart data={[20, 40, 35, 50, 45, 60, 55].map(v => ({ value: v }))} color="var(--primary-base)" />}
          />
          <MetricCard
            title="Средний чек"
            value="45 200 ₽"
            change={5}
            trend="up"
            icon={<Package className="size-5" />}
            sparkline={<SparklineChart data={[40, 42, 38, 45, 43, 48, 50].map(v => ({ value: v }))} color="var(--primary-base)" />}
          />
          <MetricCard
            title="Упущенная выгода"
            value="12 400 ₽"
            change={8}
            trend="down"
            icon={<TrendingUp className="rotate-180 size-5" />}
            sparkline={<SparklineChart data={[30, 25, 28, 20, 22, 15, 10].map(v => ({ value: v }))} color="#ef4444" />}
          />
          <MetricCard
            title="Команда"
            value="12"
            trend="neutral"
            icon={<Users className="size-5" />}
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <RevenueChart
            data={[
              { name: 'Пн', revenue: 12000, profit: 8000 },
              { name: 'Вт', revenue: 15000, profit: 9500 },
              { name: 'Ср', revenue: 18000, profit: 11000 },
              { name: 'Чт', revenue: 16500, profit: 10200 },
              { name: 'Пт', revenue: 21000, profit: 13000 },
              { name: 'Сб', revenue: 9000, profit: 5000 },
              { name: 'Вс', revenue: 7000, profit: 4000 },
            ]}
            total="98 500 ₽"
            trend={{ value: 15, direction: 'up' }}
          />
          <div className="flex flex-col gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm">
             <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold tracking-normal text-text-soft-400">Воронка продаж</span>
                <span className="text-2xl font-bold tracking-normal text-text-strong-950">Конверсия 18%</span>
             </div>
             <ConversionFunnel
               stages={[
                 { label: 'Лиды', value: 1200, color: 'bg-primary-base' },
                 { label: 'Квалифицированы', value: 850, color: 'bg-indigo-500' },
                 { label: 'Ком. предложение', value: 420, color: 'bg-violet-500' },
                 { label: 'Переговоры', value: 210, color: 'bg-fuchsia-500' },
                 { label: 'Сделка', value: 145, color: 'bg-pink-500' },
               ]}
             />
          </div>
        </div>

        <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm">
           <h3 className="text-sm font-semibold tracking-normal text-text-soft-400 mb-6">Распределение Воронки</h3>
           <PipelineBar
             stages={[
               { label: 'Новые', value: 12, color: 'bg-primary-base' },
               { label: 'В работе', value: 24, color: 'bg-indigo-500' },
               { label: 'Ожидание', value: 8, color: 'bg-amber-500' },
               { label: 'Закрыто', value: 15, color: 'bg-emerald-500' },
             ]}
           />
        </div>
      </section>

      <div className="mt-24 mb-12 w-full border-t border-border pt-20">
        <h2 className="text-4xl font-black font-heading tracking-normal mb-4">Визуализация Данных</h2>
        <p className="text-xl text-muted-foreground font-medium tracking-normal max-w-2xl">Инновационные способы визуализации данных в MerchCRM. Интерактивные чарты, тепловые карты и премиальная инфографика.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-32">
        <ComponentShowcase title="Мини-график (Sparkline)" source="custom">
          <BentoMiniSparkline />
        </ComponentShowcase>
        <ComponentShowcase title="График выручки (Premium)" source="custom" desc="Микро-график для анализа трендов.">
          <div className="w-full max-w-md mx-auto">
             <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                   <div>
                      <h4 className="text-xs font-black text-gray-400   mb-1">Выручка за месяц</h4>
                      <p className="text-2xl font-black text-gray-900 ">8.45М ₽</p>
                   </div>
                   <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                      <LineChart className="size-5" />
                   </div>
                </div>
                <div className="flex items-end gap-2 h-20 group-hover:gap-3 transition-all duration-300">
                   {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                      <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-500 transition-colors duration-300 cursor-cell relative group/bar" style={{ height: `${h}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[11px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                           {h}k
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </ComponentShowcase>
        <ComponentShowcase title="Индикатор выручки" source="custom">
          <BentoRevenueGauge />
        </ComponentShowcase>

        <ComponentShowcase title="Скорость активности" source="custom">
          <BentoUserActivityHeatmap />
        </ComponentShowcase>



        <ComponentShowcase title="3D Кольцо прогресса" source="custom">
           <BentoProgressRing3D />
        </ComponentShowcase>

        <ComponentShowcase title="Финансовый трекер (Bullet)" source="custom">
           <BentoFinancialBullet />
        </ComponentShowcase>

        <ComponentShowcase 
          title="Таймлайн статусов (Custom)" 
          source="custom" 
          desc="История изменения статусов заказа с комментариями и временными метками." 
          importPath="import { StatusTimeline } from '@/components/ui/status-timeline'" 
          code={`<StatusTimeline events={events} />`}
        >
          <div className="max-w-md w-full mx-auto bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <StatusTimeline events={MOCK_EVENTS as any} />
          </div>
        </ComponentShowcase>


        <ComponentShowcase title="Источники лидов" source="custom" desc="Сетка анализа каналов привлечения.">
          <div className="w-full max-w-sm mx-auto py-4">
             <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer">
                <h4 className="text-xs font-black text-gray-400   mb-6">Каналы привлечения</h4>
                <div className="grid grid-cols-2 gap-3">
                   {[
                      { label: 'LinkedIn', val: '45%', color: 'bg-blue-500' },
                      { label: 'Реферал', val: '30%', color: 'bg-emerald-500' },
                      { label: 'Органика', val: '15%', color: 'bg-amber-500' },
                      { label: 'Прочее', val: '10%', color: 'bg-gray-400' }
                   ].map((s, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-gray-50 flex flex-col gap-1 border border-gray-100">
                         <span className="text-[11px] font-black text-gray-400  ">{s.label}</span>
                         <span className="text-lg font-black text-gray-900">{s.val}</span>
                         <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div className={cn("h-full rounded-full", s.color)} style={{ width: s.val }}></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </ComponentShowcase>



      </div>
    </CategoryPage>
  );
}
