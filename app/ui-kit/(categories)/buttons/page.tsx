"use client";

import React from "react";
import { CategoryPage } from "@/components/ui-kit";
import { ActionButtons } from "./_components/action-buttons";
import { DangerButtons } from "./_components/danger-buttons";
import { NeutralButtons } from "./_components/neutral-buttons";
import { SuccessButtons } from "./_components/success-buttons";
import { WarningButtons } from "./_components/warning-buttons";
import { BrandButtons } from "./_components/brand-buttons";
import { DropdownMenus } from "./_components/dropdown-menus";

export default function ButtonsPage() {
 return (
  <CategoryPage 
   title="Кнопки" 
   description="Стандартизированные системные кнопки CRM, разделенные на 7 основных функциональных типов." 
   count={7}
  >
   <div className="flex flex-col gap-3">
    <ActionButtons />
    <DropdownMenus />
    <DangerButtons />
    <NeutralButtons />
    <SuccessButtons />
    <WarningButtons />
    <BrandButtons />
   </div>
  </CategoryPage>
 );
}
