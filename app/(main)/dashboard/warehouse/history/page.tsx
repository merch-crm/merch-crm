import { getInventoryHistory } from "../actions";
import { HistoryTable, Transaction } from "../history-table";
import { getSession } from "@/lib/auth";

export const metadata = {
    title: "История | Склад",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    const { data: history = [] } = await getInventoryHistory();
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
