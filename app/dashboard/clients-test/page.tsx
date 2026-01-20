import { getClientStats } from "./actions";
import {
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { Card } from "@/components/ui/card";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

import { ClientsTestClient } from "./clients-test-client";

export default async function ClientsPage() {
    const session = await getSession();
    const user = session ? await db.query.users.findFirst({
        where: eq(users.id, session.id),
        with: { role: true, department: true }
    }) : null;

    const showFinancials =
        user?.role?.name === "Администратор" ||
        ["Руководство", "Отдел продаж"].includes(user?.department?.name || "");

    const statsRes = await getClientStats();
    const stats = statsRes.data || {
        totalClients: 0,
        newThisMonth: 0,
        avgCheck: 0,
        totalRevenue: 0
    };

    return (
        <ClientsTestClient
            stats={stats}
            userRoleName={user?.role?.name}
            showFinancials={showFinancials}
        />
    );
}
