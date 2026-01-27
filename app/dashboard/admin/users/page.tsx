import { getUsers } from "../actions";
import { UsersTable } from "./users-table";
import { Pagination } from "@/components/ui/pagination";
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
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-normal">Пользователи</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Управление сотрудниками и их доступом к системе</p>
                </div>
                <AddUserDialog />
            </div>

            <UsersTable
                initialUsers={users}
                error={error}
                currentPage={page}
                totalItems={total}
            />
            <Pagination
                totalItems={total}
                pageSize={limit}
                currentPage={page}
                itemName="сотрудников"
            />
        </div>
    );
}
