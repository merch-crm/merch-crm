"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { CrmButton } from "@/components/ui/crm-button";
import { ComponentShowcase } from "@/components/ui-kit";

export function WarningButtons() {
  return (
    <ComponentShowcase 
      title="05. Предупреждение / Amber" 
      source="custom" 
      desc="Действия, требующие внимания, или промежуточные статусы. Используется теплый оттенок Amber."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="warning"><AlertTriangle className="size-4 mr-2" />Внимание</CrmButton>
          <CrmButton variant="warning"><Info className="size-4 mr-2" />Детали</CrmButton>
          <CrmButton variant="warning" size="icon"><AlertCircle className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="warningOutline"><AlertTriangle className="size-4 mr-2" />Внимание</CrmButton>
          <CrmButton variant="warningOutline"><AlertCircle className="size-4 mr-2" />Инфо</CrmButton>
          <CrmButton variant="warningOutline" size="icon"><Info className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="warningGhost"><AlertTriangle className="size-4 mr-2" />Сигнал</CrmButton>
          <CrmButton variant="warningGhost" size="icon"><AlertTriangle className="size-5" /></CrmButton>
        </div>
      </div>
    </ComponentShowcase>
  );
}
