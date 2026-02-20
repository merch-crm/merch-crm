"use client";

import { User as UserIcon, Trash2, Edit, Users, Building, Search, X, BarChart2, LogIn, MoreVertical } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { UserStatsDrawer } from "./user-stats-drawer";
import { useRouter } from "next/navigation";
import { cn, handleA11yKeyDown } from "@/lib/utils";
import { impersonateUser } from "../actions/security.actions";;
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useUsersTable } from "./hooks/use-users-table";

import type { User } from "@/lib/types";

// User interface is now imported from @/lib/types

interface UsersTableProps {
    initialUsers: User[];
    error?: string;
    currentPage: number;
    totalItems: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function UsersTable({ initialUsers, error, currentPage, totalItems }: UsersTableProps) {
    const { state, actions, router, pathname } = useUsersTable();
    const { toast } = useToast();

    const isAllSelected = initialUsers.length > 0 && initialUsers.every(u => state.selectedIds.includes(u.id));

    if (error) {
        return (
            <div className="text-rose-600 p-6 bg-rose-50 rounded-[18px] border border-rose-100 font-bold">
                Ошибка: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                <Input
                    type="text"
                    placeholder="Поиск сотрудника..."
                    value={state.searchValue}
                    onChange={(e) => actions.handleSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && actions.applySearch()}
                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-[18px] shadow-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 font-medium h-12"
                />
                {state.searchValue && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { actions.setSearchValue(""); router.push(pathname); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 h-auto w-auto p-0 hover:bg-transparent"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            <ResponsiveDataView
                data={initialUsers}
                mobileGridClassName="grid grid-cols-1 gap-4 md:hidden"
                desktopClassName="hidden md:block"
                renderTable={() => (
                    <div className="crm-card !p-0">
                        <div className="overflow-x-auto">
                            <table className="crm-table">
                                <thead className="crm-thead">
                                    <tr>
                                        <th className="crm-th crm-td-selection">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                                checked={isAllSelected}
                                                onChange={(e) => actions.handleSelectAll(initialUsers, e.target.checked)}
                                            />
                                        </th>
                                        <th className="crm-th">Сотрудник</th>
                                        <th className="crm-th">Роль</th>
                                        <th className="crm-th">Отдел</th>
                                        <th className="crm-th crm-td-actions">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="crm-tbody">
                                    {initialUsers.map((user) => {
                                        const isSelected = state.selectedIds.includes(user.id);
                                        return (
                                            <tr
                                                key={user.id}
                                                onClick={() => actions.setEditingUser(user)}
                                                className={cn(
                                                    "crm-tr-clickable",
                                                    isSelected && "crm-tr-selected"
                                                )}
                                            >
                                                <td className="crm-td crm-td-selection" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                                        checked={isSelected}
                                                        onChange={() => actions.handleSelectRow(user.id)}
                                                    />
                                                </td>
                                                <td className="crm-td">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={cn(
                                                                "h-10 w-10 rounded-full flex items-center justify-center transition-all shadow-sm border",
                                                                isSelected ? "bg-white border-primary/20 text-primary scale-110" : "text-white border-transparent"
                                                            )}
                                                            style={{
                                                                backgroundColor: isSelected
                                                                    ? undefined
                                                                    : (typeof user.role === 'object' ? user.role?.color : null) || user.department_color || "#94a3b8"
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
                                                <td className="crm-td">
                                                    <RoleBadge roleName={typeof user.role === 'object' ? user.role?.name : user.role} className="px-3 py-1 text-xs font-bold" />
                                                </td>
                                                <td className="crm-td">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                                        <Building className="w-4 h-4 text-slate-300" />
                                                        {user.department || "—"}
                                                    </div>
                                                </td>
                                                <td className="crm-td crm-td-actions" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => actions.setImpersonateUserConfirm(user)}
                                                            disabled={state.isImpersonatingLoading === user.id}
                                                            className={cn(
                                                                "p-2 text-slate-400 hover:text-amber-600 hover:bg-white rounded-[18px] transition-all h-auto w-auto",
                                                                state.isImpersonatingLoading === user.id && "animate-pulse"
                                                            )}
                                                            title="Войти как пользователь"
                                                        >
                                                            <LogIn className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => actions.setViewingStatsUser(user)}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-[18px] transition-all h-auto w-auto"
                                                            title="Статистика"
                                                        >
                                                            <BarChart2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => actions.setEditingUser(user)}
                                                            className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-[18px] transition-all h-auto w-auto"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        {!user.isSystem && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => actions.setDeletingUser(user)}
                                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-[18px] transition-all h-auto w-auto"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
                }
                renderCard={(user) => {
                    const isSelected = state.selectedIds.includes(user.id);
                    return (
                        <div role="button" tabIndex={0}
                            key={user.id}
                            className={cn(
                                "bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 active:scale-[0.98] transition-all",
                                isSelected ? "crm-tr-selected" : ""
                            )}
                            onKeyDown={(e) => handleA11yKeyDown(e, () => actions.setEditingUser(user))}
                            onClick={() => actions.setEditingUser(user)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm border border-transparent"
                                        style={{ backgroundColor: (typeof user.role === 'object' ? user.role?.color : null) || user.department_color || "#94a3b8" }}
                                    >
                                        <UserIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                        <div className="text-xs font-medium text-slate-400">{(typeof user.role === 'object' ? user.role?.name : user.role) || "Сотрудник"}</div>
                                    </div>
                                </div>
                                <div role="button" tabIndex={0} onKeyDown={(e) => handleA11yKeyDown(e, () => e.stopPropagation())} onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                <MoreVertical className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                            <DropdownMenuItem onClick={() => actions.setImpersonateUserConfirm(user)} className="gap-2 font-bold">
                                                <LogIn className="w-4 h-4" />
                                                Войти как
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => actions.setViewingStatsUser(user)} className="gap-2 font-bold">
                                                <BarChart2 className="w-4 h-4" />
                                                Статистика
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => actions.setEditingUser(user)} className="gap-2 font-bold">
                                                <Edit className="w-4 h-4" />
                                                Изменить
                                            </DropdownMenuItem>
                                            {!user.isSystem && (
                                                <DropdownMenuItem onClick={() => actions.setDeletingUser(user)} className="gap-2 font-bold text-rose-600">
                                                    <Trash2 className="w-4 h-4" />
                                                    Удалить
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <Building className="w-3.5 h-3.5 opacity-50" />
                                    {user.department || "Нет отдела"}
                                </div>
                                <div role="button" tabIndex={0} onKeyDown={(e) => handleA11yKeyDown(e, () => e.stopPropagation())} onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-primary focus:ring-0 h-4 w-4"
                                        checked={isSelected}
                                        onChange={() => actions.handleSelectRow(user.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
            {
                initialUsers.length === 0 && (
                    <EmptyState
                        icon={Users}
                        title="Сотрудники не найдены"
                        description="Попробуйте изменить запрос или добавьте нового сотрудника"
                    />
                )
            }

            <DeleteUserDialog
                isOpen={!!state.deletingUser}
                user={state.deletingUser}
                onClose={() => actions.setDeletingUser(null)}
                onSuccess={() => {
                    actions.setDeletingUser(null);
                    router.refresh();
                }}
            />

            <EditUserDialog
                key={state.editingUser?.id}
                isOpen={!!state.editingUser}
                user={state.editingUser}
                onClose={() => actions.setEditingUser(null)}
                onSuccess={() => {
                    actions.setEditingUser(null);
                    router.refresh();
                }}
            />

            <UserStatsDrawer
                isOpen={!!state.viewingStatsUser}
                userId={state.viewingStatsUser?.id || null}
                onClose={() => actions.setViewingStatsUser(null)}
            />

            <ConfirmDialog
                isOpen={!!state.impersonateUserConfirm}
                onClose={() => actions.setImpersonateUserConfirm(null)}
                onConfirm={async () => {
                    if (!state.impersonateUserConfirm) return;
                    const userId = state.impersonateUserConfirm.id;
                    actions.setImpersonateUserConfirm(null);
                    actions.setIsImpersonatingLoading(userId);
                    const res = await impersonateUser(userId);
                    if (res.success) {
                        toast(`Вы вошли как ${state.impersonateUserConfirm.name}`, "success");
                        playSound("notification_success");
                        window.location.href = "/dashboard";
                    } else {
                        toast(res.error || "Ошибка", "destructive");
                        playSound("notification_error");
                        actions.setIsImpersonatingLoading(null);
                    }
                }}
                title="Имперсонация"
                description={`Вы уверены, что хотите войти в систему как ${state.impersonateUserConfirm?.name}?`}
                confirmText="Войти"
            />
        </div >
    );
}
