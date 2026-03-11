import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getCollectionById, getDesignsByCollection } from "../actions/index";
import { CollectionPageClient } from "./collection-page-client";
import { CollectionPageSkeleton } from "./loading";

interface PageProps {
    params: { collectionId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { collectionId } = await params;
    const result = await getCollectionById(collectionId);

    if (!result.success || !result.data) {
        return { title: "Коллекция не найдена" };
    }

    const collection = result.data;

    return {
        title: `${collection.name} — Коллекции принтов`,
        description: collection.description || `Коллекция принтов"${collection.name}"`,
    };
}

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: PageProps) {
    const { collectionId } = await params;
    const [collectionResult, designsResult] = await Promise.all([
        getCollectionById(collectionId),
        getDesignsByCollection(collectionId),
    ]);

    if (!collectionResult.success || !collectionResult.data) {
        notFound();
    }

    return (
        <Suspense fallback={<CollectionPageSkeleton />}>
            <CollectionPageClient
                collection={collectionResult.data}
                initialDesigns={(designsResult.success && designsResult.data) ? designsResult.data : []}
            />
        </Suspense>
    );
}
