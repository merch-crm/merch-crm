import { Suspense } from "react";
import { Metadata } from "next";
import { getDesignQueue, getDesignQueueStats, DesignTaskFull } from "../actions/order-design-actions";
import { DesignQueuePageClient } from "./design-queue-page-client";

export const metadata: Metadata = {
  title: "Очередь дизайна | CRM",
  description: "Управление дизайн-задачами заказов",
};

export const dynamic = "force-dynamic";

export default async function DesignQueuePage() {
  const [queueResult, statsResult] = await Promise.all([
    getDesignQueue({ status: ["pending", "in_progress", "review", "revision"] }),
    getDesignQueueStats(),
  ]);

  const tasks = queueResult.success ? (queueResult.data || []) : [];
  const stats = statsResult.success ? (statsResult.data || null) : null;

  return (
    <Suspense fallback={<DesignQueueSkeleton />}>
      <DesignQueuePageClient initialTasks={tasks as DesignTaskFull[]} stats={stats} />
    </Suspense>
  );
}

function DesignQueueSkeleton() {
  return (
    <div className="p-6 space-y-3">
      <div className="h-10 w-64 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
