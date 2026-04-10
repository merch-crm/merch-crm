import { z } from "zod";

export const PeriodSchema = z.enum(["week", "month", "quarter", "year", "all"]).default("all");

export interface ClientAnalyticsOverview {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  lostClients: number;
  newClientsThisMonth: number;
  newClientsLastMonth: number;
  newClientsGrowth: number;
  totalRevenue: number;
  averageCheck: number;
  averageLTV: number;
  b2cCount: number;
  b2bCount: number;
}

export interface FunnelAnalyticsData {
  stage: string;
  label: string;
  count: number;
  percentage: number;
  conversionFromPrevious: number | null;
  color: string;
}

export interface ClientGrowthData {
  date: string;
  month: string;
  newClients: number;
  cumulativeClients: number;
  b2cNew: number;
  b2bNew: number;
}

export interface RevenueBySegmentData {
  segment: string;
  label: string;
  revenue: number;
  percentage: number;
  clientCount: number;
  averageCheck: number;
  color: string;
}

export interface ManagerPerformanceData {
  managerId: string | null;
  managerName: string;
  managerAvatar: string | null;
  clientCount: number;
  activeClients: number;
  atRiskClients: number;
  totalRevenue: number;
  averageCheck: number;
  conversionRate: number;
}

export interface TopClientData {
  id: string;
  fullName: string;
  company: string | null;
  clientType: "b2c" | "b2b";
  totalOrdersAmount: number;
  totalOrdersCount: number;
  averageCheck: number;
  loyaltyLevelName: string | null;
  loyaltyLevelColor: string | null;
  rfmSegment: string | null;
  lastOrderAt: Date | null;
}

export interface AcquisitionSourceData {
  source: string;
  id: string;
  label: string;
  count: number;
  percentage: number;
  revenue: number;
  averageCheck: number;
  icon: string;
}

export interface LoyaltyDistributionData {
  levelId: string;
  levelName: string;
  levelKey: string;
  color: string;
  count: number;
  percentage: number;
  totalRevenue: number;
}

export interface RFMDistributionData {
  segment: string;
  label: string;
  color: string;
  count: number;
  percentage: number;
  avgRevenue: number;
}

export interface ActivityTrendData {
  date: string;
  ordersCount: number;
  revenue: number;
  newClients: number;
  activeClients: number;
}
