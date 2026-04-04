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
      count={4}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-32">
        <ComponentShowcase title="Стандартные Переключатели" source="custom">
          <div className="flex items-center gap-3 p-8 bg-gray-50 rounded-3xl border border-gray-100 h-full justify-center">
            <Switch variant="success" defaultChecked />
            <Switch variant="dark" defaultChecked />
            <Switch variant="primary" defaultChecked />
          </div>
        </ComponentShowcase>

        <ComponentShowcase title="Жидкий тумблер" source="custom">
          <BentoLiquidSwitch />
        </ComponentShowcase>



        <ComponentShowcase title="Защитный замок" source="custom">
          <BentoLockSwitch />
        </ComponentShowcase>


        <ComponentShowcase title="Жестовый чекбокс" source="custom">
          <BentoGestureCheckbox />
        </ComponentShowcase>
      </div>
    </CategoryPage>
  );
}
