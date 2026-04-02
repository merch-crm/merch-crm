import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/layout/page-header";
import { CommunicationsClient } from "./communications-client";
import { getConversations, getMessageTemplates, getCommunicationsStats } from "./actions";
import { Loader2, MessageSquare } from "lucide-react";
import { MessageTemplate } from "@/lib/schema/communications";

export const metadata = {
    title: "Коммуникации | CRM",
    description: "Чаты с клиентами через мессенджеры и email",
};

export const dynamic = "force-dynamic";

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-slate-400 font-bold text-sm">Загрузка коммуникаций...</p>
            </div>
        </div>
    );
}

export default async function CommunicationsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    // Initial data fetching on server
    const [conversationsRes, templatesRes, statsRes] = await Promise.all([
        getConversations({ limit: 50 }),
        getMessageTemplates(),
        getCommunicationsStats(),
    ]);

    const initialConversations = conversationsRes.success ? conversationsRes.data : [];
    const templates = (templatesRes.success ? templatesRes.data : []) as MessageTemplate[];
    const stats = statsRes.success ? statsRes.data : undefined;

    return (
        <div className="flex flex-col h-full space-y-3">
            <PageHeader
                title="Коммуникации"
                description="Управление всеми входящими обращениями в одном окне"
                className="px-1"
                actions={
                    <div className="flex items-center gap-3 text-sm font-bold text-amber-600 bg-amber-50/50 border border-amber-100 px-4 py-2 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Демо-режим
                        </span>
                    </div>
                }
            />

            <Suspense fallback={<LoadingSpinner />}>
                <CommunicationsClient
                    initialConversations={initialConversations}
                    templates={templates}
                    stats={stats}
                />
            </Suspense>
        </div>
    );
}
