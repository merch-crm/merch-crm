import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Settings, LayoutGrid, BookOpen, Calendar, Bell, ChevronRight, GraduationCap, X as XIcon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserProfile } from "../types";
import { ProfileView } from "../hooks/useProfile";

interface ProfileSidebarProps {
    user: UserProfile;
    view: ProfileView;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (val: boolean) => void;
    handleNavClick: (view: ProfileView) => void;
    getRoleName: () => string;
}

export function ProfileSidebar({
    user,
    view,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    handleNavClick,
    getRoleName
}: ProfileSidebarProps) {
    const router = useRouter();

    const navItems: Array<{ id: ProfileView; label: string; icon: React.ReactNode }> = [
        { id: "profile", label: "Главная", icon: <LayoutGrid /> },
        { id: "statistics", label: "Статистика", icon: <BookOpen /> },
        { id: "schedule", label: "Расписание", icon: <Calendar /> },
        { id: "notifications", label: "Уведомления", icon: <Bell /> },
        { id: "settings", label: "Настройки", icon: <Settings /> },
    ];

    return (
        <>
            <aside className={cn(
                "fixed inset-y-0 left-0 z-[60] w-[280px] bg-[#0F172A] text-white p-6 flex flex-col transition-all duration-300 md:relative md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
            )}>
                <div className="flex items-center justify-between mb-10 pl-2">
                    <div
                        role="button"
                        tabIndex={0}
                        className="flex items-center gap-3 cursor-pointer"
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-lg leading-none block">MerchCRM</span>
                            <span className="text-xs text-slate-400 font-bold">Profile</span>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden p-2 text-slate-400 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <XIcon className="w-6 h-6" />
                    </Button>
                </div>

                <nav className="flex-1 space-y-2 mb-8">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant="ghost"
                            onClick={() => handleNavClick(item.id)}
                            className={cn(
                                "w-full flex items-center justify-start gap-3 px-4 py-6 rounded-xl text-sm font-bold transition-all group relative overflow-hidden",
                                view === item.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {/* Hover Effect */}
                            {view !== item.id && (
                                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 rounded-xl" />
                            )}

                            {item.icon && <span className="w-5 h-5 relative z-10">{item.icon}</span>}
                            <span className="relative z-10">{item.label}</span>
                            {view === item.id && <ChevronRight className="ml-auto w-4 h-4 relative z-10" />}
                        </Button>
                    ))}
                </nav>

                <div className="mb-4 pt-4 border-t border-slate-800">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="w-full flex items-center justify-start gap-3 px-4 py-6 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Вернуться в CRM</span>
                    </Button>
                </div>

                {/* User Info Mini Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0">
                                {user.avatar ? (
                                    <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-sm truncate text-white">{user.name}</h4>
                                <p className="text-xs text-slate-400 font-medium truncate">{getRoleName()}</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleNavClick("settings")}
                            className="w-full h-10 bg-primary hover:bg-primary-hover rounded-xl text-xs font-bold shadow-lg shadow-primary/10 transition-all border-none"
                        >
                            Редактировать
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div
                    role="button"
                    tabIndex={0}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden transition-opacity"
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
