"use client";

import { DepartmentsTable } from "./departments-table";
import { AddDepartmentDialog } from "./add-department-dialog";
import { useState } from "react";
import { Building2 } from "lucide-react";

export default function AdminDepartmentsPage() {
    // We need to trigger a refresh in the table when a new department is added
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-3 pb-20">
            <div className="flex flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-3 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-[12px] sm:rounded-[18px] flex items-center justify-center border border-primary/10 shrink-0">
                        <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">Отделы</h1>
                        <p className="hidden sm:block text-slate-500 text-[11px] font-medium mt-0.5 truncate">Управление структурой компании и подразделениями</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <AddDepartmentDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
                </div>
            </div>

            <DepartmentsTable key={refreshKey} />
        </div>
    );
}
