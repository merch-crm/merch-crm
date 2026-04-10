"use client";

import React from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { 
 AccordionCards, 
 AccordionFAQ, 
 AccordionSettings 
} from "@/components/ui/accordion";


import { Mail, ShieldCheck, CreditCard } from 'lucide-react';

export default function AccordionsPage() {
 const basicItems = [
  { id: '1', title: 'Общая информация', content: 'Базовые данные о компании и её деятельности в рамках CRM.' },
  { id: '2', title: 'История изменений', content: 'Все действия пользователей протоколируются и доступны для аудита.' },
  { id: '3', title: 'Лимиты и квоты', content: 'Текущий тарифный план ограничивает количество активных сделок до 5000.' },
 ];

 const faqItems = [
  { id: 'f1', title: 'Как создать новый лид?', content: 'Нажмите на кнопку "Создать" в верхнем правом углу экрана воронки.' },
  { id: 'f2', title: 'Можно ли экспортировать базу в Excel?', content: 'Да, функция экспорта доступна в разделе Настройки -> Экспорт данных.' },
  { id: 'f3', title: 'Где найти API ключ?', content: 'API ключи генерируются в профиле администратора в разделе Безопасность.' },
 ];

 const settingsItems = [
  { 
   id: 's1', 
   title: 'Уведомления', 
   description: 'Управление пуш-сообщениями и email-рассылками',
   icon: <Mail className="size-5" />,
   content: 'Здесь вы можете выбрать, о каких событиях система будет вас оповещать автоматически.' 
  },
  { 
   id: 's2', 
   title: 'Безопасность', 
   description: 'Пароли, 2FA и сессии устройств',
   icon: <ShieldCheck className="size-5" />,
   content: 'Настройте двухфакторную аутентификацию для защиты вашего аккаунта.' 
  },
  { 
   id: 's3', 
   title: 'Оплата', 
   description: 'Методы платежа и история инвойсов',
   icon: <CreditCard className="size-5" />,
   content: 'Добавьте карту или настройте автоплатеж для бесперебойной работы.' 
  },
 ];

 return (
  <CategoryPage
   title="Аккордеоны"
   description="Раскрывающиеся списки для организации контента, FAQ, настроек и пошаговых сценариев."
  >
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-16">
    
    {/* 1. Accordion Cards */}
    <ComponentShowcase title="Аккордеон-карточки (Gap)" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
     <div className="w-full max-w-sm mx-auto p-4 bg-gray-50 rounded-3xl">
      <AccordionCards items={basicItems} gap="md" />
     </div>
    </ComponentShowcase>

    {/* 2. Accordion FAQ (Plus/Minus) */}
    <ComponentShowcase title="FAQ Стиль (Плюс/Минус)" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
     <div className="w-full max-w-md mx-auto bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
      <AccordionFAQ items={faqItems} />
     </div>
    </ComponentShowcase>

    {/* 3. Accordion Settings */}
    <ComponentShowcase title="Настройки (Иконки + Описание)" source="custom" className="col-span-1 md:col-span-2 lg:col-span-4">
     <div className="w-full max-w-2xl mx-auto">
      <AccordionSettings items={settingsItems} />
     </div>
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
