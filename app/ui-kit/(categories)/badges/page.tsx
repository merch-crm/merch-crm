"use client";

import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";

import { ChipStatuses } from "@/components/library/custom/components/status-chips";
import { StatusChipsGroup } from "@/components/ui/premium/status-chips";

export default function BadgesPage() {
  return (
    <CategoryPage title="Бейджи и Теги" description="Бейджи статусов, теги для фильтрации, индикаторы Lead Score и элементы клавиатуры (Kbd)." count={2}>
      <div className="mt-16 mb-8 w-full">
        <h2 className="text-3xl font-black font-heading  mb-2">Bento CRM Badges</h2>
        <p className="text-muted-foreground">Микро-элементы с пружинной анимацией, градиентным сиянием и сложными состояниями специально для CRM-интерфейсов.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full max-w-7xl mx-auto items-stretch border-t border-border pt-8">
        


        <ComponentShowcase 
          title="Чипсы статуса" 
          source="gravity" 
          desc="Компактные статусы в стиле Gravity UI с иконками." 
          code={`<ChipStatuses />`}
        >
          <div className="flex justify-center w-full py-4">
             <ChipStatuses />
          </div>
        </ComponentShowcase>

        <ComponentShowcase 
          title="Премиальные статусы" 
          source="custom" 
          desc="Люксовые индикаторы состояния с мягкими цветами и Apple-эстетикой." 
          code={`<StatusChipsGroup />`}
        >
          <div className="flex justify-center w-full py-4">
             <StatusChipsGroup />
          </div>
        </ComponentShowcase>

      </div>
    </CategoryPage>
  );
}
