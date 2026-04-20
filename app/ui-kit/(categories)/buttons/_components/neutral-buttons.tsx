"use client";

import React from "react";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function NeutralButtons() {
 return (
  <ComponentShowcase 
   title="03. Нейтральный / Glass" 
   source="custom" 
   desc="Второстепенные действия, навигация и системные кнопки. Используется эффект матового стекла."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="neutral"><ArrowLeft className="size-4 mr-2" />Назад</Button>
     <Button color="neutral">Далее<ArrowRight className="size-4 ml-2" /></Button>
     <Button color="neutral" size="icon"><ArrowLeft className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="neutral"><ArrowLeft className="size-4 mr-2" />Назад</Button>
     <Button variant="outline" color="neutral">Далее<ArrowRight className="size-4 ml-2" /></Button>
     <Button variant="outline" color="neutral" size="icon"><ArrowRight className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="neutral"><ArrowLeft className="size-4 mr-2" />Назад</Button>
     <Button variant="ghost" color="neutral">Далее<ArrowRight className="size-4 ml-2" /></Button>
     <Button variant="ghost" color="neutral" size="icon"><Download className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
