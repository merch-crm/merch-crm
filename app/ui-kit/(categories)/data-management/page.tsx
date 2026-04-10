"use client";

import React, { useState } from 'react';
import { CategoryPage, ComponentShowcase } from "@/components/ui-kit";
import { Pagination } from "@/components/ui/pagination";

// Bento Imports

import { BentoSyncNode } from "@/components/library/custom/components/data-management/bento-sync-node";
import { BentoAuditLogMini } from "@/components/library/custom/components/data-management/bento-audit-log-mini";
import { BentoBulkActionTray } from "@/components/library/custom/components/data-management/bento-bulk-action-tray";


export default function DataManagementPage() {
 const [currentPage, setCurrentPage] = useState(1);

 return (
  <CategoryPage
   title="Управление данными"
   description="Компоненты для работы с импортом, пагинацией и состояниями загрузки в стиле Midnight."
   count={4}
  >
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-3 gap-y-16">
    
    {/* 1. Default Pagination */}
    <ComponentShowcase title="Пагинация" source="custom" className="lg:col-span-2">
     <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
      <Pagination 
       currentPage={currentPage}
       totalItems={145}
       pageSize={10}
       onPageChange={setCurrentPage}
      />
     </div>
    </ComponentShowcase>

   </div>

   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-7xl mx-auto py-24">
    

    <ComponentShowcase title="Узел синхронизации" source="custom">
     <BentoSyncNode source="PostgreSQL" target="Кеш Redis" status="syncing" />
    </ComponentShowcase>

    <ComponentShowcase title="Лог аудита" source="custom">
     <BentoAuditLogMini />
    </ComponentShowcase>


    <ComponentShowcase title="Массовые действия" source="custom" className="lg:col-span-2 bg-[#1A2233] rounded-[2.5rem] p-12 flex items-center justify-center border border-slate-800 shadow-2xl">
      <BentoBulkActionTray selectedCount={28} />
    </ComponentShowcase>

   </div>
  </CategoryPage>
 );
}
