import { getArchivedItems } from "../actions";
import { ArchiveTable } from "../archive-table";
import { InventoryItem } from "../types";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
    const { data: archivedItems = [] } = await getArchivedItems();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <ArchiveTable items={archivedItems as InventoryItem[]} />
        </div>
    );
}
