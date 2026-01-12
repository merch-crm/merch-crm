import { getSession } from "@/lib/auth";
import {
    Home,
    Settings,
    Shield,
    Users as UsersIcon,
    History,
    Building
} from "lucide-react";
import { UsersTable } from "../admin/users/users-table";
import AdminRolesPage from "../admin/roles/page";
import { AuditLogsTable } from "../admin/audit/audit-logs-table";
import { DepartmentsTable } from "../admin/departments/departments-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function SettingsPage() {
    const session = await getSession();

    /* 
    // Secure check for Administrator role with Unicode normalization
    const isAdmin = session?.roleName && 
                   session.roleName.normalize().trim() === "Администратор".normalize();

    if (!isAdmin) {
        // Redirection logic disabled for debugging
    }
    */

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-slate-500 gap-2 font-medium">
                <Home className="w-4 h-4 cursor-pointer hover:text-slate-800 transition-colors" />
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-bold">Настройки CRM</span>
            </nav>

            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Настройки CRM</h1>
                <p className="text-slate-500 font-medium">Управление ролями, профилями пользователей и настройками доступа</p>
            </div>

            <Tabs defaultValue="departments" className="space-y-6">
                <TabsList className="bg-white border border-slate-200 p-1 h-auto gap-2 rounded-xl shadow-sm w-full md:w-auto justify-start">
                    <TabsTrigger
                        value="departments"
                        className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9"
                    >
                        <Building className="w-4 h-4 mr-2" />
                        Управление отделами
                    </TabsTrigger>
                    <TabsTrigger
                        value="roles"
                        className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Управление ролями
                    </TabsTrigger>
                    <TabsTrigger
                        value="users"
                        className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9"
                    >
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Управление профилями
                    </TabsTrigger>
                    <TabsTrigger
                        value="audit"
                        className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 px-4 py-2 h-9"
                    >
                        <History className="w-4 h-4 mr-2" />
                        Лог действий
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="departments" className="space-y-4 focus-visible:outline-none">
                    <div className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
                        <div className="mb-8 border-b border-slate-50 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Управление отделами</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Разделение компании на структурные подразделения</p>
                        </div>
                        <DepartmentsTable />
                    </div>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4 focus-visible:outline-none">
                    <div className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
                        <div className="mb-8 border-b border-slate-50 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Управление ролями</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Настройка прав доступа для разных должностей</p>
                        </div>
                        <AdminRolesPage />
                    </div>
                </TabsContent>

                <TabsContent value="users" className="space-y-4 focus-visible:outline-none">
                    <div className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
                        <div className="mb-8 border-b border-slate-50 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Управление профилями</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">Просмотр и редактирование всех зарегистрированных пользователей</p>
                        </div>
                        <UsersTable />
                    </div>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4 focus-visible:outline-none">
                    <div className="bg-white rounded-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-100">
                        <div className="mb-8 border-b border-slate-50 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Лог действий</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-0.5">История активности пользователей в системе</p>
                        </div>
                        <AuditLogsTable />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
