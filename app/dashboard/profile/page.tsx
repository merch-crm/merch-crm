import { getUserProfile, getUserActivities } from "./actions";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
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

    // Fetch real activities
    const { data: logs } = await getUserActivities();

    // Helper to determine icon and color based on action text
    const getActivityStyle = (action: string) => {
        const lower = action.toLowerCase();
        if (lower.includes("создан")) return { iconName: "PlusCircle", color: "bg-blue-500" };
        if (lower.includes("обновлен") || lower.includes("изменен")) return { iconName: "User", color: "bg-emerald-500" };
        if (lower.includes("удален")) return { iconName: "Trash2", color: "bg-red-500" };
        if (lower.includes("отправлен")) return { iconName: "Send", color: "bg-indigo-500" };
        if (lower.includes("завершен")) return { iconName: "CheckCircle2", color: "bg-orange-500" };
        return { iconName: "Activity", color: "bg-slate-400" };
    };

    const activities = (logs || []).map((log, index) => {
        const style = getActivityStyle(log.action);
        return {
            id: index,
            type: "log",
            text: log.action,
            time: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ru }),
            iconName: style.iconName,
            color: style.color
        };
    });

    const tasks = [
        { id: 1, text: "Связаться с клиентом #2024-156", time: "10:00", priority: "Высокий", priorityColor: "bg-orange-100 text-orange-700", completed: true },
        { id: 2, text: "Подготовить коммерческое предложение", time: "11:30", priority: "Срочно", priorityColor: "bg-red-100 text-red-700", completed: false },
        { id: 3, text: "Проверить статус заказа #2024-148", time: "14:00", priority: "Средний", priorityColor: "bg-yellow-100 text-yellow-700", completed: false },
        { id: 4, text: "Встреча с отделом производства", time: "15:30", priority: "Средний", priorityColor: "bg-yellow-100 text-yellow-700", completed: false },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-slate-500 gap-2">
                <Home className="w-4 h-4" />
                <span className="cursor-pointer hover:text-slate-800">Главная</span>
                <ChevronRight className="w-4 h-4" />
                <span className="font-medium text-slate-800">Кабинет сотрудника</span>
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

                {user.avatar && (
                    <div className="relative z-10 h-20 w-20 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm hidden sm:block">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            <ProfileClient
                user={user}
                activities={activities}
                tasks={tasks}
            />
        </div >
    );
}
