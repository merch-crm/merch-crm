
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { BreadcrumbsProvider } from "@/components/layout/breadcrumbs-context";
import { Navbar as DesktopHeader } from "@/components/layout/navbar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ActivityTracker } from "@/components/layout/activity-tracker";
import { getNotifications } from "@/components/notifications/actions";
import { getBrandingAction } from "@/app/(main)/admin-panel/actions";
import { BrandingSettings } from "@/lib/types";
import { NotificationManager } from "@/components/notifications/notification-manager";
import { CommandMenu } from "@/components/layout/command-menu";
import { checkAndRunNotifications } from "@/app/(main)/dashboard/notifications-actions";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { GlobalUndo } from "@/components/global-undo";
import { ImpersonationBanner } from "@/components/layout/impersonation-banner";
import { FloatingSearch } from "@/components/layout/floating-search";
import { MobileSearchSheet } from "@/components/layout/mobile-search-sheet";


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

        if (result?.rows && Array.isArray(result.rows) && result.rows.length > 0) {
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
    const { notifications, unreadCount } = await getNotifications();

    // Fetch branding settings
    const brandingRes = await getBrandingAction();
    const branding: BrandingSettings = (brandingRes.success && brandingRes.data) ? brandingRes.data : {
        companyName: "MerchCRM",
        logoUrl: null,
        primaryColor: "#5d00ff",
        faviconUrl: null,
        backgroundColor: "#f2f2f2",
        crmBackgroundUrl: null,
        crmBackgroundBlur: 0,
        crmBackgroundBrightness: 100,
        currencySymbol: "₽",
    } as BrandingSettings;

    // Maintenance Mode Check
    try {
        const maintenanceSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "maintenance_mode")
        });

        if (maintenanceSetting?.value === true && user.roleName !== "Администратор") {
            return (
                <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                    <div className="max-w-[480px] w-full bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden text-center p-[--padding-xl] space-y-3 animate-in zoom-in-95 duration-700">
                        <div className="w-[100px] h-[100px] bg-primary/5 rounded-[var(--radius-outer)] flex items-center justify-center text-primary mx-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                        </div>
                        <div className="space-y-3">
                            <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight">Технические работы</h1>
                            <p className="text-[#64748B] text-lg font-medium leading-relaxed">
                                Система временно недоступна для проведения планового обслуживания. Пожалуйста, зайдите позже.
                            </p>
                        </div>
                        <div className="pt-8 border-t border-slate-200">
                            <p className="text-sm font-bold text-[#CBD5E1]">
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
            {/* Dynamic Branding Styles */}
            <style>
                {`
                    :root { 
                        --primary: ${branding.primaryColor}; 
                        --background: ${branding.backgroundColor || "#f2f2f2"};
                    }
                    ${branding.crmBackgroundUrl ? `
                        .crm-background {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            z-index: -1;
                            background-image: url('${branding.crmBackgroundUrl}');
                            background-size: cover;
                            background-position: center;
                            background-repeat: no-repeat;
                            filter: blur(${branding.crmBackgroundBlur || 0}px) brightness(${branding.crmBackgroundBrightness || 100}%);
                            transform: scale(1.1); /* To avoid white edges when blurred */
                        }
                    ` : ""}
                `}
            </style>

            <PullToRefresh>
                <div className="min-h-screen pb-24 md:pb-0 relative">
                    {branding.crmBackgroundUrl && <div className="crm-background" />}
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
                        initialUnreadCount={unreadCount}
                        customSoundUrl={branding.notificationSound as string}
                    />

                    {/* Desktop Header - Floating Glass */}
                    <DesktopHeader user={user} branding={branding} notifications={notifications} unreadCount={unreadCount} />

                    {/* Mobile Header - Top Fixed */}
                    <MobileHeader user={user} branding={branding} notifications={notifications} unreadCount={unreadCount} />

                    {/* Mobile Bottom Nav - Bottom Fixed */}
                    <MobileBottomNav user={user} />

                    <FloatingSearch />
                    <MobileSearchSheet />

                    <main className="flex-1 px-container pt-4 md:pt-6 pb-4 max-w-[1480px] mx-auto w-full">
                        <Breadcrumbs />
                        {children}
                    </main>
                </div>
            </PullToRefresh>
        </BreadcrumbsProvider>
    );
}
