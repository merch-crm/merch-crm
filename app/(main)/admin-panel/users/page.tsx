import { getUsers } from "../actions/users.actions";;
import { Users } from "lucide-react";
import { UsersTable } from "./users-table";
import { Pagination } from "@/components/ui/pagination";
import { AddUserDialog } from "./add-user-dialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import type { User } from "@/lib/types";

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
    const users = res.success && res.data ? (res.data.users as unknown as User[]) : [];
    const total = res.success && res.data ? res.data.total : 0;
    const error = res.success ? undefined : res.error;

    return (
        <div className="space-y-3">
            <AdminPageHeader
                title="Пользователи"
                subtitle="Управление сотрудниками и их доступом к системе"
                icon={Users}
                actions={<AddUserDialog />}
            />

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
