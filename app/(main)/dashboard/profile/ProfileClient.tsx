"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBranding } from "@/components/branding-provider";
import { UserProfile, ActivityItem, Task } from "./types";
import { useProfile } from "./hooks/useProfile";

// Components
import { ProfileSidebar } from "./components/ProfileSidebar";
import { ProfileHeader } from "./components/ProfileHeader";
import { OverviewTab } from "./components/views/OverviewTab";
import { SettingsTab } from "./components/views/SettingsTab";
import { NotificationsTab } from "./components/views/NotificationsTab";
import { StatisticsView } from "./statistics-view";
import { ScheduleView } from "./schedule-view";

interface ProfileClientProps {
    user: UserProfile;
    activities: ActivityItem[];
    tasks: Task[];
}

export function ProfileClient({ user, activities, tasks }: ProfileClientProps) {
    const { currencySymbol = "₽" } = useBranding();

    const {
        view,
        statsData,
        scheduleData,
        loading,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        handleNavClick,
        getDepartmentName,
        getRoleName
    } = useProfile(user);

    return (
        <div className="fixed inset-0 z-50 flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
            <ProfileSidebar
                user={user}
                view={view}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                handleNavClick={handleNavClick}
                getRoleName={getRoleName}
            />

            {/* Main Content Area */}
            <div className="flex-1 p-6 md:p-6 lg:p-[--padding-xl] relative z-0 overflow-y-auto bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent h-full">
                <ProfileHeader
                    user={user}
                    view={view}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    handleNavClick={handleNavClick}
                />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {view === "profile" && (
                            <OverviewTab
                                statsData={statsData}
                                currencySymbol={currencySymbol}
                                departmentName={getDepartmentName()}
                                roleName={getRoleName()}
                                tasks={tasks}
                                handleNavClick={handleNavClick}
                            />
                        )}

                        {view === "settings" && <SettingsTab user={user} />}

                        {view === "statistics" && (
                            <div className="crm-card  !rounded-3xl min-h-[400px]">
                                {loading && !statsData ? (
                                    <div className="flex items-center justify-center h-40 font-bold text-slate-300">Загрузка данных...</div>
                                ) : (
                                    <StatisticsView data={statsData} />
                                )}
                            </div>
                        )}

                        {view === "notifications" && <NotificationsTab activities={activities} />}

                        {view === "schedule" && (
                            <div className="crm-card  md: !rounded-3xl min-h-[400px]">
                                {loading && scheduleData.length === 0 ? (
                                    <div className="flex items-center justify-center h-40 font-bold text-slate-300">Загрузка расписания...</div>
                                ) : (
                                    <ScheduleView tasks={scheduleData} />
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// Re-export type back for legacy usage (e.g. page.tsx)
// Not exporting other types to prevent circular dependencies but keeping UserProfile just in case
export type { UserProfile } from "./types";
