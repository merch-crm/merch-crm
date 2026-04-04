"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { CrmButton } from "@/components/ui/crm-button";
import { ComponentShowcase } from "@/components/ui-kit";

export function NeutralButtons() {
  return (
    <ComponentShowcase 
      title="03. Нейтральный / Glass" 
      source="custom" 
      desc="Второстепенные действия, навигация и системные кнопки. Используется эффект матового стекла."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="neutral"><ArrowLeft className="size-4 mr-2" />Назад</CrmButton>
          <CrmButton variant="neutral">Далее<ArrowRight className="size-4 ml-2" /></CrmButton>
          <CrmButton variant="neutral" size="icon"><ArrowLeft className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="neutralOutline"><ArrowLeft className="size-4 mr-2" />Назад</CrmButton>
          <CrmButton variant="neutralOutline">Далее<ArrowRight className="size-4 ml-2" /></CrmButton>
          <CrmButton variant="neutralOutline" size="icon"><ArrowRight className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="neutralGhost"><ArrowLeft className="size-4 mr-2" />Назад</CrmButton>
          <CrmButton variant="neutralGhost">Далее<ArrowRight className="size-4 ml-2" /></CrmButton>
          <CrmButton variant="neutralGhost" size="icon"><Download className="size-5" /></CrmButton>
        </div>
      </div>
    </ComponentShowcase>
  );
}
