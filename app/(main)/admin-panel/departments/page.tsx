"use client";

import { DepartmentsTable } from "./departments-table";
import { AddDepartmentDialog } from "./add-department-dialog";
import { useState } from "react";
import { Building2 } from "lucide-react";

export default function AdminDepartmentsPage() {
    // We need to trigger a refresh in the table when a new department is added
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-normal">Отделы</h1>
                        <p className="text-slate-500 text-[11px] font-medium mt-0.5">Управление структурой компании и подразделениями</p>
                    </div>
                </div>
                <AddDepartmentDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </div>

            <DepartmentsTable key={refreshKey} />
        </div>
    );
}
