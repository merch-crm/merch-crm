// app/(main)/dashboard/production/calculators/layout.tsx
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Калькуляторы | Производство",
  description: "Калькуляторы стоимости нанесения",
};

function CalculatorsLayoutSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         {[...Array(6)].map((_, i) => (
           <Skeleton key={i} className="h-32 rounded-2xl" />
         ))}
      </div>
    </div>
  );
}

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* В этом layout БОЛЬШЕ НЕТ ТАБОВ для страницы выбора, они будут внутри конкретных калькуляторов если нужно */}
      
      <Suspense fallback={<CalculatorsLayoutSkeleton />}>
        <div className="flex-1 min-h-0">
           {children}
        </div>
      </Suspense>
    </div>
  );
}
