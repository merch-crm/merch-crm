"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function NeutralButtons() {
 return (
  <ComponentShowcase 
   title="03. Нейтральный / Gray" 
   source="custom" 
   desc="Второстепенные действия, навигация и системные кнопки. Цвет: slate-500."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="gray"><ArrowLeft className="size-4 mr-2" />Назад</Button>
     <Button color="gray">Далее<ArrowRight className="size-4 ml-2" /></Button>
     <Button color="gray" size="icon"><ArrowLeft className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="gray"><ArrowLeft className="size-4 mr-2" />Назад</Button>
     <Button variant="outline" color="gray">Далее<ArrowRight className="size-4 ml-2" /></Button>
     <Button variant="outline" color="gray" size="icon"><ArrowRight className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="gray"><ArrowLeft className="size-4 mr-2" />Назад</Button>
     <Button variant="ghost" color="gray">Далее<ArrowRight className="size-4 ml-2" /></Button>
     <Button variant="ghost" color="gray" size="icon"><Download className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
