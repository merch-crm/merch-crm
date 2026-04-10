"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import Link from "next/link";
import { Calculator, ChevronRight } from "lucide-react";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

interface CalculationEntry {
 id: string;
 calculationNumber: string;
 name: string;
 calculatorType: string;
 sellingPrice: number;
 quantity: number;
 createdAt: Date;
}

interface ClientCalculationsTableProps {
 calculations: CalculationEntry[];
 currencySymbol: string;
}

export function ClientCalculationsTable({ calculations, currencySymbol }: ClientCalculationsTableProps) {
 const safeCalculations = calculations || [];
 
 return (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
   <div className="px-8 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
    <h3 className="font-bold text-slate-900 flex items-center">
     <Calculator className="w-5 h-5 mr-3 text-primary" />
     История расчётов
    </h3>
   </div>
   
   {safeCalculations.length > 0 ? (
    <ResponsiveDataView data={safeCalculations} renderTable={() => (
      <table className="crm-table">
       <thead className="crm-thead">
        <tr>
         <th className="crm-th">Номер</th>
         <th className="crm-th">Название</th>
         <th className="crm-th">Тип</th>
         <th className="crm-th">Кол-во</th>
         <th className="crm-th crm-td-number">Сумма</th>
         <th className="crm-th">Дата</th>
        </tr>
       </thead>
       <tbody className="crm-tbody">
        {safeCalculations.map((calc) => (
         <tr 
          key={calc.id} 
          className="crm-tr group hover:bg-slate-50/50 transition-colors cursor-pointer" 
          onClick={() => window.location.href = `/dashboard/production/calculators/history?id=${calc.id}`}
         >
          <td className="crm-td font-bold text-slate-900 group-hover:text-primary transition-colors">
           {calc.calculationNumber}
          </td>
          <td className="crm-td text-slate-700 font-medium truncate max-w-[200px]">
           {calc.name}
          </td>
          <td className="crm-td text-xs font-black text-slate-400">
           {calc.calculatorType}
          </td>
          <td className="crm-td text-slate-500 font-bold">
           {calc.quantity} шт.
          </td>
          <td className="crm-td crm-td-number font-black text-slate-900">
           {calc.sellingPrice.toLocaleString()} {currencySymbol}
          </td>
          <td className="crm-td text-slate-400 text-xs font-bold">
           {format(new Date(calc.createdAt), "d MMM yyyy", { locale: ru })}
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     )}
     renderCard={(calc) => (
      <Link key={calc.id} href={`/dashboard/production/calculators/history?id=${calc.id}`} className="block p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all">
       <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
         <p className="text-sm font-bold text-slate-900">
          {calc.calculationNumber}
         </p>
         <p className="text-xs font-bold text-slate-600 truncate max-w-[200px]">
          {calc.name}
         </p>
        </div>
        <div className="px-2 py-1 rounded-md bg-slate-50 text-xs font-black text-slate-400 border border-slate-100">
         {calc.calculatorType}
        </div>
       </div>
       <div className="flex justify-between items-center text-xs text-slate-400 font-bold mb-2">
         <span>{calc.quantity} шт.</span>
         <span>{format(new Date(calc.createdAt), "d MMMM yyyy", { locale: ru })}</span>
       </div>
       <div className="flex justify-between items-center">
        <div className="text-lg font-bold text-primary">
         {calc.sellingPrice.toLocaleString()} {currencySymbol}
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300" />
       </div>
      </Link>
     )}
     mobileGridClassName="grid grid-cols-1 gap-3 p-4 bg-slate-50/30"
    />
   ) : (
    <div className="p-12 text-center text-slate-400 font-bold italic">
     У этого клиента ещё нет сохранённых расчётов
    </div>
   )}
  </div>
 );
}
