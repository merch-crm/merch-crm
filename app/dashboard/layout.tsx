import { Navbar } from "@/components/layout/navbar";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, systemSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ActivityTracker } from "@/components/layout/activity-tracker";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/login");
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
        redirect("/login");
    }

    const user = {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        roleName: userData.role?.name || "Пользователь",
        departmentName: userData.department?.name || ""
    };

    // Maintenance Mode Check
    try {
        const maintenanceSetting = await db.query.systemSettings.findFirst({
            where: eq(systemSettings.key, "maintenance_mode")
        });

        if (maintenanceSetting?.value === true && user.roleName !== "Администратор") {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
                        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
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
        <div className="min-h-screen bg-[#f8f9fa]">
            <ActivityTracker />
            <Navbar user={user} />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
