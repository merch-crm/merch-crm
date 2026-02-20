import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserStatistics, getUserSchedule } from "../actions";
import { UserProfile, StatisticsData, ScheduleTask } from "../types";

export type ProfileView = "profile" | "settings" | "statistics" | "schedule" | "notifications";

export function useProfile(user: UserProfile) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Mapping URL param to internal view state
    const tabParam = searchParams.get("p");
    const view = (tabParam && ["settings", "statistics", "schedule", "notifications"].includes(tabParam))
        ? tabParam as ProfileView
        : "profile";

    const [statsData, setStatsData] = useState<StatisticsData | null>(null);
    const [scheduleData, setScheduleData] = useState<ScheduleTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Data fetching
    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUserStatistics();
            if (res.data) setStatsData(res.data);
        } catch (error) {
            console.error("Failed to fetch statistics", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSchedule = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getUserSchedule();
            if (res.data) setScheduleData(res.data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if ((view === "statistics" || view === "profile") && !statsData) {
            const timer = setTimeout(() => fetchStats(), 0);
            return () => clearTimeout(timer);
        }
    }, [view, statsData, fetchStats]);

    useEffect(() => {
        if (view === "schedule" && scheduleData.length === 0) {
            const timer = setTimeout(() => fetchSchedule(), 0);
            return () => clearTimeout(timer);
        }
    }, [view, scheduleData.length, fetchSchedule]);

    const handleNavClick = (newView: ProfileView) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("p", newView);
        router.replace(`?${params.toString()}`, { scroll: false });
        setIsMobileMenuOpen(false);
    };

    const getDepartmentName = () => {
        if (!user.department) return "Общий отдел";
        return user.department.name;
    };

    const getRoleName = () => {
        if (!user.role) return "Сотрудник";
        return user.role.name;
    };

    return {
        view,
        statsData,
        scheduleData,
        loading,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        handleNavClick,
        getDepartmentName,
        getRoleName
    };
}
