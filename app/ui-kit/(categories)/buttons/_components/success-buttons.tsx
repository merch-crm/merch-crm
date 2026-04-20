"use client";

import React from "react";
import { Check, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function SuccessButtons() {
 return (
  <ComponentShowcase 
   title="04. Успех / Green" 
   source="custom" 
   desc="Позитивные действия и успешное завершение процессов. Цвет: emerald-500."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="green"><Check className="size-4 mr-2" />Принято</Button>
     <Button color="green"><CheckCircle2 className="size-4 mr-2" />Готово</Button>
     <Button color="green" size="icon"><ShieldCheck className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="green"><Check className="size-4 mr-2" />Принято</Button>
     <Button variant="outline" color="green"><CheckCircle2 className="size-4 mr-2" />Готово</Button>
     <Button variant="outline" color="green" size="icon"><Check className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="green"><Check className="size-4 mr-2" />Принято</Button>
     <Button variant="ghost" color="green" size="icon"><CheckCircle2 className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
