import { getUsers } from "../actions";
import { UsersTable } from "./users-table";
import { Pagination } from "@/components/ui/pagination";

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
