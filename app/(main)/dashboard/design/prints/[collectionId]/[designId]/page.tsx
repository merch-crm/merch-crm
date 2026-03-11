import { Suspense } from"react";
import { notFound } from"next/navigation";
import { Metadata } from"next";
import { getDesignById } from"../../actions";
import { DesignPageClient } from"./design-page-client";
import { DesignPageSkeleton } from"./loading";

interface PageProps {
 params: {
 collectionId: string;
 designId: string;
 };
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
        <Suspense fallback={<DesignPageSkeleton />}>
            <DesignPageClient design={result.data} />
        </Suspense>
    );
}
