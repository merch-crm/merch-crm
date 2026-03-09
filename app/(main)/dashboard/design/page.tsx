import { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    FolderHeart,
    ClipboardList,
    ArrowRight,
} from "lucide-react";
import { DesignNav } from "./components/design-nav";
import { DesignWidgets } from "./design-widgets";
import { DesignQueue } from "./design-queue";
import { getDesignStats, getDesignOrders } from "./actions";
import { getPrintsStats } from "./prints/actions/index";

export const metadata: Metadata = {
    title: "Дизайн-студия",
    description: "Управление дизайном и макетами",
};

export const dynamic = "force-dynamic";

export default async function DesignPage() {
    const [designStatsRes, ordersRes, printsStatsRes] = await Promise.all([
        getDesignStats().catch(() => ({ success: false, data: { newTasks: 0, pendingApproval: 0, completed: 0, efficiency: 0 } })),
        getDesignOrders().catch(() => ({ success: false, data: [] })),
        getPrintsStats().catch(() => ({ success: false, data: { collections: 0, designs: 0, versions: 0, files: 0, linkedLines: 0 } })),
    ]);

    const designStats = designStatsRes.success
        ? designStatsRes.data!
        : { newTasks: 0, pendingApproval: 0, completed: 0, efficiency: 0 };

    const orders = ordersRes.success ? ordersRes.data! : [];

    const printsStats = printsStatsRes.success
        ? printsStatsRes.data!
        : { collections: 0, designs: 0, versions: 0, files: 0, linkedLines: 0 };

    return (
        <PageContainer>
            <PageHeader
                title="Дизайн-студия"
                description="Управление дизайном, макетами и коллекциями принтов"
            />

            {/* Навигация */}
            <div className="mb-6">
                <DesignNav />
            </div>

            {/* Виджеты */}
            <DesignWidgets stats={designStats} />

            {/* Быстрые ссылки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {/* Коллекции принтов */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <FolderHeart className="h-5 w-5 text-primary" />
                            Коллекции принтов
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{printsStats.collections}</p>
                                <p className="text-xs text-muted-foreground">Коллекций</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{printsStats.designs}</p>
                                <p className="text-xs text-muted-foreground">Принтов</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{printsStats.linkedLines}</p>
                                <p className="text-xs text-muted-foreground">В линейках</p>
                            </div>
                        </div>
                        <Link href="/dashboard/design/prints">
                            <Button variant="outline" className="w-full">
                                Открыть коллекции
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Очередь задач */}
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ClipboardList className="h-5 w-5 text-amber-500" />
                            Очередь дизайна
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-amber-500">
                                    {designStats.newTasks}
                                </p>
                                <p className="text-xs text-muted-foreground">Новых</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-500">
                                    {designStats.pendingApproval}
                                </p>
                                <p className="text-xs text-muted-foreground">На согласовании</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-green-500">
                                    {designStats.completed}
                                </p>
                                <p className="text-xs text-muted-foreground">Завершено</p>
                            </div>
                        </div>
                        <Link href="/dashboard/design/queue">
                            <Button variant="outline" className="w-full">
                                Открыть очередь
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Очередь заказов */}
            <div className="mt-6">
                <DesignQueue orders={orders} />
            </div>
        </PageContainer>
    );
}
