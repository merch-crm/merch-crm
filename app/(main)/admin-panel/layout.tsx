import React from "react";
import { getCurrentUserAction } from "./actions";
import { getNotifications } from "@/components/notifications/actions";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";
import { AdminLayoutClient } from "./admin-layout-client";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const res = await getCurrentUserAction();
    const currentUser = res.data || null;

    // Fetch notifications and branding
    const notifications = await getNotifications();
    const branding = await getBrandingSettings();

    const user = currentUser ? {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        roleName: currentUser.role?.name || "Администратор",
        departmentName: currentUser.department?.name || "Руководство"
    } : null;

    if (!currentUser || !user) return null;

    return (
        <AdminLayoutClient
            currentUser={currentUser}
            user={user}
            notifications={notifications.notifications}
            branding={branding}
        >
            {children}
        </AdminLayoutClient>
    );
}
