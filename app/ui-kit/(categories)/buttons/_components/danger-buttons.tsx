"use client";

import React from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
     <Button color="danger"><Trash2 className="size-4 mr-2" />Удалить</Button>
     <Button color="danger"><X className="size-4 mr-2" />Отмена</Button>
     <Button color="danger" size="icon"><Trash2 className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="danger"><Trash2 className="size-4 mr-2" />Удалить</Button>
     <Button variant="outline" color="danger"><X className="size-4 mr-2" />Отмена</Button>
     <Button variant="outline" color="danger" size="icon"><X className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="danger"><Trash2 className="size-4 mr-2" />Удалить</Button>
     <Button variant="ghost" color="danger" size="icon"><Trash2 className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="danger" isLoading loadingText="Удаление...">Удалить</Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
