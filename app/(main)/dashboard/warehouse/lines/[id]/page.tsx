import { notFound } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { LineDetailClient } from "./line-detail-client";
import { getLineById } from "../actions";
import { getInventoryItems } from "../../actions";
import { BreadcrumbLabelSync } from "@/components/layout/breadcrumb-label-sync";

interface LinePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LinePageProps) {
  const { id } = await params;
  const result = await getLineById(id);
  return {
    title: result.success && result.data
      ? `${result.data.name} | Линейка`
      : "Линейка не найдена",
  };
}

export default async function LinePage({ params }: LinePageProps) {
  const { id } = await params;
  const lineResult = await getLineById(id);

  if (!lineResult.success || !lineResult.data) {
    notFound();
  }

  const line = lineResult.data;

  // Загружаем позиции этой линейки
  const itemsResult = await getInventoryItems({
    productLineId: id,
    showArchived: false,
  });

  const items = itemsResult.success && itemsResult.data ? itemsResult.data.items : [];

  return (
    <PageContainer>
      <BreadcrumbLabelSync id={id} label={line.name} />
      <LineDetailClient line={line} items={items} />
    </PageContainer>
  );
}
