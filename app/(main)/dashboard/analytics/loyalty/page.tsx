import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { LoyaltySettingsClient } from "./loyalty-settings-client";
import { getLoyaltyLevels } from "@/app/(main)/dashboard/clients/actions/loyalty.actions";
import { getLoyaltyDistribution } from "@/app/(main)/dashboard/clients/actions/analytics.actions";
import { type LoyaltyLevel } from "@/lib/schema/clients/loyalty";
import { type LoyaltyDistributionData } from "@/app/(main)/dashboard/clients/actions/analytics/types";

export const metadata = {
  title: "Настройки лояльности | CRM",
  description: "Управление уровнями лояльности клиентов",
};

export const dynamic = "force-dynamic";

export default async function LoyaltySettingsPage() {
  const [levelsRes, statsRes] = await Promise.all([
    getLoyaltyLevels(), // Без аргументов, согласно сигнатуре
    getLoyaltyDistribution(), // Используем функцию аналитики вместо getLoyaltyStats
  ]);

  const levels = levelsRes.success && levelsRes.data ? levelsRes.data : [];
  // Приводим данные аналитики к формату, который ожидает LoyaltySettingsClient
  const statsData: LoyaltyDistributionData[] = statsRes.success && statsRes.data ? statsRes.data : [];
  const stats: { levelId: string; levelName: string; color: string; clientsCount: number; totalRevenue: number }[] = levels.map((l: LoyaltyLevel) => {
    const matchingStat = statsData.find((s: LoyaltyDistributionData) => s.levelName === l.levelName);
    return {
      levelId: l.id,
      levelName: l.levelName,
      color: l.color || "#64748b",
      clientsCount: matchingStat ? matchingStat.count : 0,
      totalRevenue: matchingStat ? Number(matchingStat.totalRevenue || 0) : 0
    };
  });

  return (
    <div className="p-4 sm:p-8 space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard/analytics" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          К аналитике
        </Link>
      </div>

      <PageHeader title="Уровни лояльности" description="Настройте пороги и привилегии для каждого уровня" />

      <Suspense fallback={<div className="animate-pulse bg-slate-100 h-96 rounded-2xl" />}>
        <LoyaltySettingsClient initialLevels={levels} initialStats={stats} />
      </Suspense>
    </div>
  );
}
