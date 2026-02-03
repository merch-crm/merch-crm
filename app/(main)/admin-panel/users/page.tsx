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

    const { data: users = [], total = 0, error } = await getUsers(page, limit, search);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-normal">Пользователи</h1>
                        <p className="text-slate-500 text-[11px] font-medium mt-0.5">Управление сотрудниками и их доступом к системе</p>
                    </div>
                </div>
                <AddUserDialog />
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
