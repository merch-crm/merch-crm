"use client";

import { useEffect, useState, useMemo } from "react";
import { getUsers } from "../actions";
import { Search, User, Trash2, Edit, Users, Building } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { AddUserDialog } from "./add-user-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { EditUserDialog } from "./edit-user-dialog";

interface User {
    id: string;
    name: string;
    email: string;
    roleId: string | null;
    departmentId: string | null;
    department?: string | null;
    role?: {
        name: string;
    } | null;
}

export function UsersTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const fetchUsers = (isInitial = true) => {
        if (isInitial) setLoading(true);
        getUsers().then(res => {
            if (res.data) setUsers(res.data as User[]);
            if (isInitial) setLoading(false);
        });
    };

    useEffect(() => {
        fetchUsers(true);
        const interval = setInterval(() => fetchUsers(false), 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const query = searchQuery.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.department || "").toLowerCase().includes(query)
        );
    }, [users, searchQuery]);


    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка данных сотрудников...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск сотрудника..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <AddUserDialog onSuccess={fetchUsers} />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Сотрудник</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Роль</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Отдел</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <RoleBadge roleName={user.role?.name} className="px-3 py-1 text-[11px]" />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Building className="w-4 h-4 text-slate-400" />
                                        {user.department || "—"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-slate-100"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingUser(user)}
                                            className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-slate-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Сотрудники не найдены</p>
                    </div>
                )}
            </div>

            <DeleteUserDialog
                isOpen={!!deletingUser}
                user={deletingUser}
                onClose={() => setDeletingUser(null)}
                onSuccess={() => {
                    setDeletingUser(null);
                    fetchUsers();
                }}
            />

            <EditUserDialog
                key={editingUser?.id}
                isOpen={!!editingUser}
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSuccess={() => {
                    setEditingUser(null);
                    fetchUsers();
                }}
            />
        </div >
    );
}
