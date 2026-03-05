import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/layout/page-header";
import { FunnelBoardClient } from "./funnel-board-client";
import { getClientsForFunnel, getFunnelStats } from "../actions/funnel.actions";
import { getManagers } from "../actions/core.actions";
import { Loader2, ArrowLeft, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ClientSummary } from "@/lib/types/client";

export const metadata = {
    title: "Воронка клиентов | CRM",
    description: "Канбан-доска этапов воронки",
};

export const dynamic = "force-dynamic";

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="flex flex-col items-center gap-3">
                <div className="relative w-12 h-12">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                    <LayoutGrid className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
                </div>
                <p className="text-sm font-bold text-slate-400">Загрузка воронки...</p>
            </div>
        </div>
    );
}

async function FunnelContent() {
    const clients = await getClientsForFunnel();
    const stats = await getFunnelStats();
    const managersResult = await getManagers();
    const managers = managersResult.success ? (managersResult.data || []) : [];

    return (
        <FunnelBoardClient
            initialClients={clients as unknown as ClientSummary[]}
            initialStats={stats}
            managers={managers}
        />
    );
}

export default async function FunnelPage() {
    const session = await getSession();
    if (!session) redirect("/auth/login");

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden px-6 lg:px-8 py-6">
            <PageHeader
                title="Воронка продаж"
                description="Управление клиентами по этапам"
                actions={(
                    <Link href="/dashboard/clients">
                        <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-2 font-bold text-slate-500">
                            <ArrowLeft className="w-4 h-4" />
                            К списку клиентов
                        </Button>
                    </Link>
                )}
            />

            <div className="flex-1 mt-6 min-h-0">
                <Suspense fallback={<LoadingSpinner />}>
                    <FunnelContent />
                </Suspense>
            </div>
        </div>
    );
}
