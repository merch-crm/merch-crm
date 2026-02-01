
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbsProvider } from "@/components/layout/breadcrumbs-context";
import { Navbar as DesktopHeader } from "@/components/layout/navbar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ActivityTracker } from "@/components/layout/activity-tracker";
import { getNotifications } from "@/components/notifications/actions";
import { getBrandingSettings } from "@/app/(main)/admin-panel/branding/actions";
import { NotificationManager } from "@/components/notifications/notification-manager";
import { CommandMenu } from "@/components/layout/command-menu";
import { checkAndRunNotifications } from "@/app/(main)/dashboard/notifications-actions";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { GlobalUndo } from "@/components/global-undo";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { FloatingSearch } from "@/components/layout/floating-search";

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
        const { pool } = await import('@/lib/db');
        const sql = `
            SELECT u.name, u.email, u.avatar, r.name as role_name, d.name as department_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.id = $1
            LIMIT 1
        `;
        const result = await pool.query(sql, [session.id]);

        if (result.rows.length > 0) {
            const row = result.rows[0];
            userData = {
                name: row.name,
                email: row.email,
                avatar: row.avatar,
                role: { name: row.role_name },
                department: { name: row.department_name }
            };
        }
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
                <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                    <div className="max-w-[480px] w-full bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden text-center p-12 space-y-8 animate-in zoom-in-95 duration-700">
                        <div className="w-[100px] h-[100px] bg-primary/5 rounded-[24px] flex items-center justify-center text-primary mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight tracking-normal">Технические работы</h1>
                            <p className="text-[#64748B] text-lg font-medium leading-relaxed">
                                Система временно недоступна для проведения планового обслуживания. Пожалуйста, зайдите позже.
                            </p>
                        </div>
                        <div className="pt-8 border-t border-slate-200">
                            <p className="text-sm font-bold text-[#CBD5E1] tracking-widest uppercase">
                                CRM Maintenance Mode
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
    } catch (e) {
        console.error("Maintenance check failed:", e);
    }

    return (
        <BreadcrumbsProvider>
            {/* Dynamic Primary Color */}
            <style dangerouslySetInnerHTML={{
                __html: `:root { --primary: ${branding.primaryColor}; }`
            }} />

            <PullToRefresh>
                <div className="min-h-screen pb-24 md:pb-0">
                    {session?.impersonatorId && (
                        <ImpersonationBanner
                            impersonatorName={session.impersonatorName || "Admin"}
                            targetName={user.name}
                        />
                    )}
                    <GlobalUndo />
                    <CommandMenu />
                    <ActivityTracker />
                    <NotificationManager
                        initialUnreadCount={notifications.filter(n => !n.isRead).length}
                        userId={session?.id || "debug-user"}
                    />

                    {/* Desktop Header - Floating Glass */}
                    <DesktopHeader user={user} branding={branding} notifications={notifications} />

                    {/* Mobile Header - Top Fixed */}
                    <MobileHeader user={user} branding={branding} />

                    {/* Mobile Bottom Nav - Bottom Fixed */}
                    <MobileBottomNav user={user} />

                    <FloatingSearch />

                    <main className="flex-1 px-4 md:px-12 pt-4 md:pt-6 pb-20 max-w-[1480px] mx-auto w-full">
                        <Breadcrumbs />
                        {children}
                    </main>
                </div>
            </PullToRefresh>
        </BreadcrumbsProvider>
    );
}
