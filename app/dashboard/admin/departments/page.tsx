"use client";

import { DepartmentsTable } from "./departments-table";
import { AddDepartmentDialog } from "./add-department-dialog";
import { useState } from "react";

export default function AdminDepartmentsPage() {
    // We need to trigger a refresh in the table when a new department is added
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-normal">Отделы</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Управление структурой компании и подразделениями</p>
                </div>
                <AddDepartmentDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
            </div>

            <DepartmentsTable key={refreshKey} />
        </div>
    );
}
