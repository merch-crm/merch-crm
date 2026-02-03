"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Shield, Package, BarChart3, Globe, MessageCircle, Send } from "lucide-react";
import { logout } from "@/app/(main)/dashboard/profile/actions";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { RoleBadge } from "@/components/ui/role-badge";

export function UserNav({ user, branding }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null },
    branding?: any
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1.5 rounded-[var(--radius-inner)] hover:bg-slate-50 transition-all duration-200 focus:outline-none group hover:shadow-sm"
            >
                <div className="h-10 w-10 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100/50 overflow-hidden shrink-0 relative shadow-sm">
                    {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                        <User className="h-5.5 w-5.5" />
                    )}
                </div>
                <div className="hidden lg:block text-left">
                    <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                    <div className="text-[12px] text-slate-400 font-medium">{user.roleName}</div>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-all duration-300", isOpen && "rotate-180 text-primary")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.8, y: -10, originY: 0 }}
                        animate={{ opacity: 1, scaleY: 1, y: 0 }}
                        exit={{ opacity: 0, scaleY: 0.8, y: -10 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.23, 1, 0.32, 1],
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute -right-3 md:-right-6 lg:-right-8 mt-5 w-80 origin-top-right rounded-[var(--radius-outer)] bg-white shadow-crm-xl border border-slate-200 focus:outline-none z-[100] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200/60 bg-slate-50/40 text-left">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-[var(--radius-inner)] bg-indigo-100/30 flex items-center justify-center text-indigo-500 shrink-0 overflow-hidden relative shadow-inner border border-indigo-200/20">
                                    {user.avatar ? (
                                        <Image src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-8 w-8" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                    <span className="text-lg font-bold text-slate-900 leading-tight truncate">{user.name}</span>
                                    <span className="text-[12px] text-slate-400 font-medium truncate">{user.email}</span>
                                    <RoleBadge roleName={user.roleName} className="mt-1.5" />
                                </div>
                            </div>
                        </div>

                        {/* Links Group 1 */}
                        <div className="p-2.5 space-y-1.5">
                            <Link
                                href="/dashboard/profile"
                                onClick={() => setIsOpen(false)}
                                className="dropdown-item"
                            >
                                <User className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                Профиль
                            </Link>

                            {(["Руководство", "Отдел продаж"].includes(user.departmentName) || user.roleName === "Администратор") && (
                                <>
                                    <Link
                                        href="/dashboard/warehouse"
                                        onClick={() => setIsOpen(false)}
                                        className="dropdown-item"
                                    >
                                        <Package className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                        Склад
                                    </Link>

                                    <Link
                                        href="/dashboard/finance"
                                        onClick={() => setIsOpen(false)}
                                        className="dropdown-item hover:bg-emerald-50 hover:text-emerald-600"
                                    >
                                        <BarChart3 className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                        Финансы
                                    </Link>
                                </>
                            )}

                            {user.roleName === "Администратор" && (
                                <Link
                                    href="/admin-panel"
                                    onClick={() => setIsOpen(false)}
                                    className="dropdown-item hover:bg-amber-50 hover:text-amber-600"
                                >
                                    <Shield className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                    Админ-панель
                                </Link>
                            )}
                        </div>

                        {/* Social Links from Branding */}
                        {(branding?.socialTelegram || branding?.socialWhatsapp || branding?.socialWebsite) && (
                            <div className="p-2.5 bg-slate-50/50 border-t border-slate-200/60 space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">Ресурсы компании</p>
                                {branding.socialTelegram && (
                                    <a href={branding.socialTelegram} target="_blank" rel="noopener noreferrer" className="dropdown-item hover:bg-sky-50 hover:text-sky-600">
                                        <Send className="h-4 w-4" />
                                        Telegram
                                    </a>
                                )}
                                {branding.socialWhatsapp && (
                                    <a href={branding.socialWhatsapp} target="_blank" rel="noopener noreferrer" className="dropdown-item hover:bg-emerald-50 hover:text-emerald-600">
                                        <MessageCircle className="h-4 w-4" />
                                        WhatsApp
                                    </a>
                                )}
                                {branding.socialWebsite && (
                                    <a href={branding.socialWebsite} target="_blank" rel="noopener noreferrer" className="dropdown-item hover:bg-indigo-50 hover:text-indigo-600">
                                        <Globe className="h-4 w-4" />
                                        Сайт компании
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Exit Section */}
                        <div className="p-2.5 bg-rose-50/30">
                            <form action={async () => {
                                await logout();
                                router.push("/login");
                            }}>
                                <button
                                    type="submit"
                                    className="w-full dropdown-item text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                >
                                    <LogOut className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                                    Выйти
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
