import { getInventoryHistory } from "../history-actions";
import { HistoryTable } from "../history-table";
import { type Transaction } from "../history-types";
import { getSession } from "@/lib/auth";

export const metadata = {
    title: "История | Склад",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const result = await getInventoryHistory();
    const history = result.success ? (result.data || []) : [];
    const session = await getSession();

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <HistoryTable
                transactions={history as Transaction[]}
                isAdmin={session?.roleName === "Администратор"}
            />
        </div>
    );
}
