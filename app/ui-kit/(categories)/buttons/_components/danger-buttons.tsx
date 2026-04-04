"use client";

import React from "react";
import { Trash2, X } from "lucide-react";
import { CrmButton } from "@/components/ui/crm-button";
import { ComponentShowcase } from "@/components/ui-kit";

export function DangerButtons() {
  return (
    <ComponentShowcase 
      title="02. Опасность / Rose" 
      source="custom" 
      desc="Кнопки для удаления контента или необратимых действий. Используется красный акцент."
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="danger"><Trash2 className="size-4 mr-2" />Удалить</CrmButton>
          <CrmButton variant="danger"><X className="size-4 mr-2" />Отмена</CrmButton>
          <CrmButton variant="danger" size="icon"><Trash2 className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="dangerOutline"><Trash2 className="size-4 mr-2" />Удалить</CrmButton>
          <CrmButton variant="dangerOutline"><X className="size-4 mr-2" />Отмена</CrmButton>
          <CrmButton variant="dangerOutline" size="icon"><X className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="dangerGhost"><Trash2 className="size-4 mr-2" />Удалить</CrmButton>
          <CrmButton variant="dangerGhost" size="icon"><Trash2 className="size-5" /></CrmButton>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <CrmButton variant="danger" isLoading loadingText="Удаление...">Удалить</CrmButton>
        </div>
      </div>
    </ComponentShowcase>
  );
}
