// app/(main)/dashboard/production/page.tsx
import { Suspense } from "react";
import { ProductionBentoDashboard } from "./components/bento/production-bento-dashboard";
import { ProductionDashboardSkeleton } from "./components/bento/bento-skeleton";
import { getAllDashboardData } from "./actions/bento-dashboard-actions";

export const metadata = {
 title: "Производство | MerchCRM",
 description: "Управление производственными процессами",
};

export const dynamic = "force-dynamic";

async function ProductionDashboardData() {
 const result = await getAllDashboardData("week");

 if (!result.success || !result.data) {
  return (
   <div className="p-8 text-center bg-white rounded-xl border border-rose-100 shadow-sm">
    <h2 className="text-xl font-bold text-rose-600 mb-2">Ошибка загрузки данных</h2>
    <p className="text-slate-500">{result.error || "Не удалось загрузить данные дашборда"}</p>
   </div>
  );
 }

 return <ProductionBentoDashboard data={result.data} />;
}


export default function ProductionPage() {
 return (
  <div className="flex flex-col gap-3 max-w-[1480px] mx-auto pb-8 w-full">
   <Suspense fallback={<ProductionDashboardSkeleton />}>
     <ProductionDashboardData />
   </Suspense>
  </div>
 );
}
