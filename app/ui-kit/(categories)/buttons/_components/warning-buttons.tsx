"use client";

import React from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComponentShowcase } from "@/components/ui-kit";

export function WarningButtons() {
 return (
  <ComponentShowcase 
   title="05. Предупреждение / Amber" 
   source="custom" 
   desc="Действия, требующие внимания, или промежуточные статусы. Используется теплый оттенок Amber."
   code='import { Button } from "@/components/ui/button";'
  >
   <div className="flex flex-col gap-3">
    <div className="flex flex-wrap gap-3 items-center">
     <Button color="warning"><AlertTriangle className="size-4 mr-2" />Внимание</Button>
     <Button color="warning"><Info className="size-4 mr-2" />Детали</Button>
     <Button color="warning" size="icon"><AlertCircle className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="outline" color="warning"><AlertTriangle className="size-4 mr-2" />Внимание</Button>
     <Button variant="outline" color="warning"><AlertCircle className="size-4 mr-2" />Инфо</Button>
     <Button variant="outline" color="warning" size="icon"><Info className="size-5" /></Button>
    </div>
    <div className="flex flex-wrap gap-3 items-center">
     <Button variant="ghost" color="warning"><AlertTriangle className="size-4 mr-2" />Сигнал</Button>
     <Button variant="ghost" color="warning" size="icon"><AlertTriangle className="size-5" /></Button>
    </div>
   </div>
  </ComponentShowcase>
 );
}
