import { getNotificationSettingsAction, NotificationSettings } from "../actions";
import { NotificationsClient } from "@/app/dashboard/admin/notifications/notifications-client";

export default async function AdminNotificationsPage() {
    const { data: settings } = await getNotificationSettingsAction();

    const defaultSettings: NotificationSettings = {
        system: { enabled: true, browserPush: false },
        telegram: { enabled: false, botToken: "", chatId: "", notifyOnNewOrder: true, notifyOnLowStock: true, notifyOnSystemError: true },
        events: { new_order: true, order_status_change: true, stock_low: true, task_assigned: true }
    };

    return <NotificationsClient initialSettings={settings || defaultSettings} />;
}
