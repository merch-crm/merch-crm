import { Navbar } from "@/components/layout/navbar";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Fetch full user data with role and department info
    // Fetch full user data with role and department info
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

    console.log(`[DashboardLayout] User: ${userData?.email}, Avatar: ${userData?.avatar}`);

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

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <Navbar user={user} />
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
