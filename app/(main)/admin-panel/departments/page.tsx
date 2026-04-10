"use client";



import { DepartmentsTable } from "./departments-table";
import { AddDepartmentDialog } from "./add-department-dialog";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminDepartmentsPage() {
  // We need to trigger a refresh in the table when a new department is added
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-3 pb-20">
      <AdminPageHeader title="Отделы" subtitle="Управление структурой компании и подразделениями" icon={Building2} actions={<AddDepartmentDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />}
      />

      <DepartmentsTable key={refreshKey} />
    </div>
  );
}
