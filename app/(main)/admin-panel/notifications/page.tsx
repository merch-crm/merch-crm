import { getNotificationSettingsAction, type NotificationSettings } from "../actions/notifications.actions";
import { NotificationsClient } from "@/app/(main)/admin-panel/notifications/notifications-client";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
    const res = await getNotificationSettingsAction();
    const settings = res.success ? res.data : null;

    const defaultSettings: NotificationSettings = {
        system: { enabled: true, browserPush: false },
        telegram: { enabled: false, botToken: "", chatId: "", notifyOnNewOrder: true, notifyOnLowStock: true, notifyOnSystemError: true },
        events: { new_order: true, order_status_change: true, stock_low: true, task_assigned: true }
    };

    return <NotificationsClient initialSettings={settings || defaultSettings} />;
}
