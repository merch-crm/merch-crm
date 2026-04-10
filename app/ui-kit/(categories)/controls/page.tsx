"use client";

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { Switch } from "@/components/ui/switch";

// New Bento Imports
import { BentoLiquidSwitch } from "@/components/library/custom/components/controls/bento-liquid-switch";
import { BentoGestureCheckbox } from "@/components/library/custom/components/controls/bento-gesture-checkbox";
import { BentoLockSwitch } from "@/components/library/custom/components/controls/bento-lock-switch";

export default function ControlsPage() {
 return (
  <CategoryPage
   title="Управление и Контролы"
   description="Премиальные элементы управления: от жидких тумблеров до 3D-переключателей тем и интерактивных слайдеров."
  >
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pb-32">
    <ComponentShowcase title="Стандартные Переключатели" source="custom" className="col-span-1 md:col-span-2 lg:col-span-2">
     <div className="flex items-center gap-4 p-8 h-full justify-center">
      <Switch color="success" defaultChecked />
      <Switch color="dark" defaultChecked />
      <Switch color="primary" defaultChecked />
     </div>
    </ComponentShowcase>

    <ComponentShowcase title="Жидкий тумблер" source="custom" className="col-span-1 md:col-span-1 lg:col-span-1">
     <BentoLiquidSwitch />
    </ComponentShowcase>



    <ComponentShowcase title="Защитный замок" source="custom" className="col-span-1 md:col-span-1 lg:col-span-1">
     <BentoLockSwitch />
    </ComponentShowcase>


    <ComponentShowcase title="Жестовый чекбокс" source="custom" className="col-span-1 md:col-span-1 lg:col-span-2">
     <BentoGestureCheckbox />
    </ComponentShowcase>
   </div>
  </CategoryPage>
 );
}
