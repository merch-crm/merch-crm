import { getUserProfile } from "./actions";
import { ProfileClient } from "./profile-client";
import {
    Home,
    ChevronRight,
} from "lucide-react";

import { RoleBadge } from "@/components/ui/role-badge";

export default async function ProfilePage() {
    const { data: user, error } = await getUserProfile();

    if (error || !user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900">Ошибка</h2>
                    <p className="text-slate-500 mt-2">{error || "Пользователь не найден"}</p>
                </div>
            </div>
        );
    }

    // Mock data for activities and tasks
    const activities = [
        { id: 1, type: "order", text: "Создан заказ #2024-157", time: "30 минут назад", iconName: "PlusCircle", color: "bg-blue-500" },
        { id: 2, type: "profile", text: "Обновлен профиль клиента", time: "1 час назад", iconName: "User", color: "bg-emerald-500" },
        { id: 3, type: "offer", text: "Отправлено КП клиенту", time: "2 часа назад", iconName: "Send", color: "bg-indigo-500" },
        { id: 4, type: "completed", text: "Завершен заказ #2024-145", time: "3 часа назад", iconName: "CheckCircle2", color: "bg-orange-500" },
    ];

    const tasks = [
        { id: 1, text: "Связаться с клиентом #2024-156", time: "10:00", priority: "Высокий", priorityColor: "bg-orange-100 text-orange-700", completed: true },
        { id: 2, text: "Подготовить коммерческое предложение", time: "11:30", priority: "Срочно", priorityColor: "bg-red-100 text-red-700", completed: false },
        { id: 3, text: "Проверить статус заказа #2024-148", time: "14:00", priority: "Средний", priorityColor: "bg-yellow-100 text-yellow-700", completed: false },
        { id: 4, text: "Встреча с отделом производства", time: "15:30", priority: "Средний", priorityColor: "bg-yellow-100 text-yellow-700", completed: false },
    ];

    const employeeId = `EMP-${new Date(user.createdAt).getFullYear()}-${String(user.id).slice(-3).padStart(3, '0')}`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-slate-500 gap-2">
                <Home className="w-4 h-4" />
                <span className="cursor-pointer hover:text-slate-800">Главная</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-slate-800">Employee dashboard</span>
            </div>

            {/* Welcome Banner */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">Добро пожаловать, {user.name.split(' ')[0]}! 👋</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <RoleBadge roleName={user.role?.name} className="px-3 py-1 text-xs" />
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-400 font-medium">{user.department?.name || user.departmentLegacy || "Без отдела"}</span>
                    </div>
                </div>
            </div>

            <ProfileClient
                user={user}
                activities={activities}
                tasks={tasks}
                employeeId={employeeId}
            />
        </div>
    );
}
