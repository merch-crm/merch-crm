import React from "react";
import { getCurrentUserAction } from "./actions/users.actions";;
import { getNotifications } from "@/components/notifications/actions";
import { getBrandingAction } from "@/app/(main)/admin-panel/actions";
import { BrandingSettings } from "@/lib/types";
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
    const brandingRes = await getBrandingAction();
    const branding: BrandingSettings = (brandingRes.success && brandingRes.data) ? brandingRes.data : {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        faviconUrl: null,
        backgroundColor: "#f2f2f2",
        currencySymbol: "₽"
    } as BrandingSettings;

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
