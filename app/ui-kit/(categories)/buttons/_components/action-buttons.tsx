"use client";

import React from "react";
import { Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function ActionButtons() {
 return (
  <ComponentShowcase 
   title="01. Действие / Black" 
   source="custom" 
   desc="Основные действия CRM. Используется для создания, сохранения и других ключевых операций. Цвет: slate-950."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="black"><Plus className="size-4 mr-2" />Создать</Button>
     <Button color="black"><Save className="size-4 mr-2" />Сохранить</Button>
     <Button color="black" size="icon"><Plus className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="black"><Plus className="size-4 mr-2" />Создать</Button>
     <Button variant="outline" color="black"><Save className="size-4 mr-2" />Сохранить</Button>
     <Button variant="outline" color="black" size="icon"><Plus className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="black"><Plus className="size-4 mr-2" />Создать</Button>
     <Button variant="ghost" color="black" size="icon"><Plus className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="black" isLoading loadingText="Обработка...">Создать</Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
