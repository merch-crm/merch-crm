"use client";

import { useEffect, useState, useCallback } from "react";
import { getRoles } from "../actions/roles.actions";
import { getDepartments } from "../actions/departments.actions";
import { Shield, Building } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AddRoleDialog } from "../roles/add-role-dialog";
import { AddDepartmentDialog } from "../departments/add-department-dialog";
import { RoleDetail, DepartmentDetail } from "@/lib/types";
import { RolesList } from "./roles-list";
import { DepartmentsList } from "./departments-list";

export default function RolesDepartmentsPage() {
    const [roles, setRoles] = useState<RoleDetail[]>([]);
    const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("roles");

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [rolesRes, deptRes] = await Promise.all([
            getRoles(),
            getDepartments()
        ]);

        if (rolesRes.success) setRoles(rolesRes.data as RoleDetail[]);
        if (deptRes.success) setDepartments(deptRes.data as DepartmentDetail[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-3 pb-20">
            <AdminPageHeader
                title="Структура и роли"
                subtitle="Управление отделами компании и правами доступа сотрудников"
                icon={Shield}
                actions={
                    <div className="flex gap-2">
                        {activeTab === "roles" ? (
                            <AddRoleDialog onSuccess={fetchData} />
                        ) : (
                            <AddDepartmentDialog onSuccess={fetchData} />
                        )}
                    </div>
                }
            />

            <Tabs defaultValue="roles" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 mb-4 h-auto w-full sm:w-auto overflow-x-auto justify-start">
                    <TabsTrigger 
                        value="roles" 
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-slate-500 transition-all gap-2"
                    >
                        <Shield className="w-4 h-4" />
                        Роли и права
                    </TabsTrigger>
                    <TabsTrigger 
                        value="departments" 
                        className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold text-slate-500 transition-all gap-2"
                    >
                        <Building className="w-4 h-4" />
                        Отделы
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="mt-0 focus-visible:outline-none">
                    <RolesList roles={roles} loading={loading} onRefresh={fetchData} />
                </TabsContent>

                <TabsContent value="departments" className="mt-0 focus-visible:outline-none">
                    <DepartmentsList departments={departments} loading={loading} onRefresh={fetchData} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
