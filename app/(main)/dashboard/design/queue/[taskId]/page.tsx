import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDesignTask } from "../../actions/order-design-actions";
import { DesignTaskPageClient } from "./design-task-page-client";
import { BreadcrumbLabelSync } from "@/components/layout/breadcrumb-label-sync";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { taskId } = await params;
  const result = await getDesignTask(taskId);

  if (!result.success || !result.data) {
    return { title: "Задача не найдена" };
  }

  return {
    title: `${result.data.number} | Дизайн-задача`,
    description: result.data.title,
  };
}

export default async function DesignTaskPage({ params }: PageProps) {
  const { taskId } = await params;
  const result = await getDesignTask(taskId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-3">
      <BreadcrumbLabelSync id={taskId} label={result.data.number} />
      <DesignTaskPageClient task={result.data} />
    </div>
  );
}
