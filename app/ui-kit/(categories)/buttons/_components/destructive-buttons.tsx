"use client";

import React from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function DestructiveButtons() {
 return (
  <ComponentShowcase 
   title="03. Деструктивные / Danger" 
   source="custom" 
   desc="Системные кнопки для удаления или отмены действий."
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="red"><Trash2 className="size-4 mr-2" />Удалить</Button>
     <Button color="red"><X className="size-4 mr-2" />Отмена</Button>
     <Button color="red" size="icon"><Trash2 className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="red"><Trash2 className="size-4 mr-2" />Удалить</Button>
     <Button variant="outline" color="red"><X className="size-4 mr-2" />Отмена</Button>
     <Button variant="outline" color="red" size="icon"><X className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="red"><Trash2 className="size-4 mr-2" />Удалить</Button>
     <Button variant="ghost" color="red" size="icon"><Trash2 className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="red" isLoading loadingText="Удаление...">Удалить</Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
