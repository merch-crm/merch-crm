"use client";

import React from "react";
import { FolderPlus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function BrandButtons() {
 return (
  <ComponentShowcase 
   title="06. Бренд / Purple" 
   source="custom" 
   desc="Брендированные элементы интерфейса. Используется основной цвет Primary (#5d00ff)."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="purple"><FolderPlus className="size-4 mr-2" />Категория</Button>
     <Button color="purple"><Plus className="size-4 mr-2" />Создать</Button>
     <Button color="purple" size="icon"><Sparkles className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="purple"><FolderPlus className="size-4 mr-2" />Категория</Button>
     <Button variant="outline" color="purple"><Plus className="size-4 mr-2" />Позиция</Button>
     <Button variant="outline" color="purple" size="icon"><FolderPlus className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="purple"><FolderPlus className="size-4 mr-2" />Категория</Button>
     <Button variant="ghost" color="purple" size="icon"><Plus className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
