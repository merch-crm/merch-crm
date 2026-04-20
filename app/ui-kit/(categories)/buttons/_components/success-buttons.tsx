"use client";

import React from "react";
import { Check, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function SuccessButtons() {
 return (
  <ComponentShowcase 
   title="04. Успех / Emerald" 
   source="custom" 
   desc="Позитивные действия и успешное завершение процессов. Используется зеленый цвет Emerald."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="success"><Check className="size-4 mr-2" />Принято</Button>
     <Button color="success"><CheckCircle2 className="size-4 mr-2" />Готово</Button>
     <Button color="success" size="icon"><ShieldCheck className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="success"><Check className="size-4 mr-2" />Принято</Button>
     <Button variant="outline" color="success"><CheckCircle2 className="size-4 mr-2" />Готово</Button>
     <Button variant="outline" color="success" size="icon"><Check className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="success"><Check className="size-4 mr-2" />Принято</Button>
     <Button variant="ghost" color="success" size="icon"><CheckCircle2 className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
