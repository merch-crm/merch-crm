import { getUserProfile, getUserActivities } from "./actions";
import { formatDistanceToNow, format } from "date-fns";
import { ru } from "date-fns/locale";
import { ProfileClient } from "./ProfileClient";

// Profile page server component
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
        if (lower.includes("отправлен")) return { iconName: "Send", color: "bg-primary" };
        if (lower.includes("завершен")) return { iconName: "CheckCircle2", color: "bg-orange-500" };
        return { iconName: "Activity", color: "bg-slate-400" };
    };

    // Group logs: if action contains "(массово)", group consecutive identical ones close in time
    const groupedLogs: typeof logs = [];
    if (logs && logs.length > 0) {
        let lastLog = logs[0];
        groupedLogs.push(lastLog);

        for (let i = 1; i < logs.length; i++) {
            const currentLog = logs[i];
            const isMass = currentLog.action.includes("(массово)");
            const prevWasMass = lastLog.action.includes("(массово)");
            const sameAction = currentLog.action === lastLog.action;
            const timeDiff = Math.abs(new Date(currentLog.createdAt).getTime() - new Date(lastLog.createdAt).getTime());
            const closeInTime = timeDiff < 60000; // 1 minute

            if (isMass && prevWasMass && sameAction && closeInTime) {
                // Skip adding to groupedLogs, effectively collapsing it
                continue;
            } else {
                groupedLogs.push(currentLog);
                lastLog = currentLog;
            }
        }
    }

    const activities = (groupedLogs || []).slice(0, 5).map((log, index) => {
        const style = getActivityStyle(log.action);
        const exactTime = format(new Date(log.createdAt), "HH:mm");
        const relativeTime = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: ru });

        return {
            id: index,
            type: "log",
            text: log.action,
            time: `${exactTime} (${relativeTime})`,
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
        <ProfileClient
            user={user}
            activities={activities}
            tasks={tasks}
        />
    );
}
