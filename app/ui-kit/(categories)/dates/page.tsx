"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { DateRangePicker, DateRangePickerWithPresets, type DateRange } from "@/components/ui/date-range-picker";
import { 
  StatusTimeline, 
  StatusTimelineHorizontal, 
  type StatusEvent
} from "@/components/ui/status-timeline";
import { TimeTrackerToggle } from "@/components/ui/time-tracker";
import { subDays, startOfToday } from "date-fns";

// Bento Imports
import { BentoCalendar } from "@/components/library/custom/components/dates/bento-calendar";
import { BentoDateRange } from "@/components/library/custom/components/dates/bento-date-range";
import { BentoTimePicker } from "@/components/library/custom/components/dates/BentoTimePicker";
import { BentoRelativeTime } from "@/components/library/custom/components/dates/BentoRelativeTime";
import { BentoSchedulePreview } from "@/components/library/custom/components/dates/BentoSchedulePreview";
import { BentoAnnualGrid } from "@/components/library/custom/components/dates/BentoAnnualGrid";
import { BentoCountdown } from "@/components/library/custom/components/dates/BentoCountdown";
import { BentoMonthSlider } from "@/components/library/custom/components/dates/BentoMonthSlider";


export default function DatesPage() {
  const today = startOfToday();
  const [range, setRange] = useState<DateRange>({ from: subDays(today, 7), to: today });
  const [rangeWithPresets, setRangeWithPresets] = useState<DateRange>({ from: today, to: today });
  const [isTracking, setIsTracking] = useState(false);

  const timelineData: StatusEvent[] = [
    {
      id: "1",
      status: "created",
      label: "Заказ создан",
      description: "Клиент оформил заказ через сайт",
      timestamp: subDays(today, 2),
      user: "Система"
    },
    {
      id: "2",
      status: "processing",
      label: "Передано в работу",
      description: "Менеджер подтвердил наличие товара",
      timestamp: subDays(today, 1),
      user: "Иван Иванов"
    },
    {
      id: "3",
      status: "completed",
      label: "Упаковано",
      description: "Заказ готов к отгрузке",
      timestamp: today,
      user: "Анна Смирнова"
    }
  ];

  return (
    <CategoryPage
      title="Даты и Календари"
      description="Компоненты для выбора дат, диапазонов, отслеживания времени и визуализации истории событий."
      count={13}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
        
        <ComponentShowcase title="Выбор диапазона (Input)" source="custom" className="overflow-visible">
          <div className="w-full">
            <DateRangePicker 
              label="Даты проведения акции"
              value={range}
              onChange={setRange}
            />
          </div>
        </ComponentShowcase>

        <div className="lg:col-span-2 mt-16 mb-8 w-full border-t border-border pt-16">
          <h2 className="text-3xl font-black font-heading  mb-2">Bento-виджеты дат и расписания</h2>
          <p className="text-muted-foreground font-medium">Премиальные варианты управления временем в стиле Midnight.</p>
        </div>

        {/* BENTO SECTION */}
        
        {/* 1. Bento Calendar */}
        <ComponentShowcase title="Bento-календарь" source="custom" desc="Liquid-переходы между месяцами и пружинная анимация выбора.">
           <BentoCalendar />
         </ComponentShowcase>

        {/* 2. Bento Date Range */}
        <ComponentShowcase title="Bento-диапазон" source="custom" desc="Компактный выбор диапазона с плавающими карточками.">
           <BentoDateRange />
        </ComponentShowcase>

        {/* 3. Bento Time Picker */}
        <ComponentShowcase title="Bento-выбор времени" source="custom" desc="Цифровой барабан выбора времени в стиле iOS.">
           <BentoTimePicker />
        </ComponentShowcase>

        {/* 4. Bento Relative Time */}
        <ComponentShowcase title="Относительное время" source="custom" desc="Живые индикаторы относительного времени с пульсацией.">
           <BentoRelativeTime />
        </ComponentShowcase>

        {/* 5. Bento Schedule Preview */}
        <ComponentShowcase title="Мини-расписание" source="custom" desc="Мини-таймлайн будущих событий и встреч.">
           <BentoSchedulePreview />
        </ComponentShowcase>


        {/* 7. Bento Annual Grid */}
        <ComponentShowcase title="Сетка активности" source="custom" desc="Годовая сетка активности пользователя (GitHub Style).">
           <BentoAnnualGrid />
        </ComponentShowcase>

        {/* 8. Bento Month Slider */}
        <ComponentShowcase title="Слайдер месяцев" source="custom" desc="Горизонтальный скролл для быстрой навигации по месяцам.">
           <BentoMonthSlider />
        </ComponentShowcase>

        {/* 9. Bento Countdown */}
        <ComponentShowcase title="Обратный отсчет" source="custom" desc="Тикающий таймер обратного отсчета для дедлайнов.">
           <BentoCountdown />
        </ComponentShowcase>

        <div className="lg:col-span-2 mt-16 mb-8 w-full border-t border-border pt-16">
          <h2 className="text-3xl font-black font-heading  mb-2">Стандарты и История CRM</h2>
          <p className="text-muted-foreground font-medium">Базовые элементы для работы с историей событий.</p>
        </div>

        {/* 3. Range Picker with Presets */}
        <ComponentShowcase title="Диапазон с пресетами" source="custom">
          <div className="w-full max-w-sm mx-auto">
            <DateRangePickerWithPresets 
              label="Период отчета"
              value={rangeWithPresets}
              onChange={setRangeWithPresets}
            />
          </div>
        </ComponentShowcase>


        {/* 5. Status Timeline (Vertical) */}
        <ComponentShowcase title="Таймлайн (Вертикальный)" source="custom" className="lg:col-span-2">
          <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <StatusTimeline events={timelineData} />
          </div>
        </ComponentShowcase>

        {/* 6. Status Timeline (Horizontal) */}
        <ComponentShowcase title="Таймлайн (Горизонтальный)" source="custom" className="lg:col-span-2">
          <div className="w-full max-w-3xl mx-auto p-8 overflow-x-auto">
            <StatusTimelineHorizontal events={timelineData} />
          </div>
        </ComponentShowcase>

        {/* 9. Time Tracker Toggle */}
        <ComponentShowcase title="Трекер времени (Toggle)" source="custom">
          <div className="w-full max-w-[200px] mx-auto flex items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <TimeTrackerToggle 
              isWorking={isTracking} 
              onToggle={() => setIsTracking(!isTracking)} 
              startTime={isTracking ? subDays(new Date(), 0) : null}
            />
          </div>
        </ComponentShowcase>


      </div>
    </CategoryPage>
  );
}
