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
      <Skeleton className="h-[400px] w-full rounded-2xl" />
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
      {/* Контент калькулятора */}
      <Suspense fallback={<CalculatorsLayoutSkeleton />}>
        {children}
      </Suspense>
    </div>
  );
}
