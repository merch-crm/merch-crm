"use client";

import { useState, useCallback } from "react";
import { User as UserIcon, Trash2, Edit, Users, Building, Search, X, BarChart2, LogIn } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UserStatsDrawer } from "./user-stats-drawer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { impersonateUser } from "../actions";
import { useToast } from "@/components/ui/toast";

interface User {
    id: string;
    name: string;
    email: string;
    roleId: string | null;
    departmentId: string | null;
    department?: string | null;
    isSystem?: boolean;
    role?: {
        name: string;
        color?: string | null;
    } | null;
    department_color?: string | null;
}

interface UsersTableProps {
    initialUsers: User[];
    error?: string;
    currentPage: number;
    totalItems: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UsersTable({ initialUsers, error, currentPage, totalItems }: UsersTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingStatsUser, setViewingStatsUser] = useState<User | null>(null);
    const [impersonateUserConfirm, setImpersonateUserConfirm] = useState<User | null>(null);
    const [isImpersonatingLoading, setIsImpersonatingLoading] = useState<string | null>(null);
    const { toast } = useToast();
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
        // Debounce would be better, but for now simple update
    };

    const applySearch = () => {
        router.push(`${pathname}?${createQueryString("search", searchValue)}`);
    };

    const isAllSelected = initialUsers.length > 0 && initialUsers.every(u => selectedIds.includes(u.id));

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(initialUsers.map(u => u.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        // Prevent click events from triggering row actions if needed
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (error) {
        return (
            <div className="text-rose-600 p-6 bg-rose-50 rounded-[18px] border border-rose-100 font-bold">
                Ошибка: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Поиск сотрудника..."
                    value={searchValue}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-[18px] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 font-medium"
                />
                {searchValue && (
                    <button
                        onClick={() => { setSearchValue(""); router.push(pathname); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="bg-white shadow-sm rounded-[18px] border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-[50px] px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground  tracking-wider">Сотрудник</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground  tracking-wider">Роль</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground  tracking-wider">Отдел</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground  tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {initialUsers.map((user) => {
                                const isSelected = selectedIds.includes(user.id);
                                return (
                                    <tr
                                        key={user.id}
                                        onClick={() => setEditingUser(user)}
                                        className={cn(
                                            "hover:bg-gray-50 transition-colors group cursor-pointer",
                                            isSelected ? "bg-primary/5" : ""
                                        )}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(user.id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={cn(
                                                        "h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-sm border",
                                                        isSelected ? "bg-white border-primary/20 text-primary scale-110" : "text-white border-transparent"
                                                    )}
                                                    style={{
                                                        backgroundColor: isSelected
                                                            ? undefined
                                                            : (user.role?.color || user.department_color || "#94a3b8")
                                                    }}
                                                >
                                                    <UserIcon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-white")} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge roleName={user.role?.name} className="px-3 py-1 text-[10px] font-bold  tracking-wider" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                <Building className="w-4 h-4 text-slate-300" />
                                                {user.department || "—"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setImpersonateUserConfirm(user)}
                                                    disabled={isImpersonatingLoading === user.id}
                                                    className={cn(
                                                        "p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-[18px] transition-all",
                                                        isImpersonatingLoading === user.id && "animate-pulse"
                                                    )}
                                                    title="Войти как пользователь"
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setViewingStatsUser(user)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-[18px] transition-all"
                                                    title="Статистика"
                                                >
                                                    <BarChart2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-[18px] transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {!user.isSystem && (
                                                    <button
                                                        onClick={() => setDeletingUser(user)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-[18px] transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {initialUsers.length === 0 && (
                    <div className="text-center py-24">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                            <Users className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-base font-bold text-slate-900">Сотрудники не найдены</p>
                        <p className="text-sm text-slate-400 mt-1">Попробуйте изменить запрос или добавьте нового сотрудника</p>
                    </div>
                )}
            </div>

            <DeleteUserDialog
                isOpen={!!deletingUser}
                user={deletingUser}
                onClose={() => setDeletingUser(null)}
                onSuccess={() => {
                    setDeletingUser(null);
                    router.refresh();
                }}
            />

            <EditUserDialog
                key={editingUser?.id}
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => {
                    setEditingUser(null);
                    router.refresh();
                }}
            />

            <UserStatsDrawer
                isOpen={!!viewingStatsUser}
                userId={viewingStatsUser?.id || null}
                onClose={() => setViewingStatsUser(null)}
            />

            <ConfirmDialog
                isOpen={!!impersonateUserConfirm}
                onClose={() => setImpersonateUserConfirm(null)}
                onConfirm={async () => {
                    if (!impersonateUserConfirm) return;
                    const userId = impersonateUserConfirm.id;
                    setImpersonateUserConfirm(null);
                    setIsImpersonatingLoading(userId);
                    const res = await impersonateUser(userId);
                    if (res.success) {
                        toast(`Вы вошли как ${impersonateUserConfirm.name}`, "success");
                        window.location.href = "/dashboard";
                    } else {
                        toast(res.error || "Ошибка", "destructive");
                        setIsImpersonatingLoading(null);
                    }
                }}
                title="Имперсонация"
                description={`Вы уверены, что хотите войти в систему как ${impersonateUserConfirm?.name}?`}
                confirmText="Войти"
            />
        </div >
    );
}
