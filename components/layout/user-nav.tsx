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

interface BrandingSettings {
    socialTelegram?: string | null;
    socialWhatsapp?: string | null;
    socialWebsite?: string | null;
    [key: string]: unknown;
}

export function UserNav({ user, branding }: {
    user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null },
    branding?: BrandingSettings
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
                <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100/50 overflow-hidden shadow-sm">
                        {user.avatar ? (
                            <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-full h-full object-cover" />
                        ) : (
                            <User className="h-5.5 w-5.5" />
                        )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full translate-x-0.5 translate-y-0.5 animate-crm-blink shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="hidden lg:block text-left">
                    <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                    <div className="text-[12px] text-slate-400 font-medium">{user.roleName}</div>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-all duration-300", isOpen && "rotate-180 text-primary")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Mobile Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] md:hidden"
                        />

                        {/* Menu Content */}
                        <motion.div
                            initial={typeof window !== 'undefined' && window.innerWidth < 768
                                ? { y: "-100%", opacity: 0 }
                                : { opacity: 0, scaleY: 0.8, y: -10, originY: 0 }
                            }
                            animate={typeof window !== 'undefined' && window.innerWidth < 768
                                ? { y: 0, opacity: 1 }
                                : { opacity: 1, scaleY: 1, y: 0 }
                            }
                            exit={typeof window !== 'undefined' && window.innerWidth < 768
                                ? { y: "-100%", opacity: 0 }
                                : { opacity: 0, scaleY: 0.8, y: -10 }
                            }
                            transition={{
                                duration: 0.5,
                                ease: [0.16, 1, 0.3, 1],
                                opacity: { duration: 0.2 }
                            }}
                            drag={typeof window !== 'undefined' && window.innerWidth < 768 ? "y" : false}
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={{ top: 1, bottom: 0.1 }}
                            onDragEnd={(_, info) => {
                                if (info.offset.y < -50 || info.velocity.y < -300) {
                                    setIsOpen(false);
                                }
                            }}
                            className={cn(
                                "fixed top-0 left-0 w-full h-[55vh] rounded-b-[2.5rem] bg-white shadow-2xl z-[100] overflow-hidden flex flex-col md:absolute md:top-auto md:left-auto md:right-[-0.75rem] md:mt-5 md:w-80 md:h-auto md:rounded-[var(--radius-outer)] md:shadow-crm-xl md:border md:border-slate-200 md:origin-top-right",
                                "lg:right-[-2rem]"
                            )}
                        >
                            {/* Mobile Pull Indicator */}
                            <div className="flex md:hidden justify-center pt-4 pb-2">
                                <div className="w-12 h-1 bg-slate-100 rounded-full" />
                            </div>

                            {/* Header */}
                            <div className="p-6 md:p-6 border-b border-slate-200/60 bg-slate-50/40 text-left shrink-0">
                                <div className="flex items-start gap-4">
                                    <div className="relative shrink-0">
                                        <div className="h-16 w-16 md:h-12 md:w-12 rounded-[var(--radius-inner)] bg-indigo-100/30 flex items-center justify-center text-indigo-500 overflow-hidden shadow-inner border border-indigo-200/20">
                                            {user.avatar ? (
                                                <Image src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-8 w-8 md:h-6 md:w-6" />
                                            )}
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 md:w-3 md:h-3 bg-emerald-500 border-[3px] md:border-2 border-white rounded-full translate-x-1 translate-y-1 animate-crm-blink shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <span className="text-xl md:text-base font-black md:font-bold text-slate-900 leading-tight truncate">{user.name}</span>
                                        <span className="text-sm md:text-[12px] text-slate-400 font-medium truncate">{user.email}</span>
                                        <RoleBadge roleName={user.roleName} className="mt-1.5 w-fit" />
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="md:hidden p-2 rounded-full bg-slate-100/50 text-slate-400"
                                    >
                                        <ChevronDown className="h-5 w-5 rotate-180" />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content Area for Mobile */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {/* Links Group 1 */}
                                <div className="p-4 md:p-2.5 space-y-1 md:space-y-1.5">
                                    <Link
                                        href="/dashboard/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="dropdown-item py-3 md:py-2"
                                    >
                                        <User className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                        <span className="text-base md:text-sm font-bold md:font-medium">Профиль</span>
                                    </Link>

                                    {(["Руководство", "Отдел продаж"].includes(user.departmentName) || user.roleName === "Администратор") && (
                                        <>
                                            <Link
                                                href="/dashboard/warehouse"
                                                onClick={() => setIsOpen(false)}
                                                className="dropdown-item py-3 md:py-2"
                                            >
                                                <Package className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                                <span className="text-base md:text-sm font-bold md:font-medium">Склад</span>
                                            </Link>

                                            <Link
                                                href="/dashboard/finance"
                                                onClick={() => setIsOpen(false)}
                                                className="dropdown-item py-3 md:py-2 hover:bg-emerald-50 hover:text-emerald-600"
                                            >
                                                <BarChart3 className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                                <span className="text-base md:text-sm font-bold md:font-medium">Финансы</span>
                                            </Link>
                                        </>
                                    )}

                                    {user.roleName === "Администратор" && (
                                        <Link
                                            href="/admin-panel"
                                            onClick={() => setIsOpen(false)}
                                            className="dropdown-item py-3 md:py-2 hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Shield className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                            <span className="text-base md:text-sm font-bold md:font-medium">Админ-панель</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Social Links from Branding */}
                                {(branding?.socialTelegram || branding?.socialWhatsapp || branding?.socialWebsite) && (
                                    <div className="p-4 md:p-2.5 bg-slate-50/50 border-t border-slate-200/60 space-y-1 md:space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase tracking-wider">Ресурсы компании</p>
                                        {branding.socialTelegram && (
                                            <a href={branding.socialTelegram} target="_blank" rel="noopener noreferrer" className="dropdown-item py-3 md:py-2 hover:bg-sky-50 hover:text-sky-600">
                                                <Send className="h-4 w-4" />
                                                <span className="text-base md:text-sm font-bold md:font-medium">Telegram</span>
                                            </a>
                                        )}
                                        {branding.socialWhatsapp && (
                                            <a href={branding.socialWhatsapp} target="_blank" rel="noopener noreferrer" className="dropdown-item py-3 md:py-2 hover:bg-emerald-50 hover:text-emerald-600">
                                                <MessageCircle className="h-4 w-4" />
                                                <span className="text-base md:text-sm font-bold md:font-medium">WhatsApp</span>
                                            </a>
                                        )}
                                        {branding.socialWebsite && (
                                            <a href={branding.socialWebsite} target="_blank" rel="noopener noreferrer" className="dropdown-item py-3 md:py-2 hover:bg-indigo-50 hover:text-indigo-600">
                                                <Globe className="h-4 w-4" />
                                                <span className="text-base md:text-sm font-bold md:font-medium">Сайт компании</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Exit Section */}
                            <div className="p-4 md:p-2.5 bg-rose-50/30 shrink-0">
                                <form action={async () => {
                                    await logout();
                                    router.push("/login");
                                }}>
                                    <button
                                        type="submit"
                                        className="w-full dropdown-item py-3 md:py-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 justify-center md:justify-start"
                                    >
                                        <LogOut className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                                        <span className="text-base md:text-sm font-black md:font-bold">Выйти</span>
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
