"use client";

import React from "react";
import { Check, CheckCircle2, ShieldCheck } from "lucide-react";
import { CrmButton } from "@/components/ui/crm-button";
import { ComponentShowcase } from "@/components/ui-kit";

export function SuccessButtons() {
 return (
  <ComponentShowcase 
   title="04. Успех / Emerald" 
   source="custom" 
   desc="Позитивные действия и успешное завершение процессов. Используется зеленый цвет Emerald."
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton color="success"><Check className="size-4 mr-2" />Принято</CrmButton>
     <CrmButton color="success"><CheckCircle2 className="size-4 mr-2" />Готово</CrmButton>
     <CrmButton color="success" size="icon"><ShieldCheck className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="successOutline"><Check className="size-4 mr-2" />Принято</CrmButton>
     <CrmButton variant="successOutline"><CheckCircle2 className="size-4 mr-2" />Готово</CrmButton>
     <CrmButton variant="successOutline" size="icon"><Check className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="successGhost"><Check className="size-4 mr-2" />Принято</CrmButton>
     <CrmButton variant="successGhost" size="icon"><CheckCircle2 className="size-5" /></CrmButton>
    </div>
   </div>
  </ComponentShowcase>
 );
}
