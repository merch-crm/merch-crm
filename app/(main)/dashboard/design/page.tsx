import { Suspense } from "react";
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
  PenTool,
  Sparkles,
  Box,
} from "lucide-react";
import { DesignNav } from "./components/design-nav";
import { DesignWidgets } from "./design-widgets";
import { DesignQueue } from "./design-queue";
import { getDesignStats, getDesignOrders } from "./actions";
import { getPrintsStats } from "./prints/actions/index";
import { DesignTasksWidget, DesignTasksWidgetSkeleton } from "./components/design-tasks-widget";

export const metadata: Metadata = {
  title: "Дизайн-студия",
  description: "Управление дизайном и макетами",
};

export const dynamic = "force-dynamic";

const TOOLS = [
  {
    href: "/dashboard/design/editor",
    icon: PenTool,
    label: "Редактор макетов",
    desc: "Векторная графика",
    gradient: "from-purple-500 to-fuchsia-600",
    shadow: "shadow-purple-500/20",
  },
  {
    href: "/dashboard/design/ai-lab",
    icon: Sparkles,
    label: "AI Лаборатория",
    desc: "Улучшение и изоляция",
    gradient: "from-indigo-500 to-blue-600",
    shadow: "shadow-indigo-500/20",
  },
  {
    href: "/dashboard/design/mockups",
    icon: Box,
    label: "3D Мокапы",
    desc: "Визуализация изделий",
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
  },
];

export default async function DesignPage() {
  const [designStatsRes, ordersRes, printsStatsRes] = await Promise.all([
    getDesignStats().catch(() => ({ success: false, data: { newTasks: 0, pendingApproval: 0, completed: 0, efficiency: 0 } })),
    getDesignOrders().catch(() => ({ success: false, data: [] })),
    getPrintsStats().catch(() => ({ success: false, data: { collections: 0, designs: 0, versions: 0, files: 0, linkedLines: 0 } })),
  ]);

  const designStats = designStatsRes.success ? designStatsRes.data! : { newTasks: 0, pendingApproval: 0, completed: 0, efficiency: 0 };
  const orders = ordersRes.success ? ordersRes.data! : [];
  const printsStats = printsStatsRes.success ? printsStatsRes.data! : { collections: 0, designs: 0, versions: 0, files: 0, linkedLines: 0 };

  return (
    <PageContainer>
      <PageHeader title="Дизайн-студия" description="Единое пространство для креатива и дизайна" />

      <div className="mb-4">
        <DesignNav />
      </div>

      <div className="flex flex-col gap-3">
        {/* Row 1: Statistics */}
        <DesignWidgets stats={designStats} />

        {/* Row 2: Tools + Collections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-start">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="block group">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-[160px] flex flex-col justify-between">
                <div>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-md ${tool.shadow} mb-3`}>
                    <tool.icon className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <h3 className="text-[14px] font-bold text-slate-900 leading-tight">{tool.label}</h3>
                  <p className="text-[12px] text-slate-400 mt-0.5 leading-snug">{tool.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}

          {/* Collections */}
          <Link href="/dashboard/design/prints" className="block group">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-[160px] flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
                  <FolderHeart className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 leading-tight">Коллекции</h3>
                  <p className="text-[12px] text-slate-400 mt-1 leading-snug">{printsStats.designs} принтов в {printsStats.collections} коллекциях</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-black text-sky-600 tabular-nums">{printsStats.collections}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        </div>

        {/* Row 3: Tasks + Queue Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Tasks Widget — 2/3 width */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white min-h-[260px] h-full">
              <Suspense fallback={<DesignTasksWidgetSkeleton />}>
                <DesignTasksWidget />
              </Suspense>
            </div>
          </div>

          {/* Queue Status — 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl border-slate-200 shadow-sm h-full bg-white flex flex-col">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-[14px] font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <ClipboardList className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  Статус очереди
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0 flex flex-col flex-1 gap-2">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[13px] font-semibold text-slate-600">В работе</span>
                    <span className="text-[17px] font-black text-slate-900 tabular-nums">{designStats.newTasks}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="text-[13px] font-semibold text-amber-700">Ожидают апрув</span>
                    <span className="text-[17px] font-black text-amber-700 tabular-nums">{designStats.pendingApproval}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="text-[13px] font-semibold text-emerald-700">Завершено</span>
                    <span className="text-[17px] font-black text-emerald-700 tabular-nums">{designStats.completed}</span>
                  </div>
                </div>
                <Link href="/dashboard/design/queue" className="mt-3">
                  <Button className="w-full rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-semibold h-10 shadow-none transition-colors">
                    Управлять очередью
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 4: Orders Queue */}
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            <DesignQueue orders={orders} />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
