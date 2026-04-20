"use client";

import React from "react";
import { FolderPlus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
     <Button color="system"><FolderPlus className="size-4 mr-2" />Категория</Button>
     <Button color="system"><Plus className="size-4 mr-2" />Создать</Button>
     <Button color="system" size="icon"><Sparkles className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="system"><FolderPlus className="size-4 mr-2" />Категория</Button>
     <Button variant="outline" color="system"><Plus className="size-4 mr-2" />Позиция</Button>
     <Button variant="outline" color="system" size="icon"><FolderPlus className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="system"><FolderPlus className="size-4 mr-2" />Категория</Button>
     <Button variant="ghost" color="system" size="icon"><Plus className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
