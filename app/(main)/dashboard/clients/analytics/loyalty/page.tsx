import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { LoyaltySettingsClient } from "./loyalty-settings-client";
import { Button } from "@/components/ui/button";
import { getLoyaltyLevels } from "../../actions/loyalty.actions";
import type { LoyaltyLevel } from "@/lib/schema";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Настройка программы лояльности | CRM",
    description: "Уровни, скидки и условия для клиентов",
};

export const dynamic = "force-dynamic";

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
        </div>
    );
}

async function LoyaltyContent() {
    const levelsRes = await getLoyaltyLevels();
    const levels: LoyaltyLevel[] = levelsRes.success && levelsRes.data ? levelsRes.data : [];

    // В будущем здесь можно добавить получение статистики
    const dummyStats = levels.map(l => ({
        levelId: l.id,
        levelName: l.levelName,
        color: l.color || "#64748b",
        clientsCount: 0,
        totalRevenue: 0,
    }));

    return <LoyaltySettingsClient initialLevels={levels} initialStats={dummyStats} />;
}

export default async function LoyaltyPage() {
    const session = await getSession();
    if (!session) redirect("/auth/login");

    // Ограничение доступа (опционально, например только админам)
    if (session.roleName !== "Администратор") {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                <h2 className="text-xl font-bold">Доступ ограничен</h2>
                <p className="text-slate-500">У вас нет прав для изменения настроек лояльности.</p>
            </div>
        );
    }

    return (
        <div className="px-6 lg:px-8 py-6">
            <PageHeader
                title="Программа лояльности"
                description="Настройка автоматических уровней и привилегий"
                actions={(
                    <Link href="/dashboard/clients">
                        <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-2 font-bold text-slate-500">
                            <ArrowLeft className="w-4 h-4" />
                            К списку клиентов
                        </Button>
                    </Link>
                )}
            />

            <div className="mt-8">
                <Suspense fallback={<LoadingSpinner />}>
                    <LoyaltyContent />
                </Suspense>
            </div>
        </div>
    );
}
