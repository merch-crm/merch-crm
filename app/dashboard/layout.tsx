import { Navbar } from "@/components/layout/navbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ActivityTracker } from "@/components/layout/activity-tracker";
import { getNotifications } from "@/components/notifications/actions";
import { getBrandingSettings } from "@/app/dashboard/admin/branding/actions";
import { NotificationManager } from "@/components/notifications/notification-manager";
import { CommandMenu } from "@/components/layout/command-menu";
import { checkAndRunNotifications } from "@/app/dashboard/notifications-actions";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { GlobalUndo } from "@/components/global-undo";

interface BrandingSettings {
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    faviconUrl: string | null;
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/api/auth/logout");
    }

    let userData = null;
    try {
        userData = await db.query.users.findFirst({
            where: eq(users.id, session.id),
            with: {
                role: true,
                department: true
            }
        });
    } catch (error) {
        console.error("Error loading user in layout:", error);
    }

    if (!userData) {
        redirect("/api/auth/logout");
    }

    const user = {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        roleName: userData.role?.name || "Пользователь",
        departmentName: userData.department?.name || ""
    };

    // Fetch notifications
    await checkAndRunNotifications(); // Run daily checks if needed
    const notifications = await getNotifications();

    // Fetch branding settings
    const branding = (await getBrandingSettings() as BrandingSettings) || {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        faviconUrl: null
    };

    // Maintenance Mode Check
    try {
        const maintenanceSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "maintenance_mode")
        });

        if (maintenanceSetting?.value === true && user.roleName !== "Администратор") {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-[14px] shadow-xl p-8 text-center border border-slate-100">
                        <div className="w-20 h-20 bg-indigo-50 rounded-[14px] flex items-center justify-center mx-auto mb-6 text-indigo-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                        </div>
                        <h1 className="text-xl font-black text-slate-800 mb-2">Технические работы</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Система временно недоступна для проведения планового обслуживания. Пожалуйста, зайдите позже.
                        </p>
                        <div className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            CRM Maintenance
                        </div>
                    </div>
                </div>
            );
        }
    } catch (e) {
        console.error("Maintenance check failed:", e);
    }

    return (
        <>
            {/* Dynamic Primary Color */}
            <style dangerouslySetInnerHTML={{
                __html: `:root { --primary: ${branding.primaryColor}; }`
            }} />

            <PullToRefresh>
                <div className="min-h-screen pb-24 md:pb-0">
                    <GlobalUndo />
                    <CommandMenu />
                    <ActivityTracker />
                    <NotificationManager
                        initialUnreadCount={notifications.filter(n => !n.isRead).length}
                        userId={session.id}
                    />

                    {/* Desktop Header - Floating Glass */}
                    <DesktopHeader user={user} notifications={notifications} branding={branding} />

                    {/* Mobile Header - Top Fixed */}
                    <MobileHeader user={user} notifications={notifications} branding={branding} />

                    {/* Mobile Bottom Nav - Bottom Fixed */}
                    <MobileBottomNav />

                    <main className="flex-1 p-4 md:p-8 pt-4 md:pt-6 max-w-7xl mx-auto w-full">
                        <Breadcrumbs />
                        {children}
                    </main>
                </div>
            </PullToRefresh>
        </>
    );
}
