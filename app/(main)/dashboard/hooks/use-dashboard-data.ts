"use client";

import { useEffect, useState, useMemo } from "react";
import { getDashboardStatsByPeriod, getDashboardNotifications } from "../actions";
import type { Notification } from "@/lib/types";

interface DashboardStats {
    totalClients: number;
    newClients: number;
    totalOrders: number;
    inProduction: number;
    revenue: string;
    averageCheck: string;
    rawRevenue: number;
}

export function useDashboardData(initialStats: DashboardStats, period: string) {
    const [statsData, setStatsData] = useState<DashboardStats>(initialStats);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
            setTime(new Date());
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [stats, notifs] = await Promise.all([
                    getDashboardStatsByPeriod(period),
                    getDashboardNotifications()
                ]);
                setStatsData(stats);
                setNotifications(notifs as Notification[]);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000);
        const clockInterval = setInterval(() => setTime(new Date()), 60000);

        return () => {
            clearInterval(interval);
            clearInterval(clockInterval);
        };
    }, [period]);

    const formattedTime = useMemo(() => {
        if (!isMounted || !time) return "--:--";
        return time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    }, [isMounted, time]);

    const formattedDate = useMemo(() => {
        if (!isMounted || !time) return "...";
        return time.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }, [isMounted, time]);

    return {
        statsData,
        notifications,
        isMounted,
        formattedTime,
        formattedDate
    };
}
