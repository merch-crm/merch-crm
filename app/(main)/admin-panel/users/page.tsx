import { getUsers } from "../actions";
import { Users } from "lucide-react";
import { UsersTable } from "./users-table";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { AddUserDialog } from "./add-user-dialog";

export default async function AdminUsersPage({
    searchParams: searchParamsPromise,
}: {
    searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const searchParams = await searchParamsPromise;
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    const limit = 10;

    const res = await getUsers(page, limit, search);
    const users = res.success && res.data ? res.data.users : [];
    const total = res.success && res.data ? res.data.total : 0;
    const error = res.success ? undefined : res.error;

    return (
        <div className="space-y-6">
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-[12px] sm:rounded-[18px] flex items-center justify-center border border-primary/10 shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-normal truncate">Пользователи</h1>
                        <p className="hidden sm:block text-slate-500 text-[11px] font-medium mt-0.5 truncate">Управление сотрудниками и их доступом к системе</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <AddUserDialog />
                </div>
            </div>

            <UsersTable
                initialUsers={users}
                error={error}
                currentPage={page}
                totalItems={total}
            />
            <PremiumPagination
                totalItems={total}
                pageSize={limit}
                currentPage={page}
                itemName="сотрудников"
            />
        </div>
    );
}
