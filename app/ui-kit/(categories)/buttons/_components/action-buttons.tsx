"use client";

import React from "react";
import { Plus, Save } from "lucide-react";
import { CrmButton } from "@/components/ui/crm-button";
import { ComponentShowcase } from "@/components/ui-kit";

export function ActionButtons() {
 return (
  <ComponentShowcase 
   title="01. Действие / Midnight" 
   source="custom" 
   desc="Основные действия CRM. Используется для создания, сохранения и других ключевых операций."
   importPath='import { CrmButton } from "@/components/ui/crm-button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="action"><Plus className="size-4 mr-2" />Создать</CrmButton>
     <CrmButton variant="action"><Save className="size-4 mr-2" />Сохранить</CrmButton>
     <CrmButton variant="action" size="icon"><Plus className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="actionOutline"><Plus className="size-4 mr-2" />Создать</CrmButton>
     <CrmButton variant="actionOutline"><Save className="size-4 mr-2" />Сохранить</CrmButton>
     <CrmButton variant="actionOutline" size="icon"><Plus className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="actionGhost"><Plus className="size-4 mr-2" />Создать</CrmButton>
     <CrmButton variant="actionGhost" size="icon"><Plus className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="action" isLoading loadingText="Обработка...">Создать</CrmButton>
    </div>
   </div>
  </ComponentShowcase>
 );
}
