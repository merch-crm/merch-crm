"use client";

import * as React from 'react';

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";

// New Bento Forms
import { BentoSettingsToggles } from '@/components/library/custom/components/forms/bento-settings-toggles';
import { BentoInviteTeamForm } from '@/components/library/custom/components/forms/bento-invite-team-form';

export default function FormsPage() {
  return (
    <CategoryPage title="Формы и ввод данных" description="Коллекция премиальных форм, инпутов и селектов для сложных интерфейсов управления и настройки системы." count={2}>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
        
        {/* 1. Profile Toggles */}
        <ComponentShowcase title="Настройки (iOS)" source="custom" desc="Переключатели системных настроек в стиле мобильных ОС.">
           <BentoSettingsToggles />
        </ComponentShowcase>

        {/* 2. Array Input (Team) */}
        <ComponentShowcase title="Приглашение команды" source="custom" desc="Удобный инструмент для массового приглашения коллег.">
           <BentoInviteTeamForm />
        </ComponentShowcase>

      </div>
      
    </CategoryPage>
  );
}
