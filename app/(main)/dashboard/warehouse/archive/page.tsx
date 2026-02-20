import { getArchivedItems } from "../item-actions";;
import { ArchiveTable } from "../archive-table";
import { InventoryItem } from "../types";

export const metadata = {
    title: "Архив | Склад",
};

export const dynamic = "force-dynamic";

export default async function ArchivePage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; search?: string; sortBy?: string }>
}) {
    const params = await searchParams;
    const res = await getArchivedItems({
        page: Number(params.page) || 1,
        limit: 20,
        search: params.search,
        sortBy: params.sortBy || "archivedAt"
    });

    const items = res.success && res.data ? res.data.items : [];
    const total = res.success && res.data ? res.data.total : 0;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <ArchiveTable
                items={items as InventoryItem[]}
                total={total}
            />
        </div>
    );
}

