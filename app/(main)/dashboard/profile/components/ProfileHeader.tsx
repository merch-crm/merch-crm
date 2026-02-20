import React from "react";
import Image from "next/image";
import { Search, Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "../types";
import { ProfileView } from "../hooks/useProfile";

interface ProfileHeaderProps {
    user: UserProfile;
    view: ProfileView;
    setIsMobileMenuOpen: (val: boolean) => void;
    handleNavClick: (view: ProfileView) => void;
}

export function ProfileHeader({
    user,
    view,
    setIsMobileMenuOpen,
    handleNavClick
}: ProfileHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div className="flex items-center justify-between w-full md:w-auto">
                <div className="md:hidden">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm"
                    >
                        <Menu className="w-6 h-6" />
                    </Button>
                </div>
                <div className="md:block">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                        {view === "profile" && "Обзор профиля"}
                        {view === "settings" && "Настройки аккаунта"}
                        {view === "statistics" && "Аналитика и KPI"}
                        {view === "schedule" && "Рабочее расписание"}
                        {view === "notifications" && "Центр уведомлений"}
                    </h1>
                </div>
                <div className="md:hidden">
                    <div
                        role="button"
                        tabIndex={0}
                        className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        onClick={() => handleNavClick("settings")}
                    >
                        {user.avatar ? (
                            <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100">
                                {user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-400 mt-2">
                    Добро пожаловать, <span className="text-slate-900 font-bold">{user.name}</span>! Продуктивного дня.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative hidden md:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        type="text"
                        placeholder="Поиск..."
                        className="w-64 h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>
                <Button variant="outline" size="icon" className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </Button>
            </div>
        </header>
    );
}
