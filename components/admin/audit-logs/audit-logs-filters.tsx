"use client";

import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AuditLogsFiltersProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    selectedUserId: string;
    onUserChange: (val: string) => void;
    users: Array<{ id: string; name: string }>;
    selectedEntityType: string;
    onEntityTypeChange: (val: string) => void;
    startDate: string;
    onStartDateChange: (val: string) => void;
    endDate: string;
    onEndDateChange: (val: string) => void;
    onReset: () => void;
    isAdmin?: boolean;
    onClearLogs: () => void;
    isClearing?: boolean;
}

export function AuditLogsFilters({
    searchTerm,
    onSearchChange,
    selectedUserId,
    onUserChange,
    users,
    selectedEntityType,
    onEntityTypeChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
    onReset,
    isAdmin,
    onClearLogs,
    isClearing,
}: AuditLogsFiltersProps) {
    const hasFilters = searchTerm || selectedUserId || selectedEntityType || startDate || endDate;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col xl:flex-row xl:items-end gap-4">
                <div className="flex-1 space-y-2 min-w-[200px]">
                    <label className="text-xs font-bold text-slate-400 ml-1">Поиск</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <Input
                            type="text"
                            placeholder="Действие..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                <div className="w-full xl:w-48 space-y-2">
                    <Select
                        label="Сотрудник"
                        placeholder="Все сотрудники"
                        value={selectedUserId}
                        onChange={onUserChange}
                        options={[
                            { title: "Все сотрудники", id: "" },
                            ...(users || []).map(u => ({ title: u.name, id: u.id }))
                        ]}
                        compact
                    />
                </div>

                <div className="w-full xl:w-48 space-y-2">
                    <Select
                        label="Тип объекта"
                        placeholder="Все типы"
                        value={selectedEntityType}
                        onChange={onEntityTypeChange}
                        options={[
                            { title: "Все типы", id: "" },
                            { title: "Пользователи", id: "user" },
                            { title: "Заказы", id: "order" },
                            { title: "Клиенты", id: "client" },
                            { title: "Склад", id: "inventory" },
                            { title: "Роли", id: "role" },
                            { title: "Отделы", id: "department" },
                            { title: "Система", id: "system_settings" },
                            { title: "Авторизация", id: "auth" },
                        ]}
                        compact
                    />
                </div>

                <div className="w-full xl:w-80 space-y-2">
                    <label className="text-xs font-bold text-slate-400 ml-1">Период</label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="text-xs font-bold"
                        />
                        <span className="text-slate-300">—</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="text-xs font-bold"
                        />
                    </div>
                </div>

                <div className="flex gap-2 shrink-0">
                    {hasFilters && (
                        <Button
                            variant="secondary"
                            onClick={onReset}
                            className="h-10 px-4 text-xs"
                        >
                            Сбросить
                        </Button>
                    )}
                    {isAdmin && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={onClearLogs}
                            disabled={isClearing}
                            className="h-10 w-10 bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
                            aria-label="Очистить логи аудита"
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
