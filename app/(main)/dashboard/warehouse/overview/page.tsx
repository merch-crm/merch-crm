import { Suspense } from "react";
import { WarehouseWidgetsContainer } from "../categories/widgets-container";
import { WarehouseWidgetsSkeleton } from "../warehouse-widgets";
import { PageContainer } from "@/components/ui/page-container";

export const metadata = {
    title: "Склад | Обзор",
};

export const dynamic = "force-dynamic";

export default function WarehouseOverviewPage() {
    return (
        <PageContainer>
            <Suspense fallback={<WarehouseWidgetsSkeleton />}>
                <WarehouseWidgetsContainer />
            </Suspense>
        </PageContainer>
    );
}
