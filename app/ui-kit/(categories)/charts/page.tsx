"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
 TrendingUp, 
 Users,
 BarChart3,
 Target,
 Package
} from 'lucide-react';
import { 
 StatsGrid, 
 MetricCard, 
 SparklineChart, 
 RevenueChart, 
 ConversionFunnel, 
 BentoMiniSparkline,
 BentoProgressRing3D,
 BentoFinancialBullet,
 BentoPremiumRevenueChart,
} from '@/components/library/custom';
import { PipelineBar } from '@/components/ui/pipeline-bar';
import { StatusTimeline, type StatusEvent } from '@/components/ui/status-timeline';
import { DeliveryTracker } from '@/components/ui/delivery-tracker/DeliveryTracker';
import { DeliveryInfo } from '@/components/ui/delivery-tracker/types';

const MOCK_EVENTS: StatusEvent[] = [
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

const MOCK_DELIVERY: DeliveryInfo = {
 trackingNumber: '1425678901',
 provider: 'cdek',
 status: 'in_transit',
 events: [
  { id: '1', status: 'created', title: 'Создан', timestamp: new Date('2025-04-01T10:00:00Z'), location: 'Москва' },
  { id: '2', status: 'accepted', title: 'Принят', timestamp: new Date('2025-04-01T14:30:00Z'), location: 'Склад МСК-1' },
  { id: '3', status: 'in_transit', title: 'В пути', timestamp: new Date('2025-04-02T09:15:00Z'), location: 'В пути в Санкт-Петербург' }
 ],
 lastUpdate: new Date(),
 senderCity: 'Москва',
 receiverCity: 'Санкт-Петербург'
};

export default function ChartsPage() {
 return (
  <CategoryPage
   title="Графики и Визуализация"
   description="Премиальные bento-виджеты для аналитики: от тепловых карт активности до 3D-колец прогресса и финансовых «пуль-графиков»."
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
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 pb-32">
    <ComponentShowcase title="Мини-график (Sparkline)" source="custom">
     <BentoMiniSparkline />
    </ComponentShowcase>
    <ComponentShowcase title="График выручки (Premium)" source="custom" desc="Микро-график для анализа трендов.">
     <BentoPremiumRevenueChart />
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
       <StatusTimeline events={MOCK_EVENTS} />
     </div>
    </ComponentShowcase>




    <ComponentShowcase 
     title="Трекер доставки (Custom)" 
     source="custom" 
     desc="Интерактивный трекер доставки со статусами и историей событий." 
     importPath="import { DeliveryTracker } from '@/components/ui/delivery-tracker/DeliveryTracker'" 
     code={`<DeliveryTracker delivery={mockDelivery} />`}
    >
     <div className="max-w-md w-full mx-auto">
       <DeliveryTracker delivery={MOCK_DELIVERY} />
     </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
