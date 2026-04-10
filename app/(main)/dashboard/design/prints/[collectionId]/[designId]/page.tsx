import { Suspense } from"react";
import { notFound } from"next/navigation";
import { Metadata } from"next";
import { getDesignById } from"../../actions";
import { DesignPageClient } from"./design-page-client";
import { DesignPageSkeleton } from "./loading";
import { BreadcrumbLabelSync } from "@/components/layout/breadcrumb-label-sync";

interface PageProps {
  params: Promise<{
    collectionId: string;
    designId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { designId } = await params;
  const result = await getDesignById(designId);

  if (!result.success || !result.data) {
    return { title: "Принт не найден" };
  }

  const design = result.data;

  return {
    title: `${design.name} — ${design.collection.name}`,
    description: design.description || `Принт "${design.name}"`,
  };
}

export const dynamic = "force-dynamic";

export default async function DesignPage({ params }: PageProps) {
  const { collectionId, designId } = await params;
  const result = await getDesignById(designId);

  if (!result.success || !result.data || result.data.collectionId !== collectionId) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-3">
      <BreadcrumbLabelSync id={designId} label={result.data.name} />
      <Suspense fallback={<DesignPageSkeleton />}>
        <DesignPageClient design={result.data} />
      </Suspense>
    </div>
  );
}
