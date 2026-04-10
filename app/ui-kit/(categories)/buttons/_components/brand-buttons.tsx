"use client";

import React from "react";
import { FolderPlus, Plus, Sparkles } from "lucide-react";
import { CrmButton } from "@/components/ui/crm-button";
import { ComponentShowcase } from "@/components/ui-kit";

export function BrandButtons() {
 return (
  <ComponentShowcase 
   title="06. Бренд / Indigo" 
   source="custom" 
   desc="Брендированные элементы интерфейса, связанные с категориями и фирменным стилем."
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="brand"><FolderPlus className="size-4 mr-2" />Категория</CrmButton>
     <CrmButton variant="brand"><Plus className="size-4 mr-2" />Создать</CrmButton>
     <CrmButton variant="brand" size="icon"><Sparkles className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="brandOutline"><FolderPlus className="size-4 mr-2" />Категория</CrmButton>
     <CrmButton variant="brandOutline"><Plus className="size-4 mr-2" />Позиция</CrmButton>
     <CrmButton variant="brandOutline" size="icon"><FolderPlus className="size-5" /></CrmButton>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <CrmButton variant="brandGhost"><FolderPlus className="size-4 mr-2" />Категория</CrmButton>
     <CrmButton variant="brandGhost" size="icon"><Plus className="size-5" /></CrmButton>
    </div>
   </div>
  </ComponentShowcase>
 );
}
