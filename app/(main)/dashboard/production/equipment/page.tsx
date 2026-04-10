import { Suspense } from "react";
import { Metadata } from "next";
import { getEquipment, getEquipmentStats } from "../actions/equipment-actions";
import { getApplicationTypes } from "../actions/application-type-actions";
import { EquipmentPageClient } from "./equipment-page-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Оборудование | Производство",
  description: "Управление производственным оборудованием",
};

function EquipmentSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  );
}

export default async function EquipmentPage() {
  const [equipmentResult, statsResult, typesResult] = await Promise.all([
    getEquipment(),
    getEquipmentStats(),
    getApplicationTypes(),
  ]);

  const equipment = equipmentResult.success ? equipmentResult.data || [] : [];
  const stats = statsResult.success ? statsResult.data || null : null;
  const applicationTypes = typesResult.success ? typesResult.data || [] : [];

  return (
    <Suspense fallback={<EquipmentSkeleton />}>
      <EquipmentPageClient initialEquipment={equipment} initialStats={stats} applicationTypes={applicationTypes} />
    </Suspense>
  );
}
