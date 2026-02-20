import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { User } from "@/lib/types";

export function useUsersTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingStatsUser, setViewingStatsUser] = useState<User | null>(null);
    const [impersonateUserConfirm, setImpersonateUserConfirm] = useState<User | null>(null);
    const [isImpersonatingLoading, setIsImpersonatingLoading] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            if (name === "search") params.delete("page"); // Reset page on search
            return params.toString();
        },
        [searchParams]
    );

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const applySearch = () => {
        router.push(`${pathname}?${createQueryString("search", searchValue)}`);
    };

    const handleSelectAll = (initialUsers: User[], checked: boolean) => {
        if (checked) {
            setSelectedIds(initialUsers.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return {
        state: {
            selectedIds,
            deletingUser,
            editingUser,
            viewingStatsUser,
            impersonateUserConfirm,
            isImpersonatingLoading,
            searchValue,
        },
        actions: {
            setSelectedIds,
            setDeletingUser,
            setEditingUser,
            setViewingStatsUser,
            setImpersonateUserConfirm,
            setIsImpersonatingLoading,
            setSearchValue,
            handleSearch,
            applySearch,
            handleSelectAll,
            handleSelectRow
        },
        router,
        pathname
    };
}
