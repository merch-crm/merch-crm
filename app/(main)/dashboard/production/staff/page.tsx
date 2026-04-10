import { Suspense } from "react";
import { Metadata } from "next";
import { getProductionStaff } from "../actions/staff-actions";
import { getProductionLines } from "../actions/line-actions";
import { getApplicationTypes } from "../actions/application-type-actions";
import { StaffPageClient } from "./staff-page-client";

export const metadata: Metadata = {
  title: "Сотрудники | Производство",
  description: "Управление сотрудниками производства",
};

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const [staffResult, linesResult, typesResult] = await Promise.all([
    getProductionStaff(),
    getProductionLines({ activeOnly: true }),
    getApplicationTypes({ activeOnly: true }),
  ]);

  const staff = staffResult.success ? (staffResult.data || []) : [];
  const lines = linesResult.success ? (linesResult.data || []) : [];
  const applicationTypes = typesResult.success ? (typesResult.data || []) : [];

  return (
    <Suspense fallback={<StaffPageSkeleton />}>
      <StaffPageClient initialStaff={staff} lines={lines} applicationTypes={applicationTypes} />
    </Suspense>
  );
}

function StaffPageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
