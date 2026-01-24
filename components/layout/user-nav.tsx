"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Shield, Package, BarChart3 } from "lucide-react";
import { logout } from "@/app/dashboard/profile/actions";

import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { RoleBadge } from "@/components/ui/role-badge";

export function UserNav({ user }: { user: { name: string, email: string, roleName: string, departmentName: string, avatar?: string | null } }) {
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
                className="flex items-center gap-3 p-1.5 rounded-[var(--radius-inner)] hover:bg-slate-50 transition-all duration-300 focus:outline-none group active:scale-95"
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
                <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-all duration-300", isOpen && "rotate-180 text-#5d00ff")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-[var(--radius-outer)] bg-white shadow-crm-xl border border-slate-200/50 focus:outline-none z-[100] animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 flex items-center gap-4 border-b border-slate-100/60 bg-slate-50/40 text-left">
                        <div className="h-16 w-16 rounded-[var(--radius-inner)] bg-indigo-100/30 flex items-center justify-center text-indigo-500 shrink-0 overflow-hidden relative shadow-inner border border-indigo-200/20">
                            {user.avatar ? (
                                <Image src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-8 w-8" />
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5 items-start overflow-hidden">
                            <span className="text-lg font-bold text-slate-900 leading-none truncate w-full">{user.name}</span>
                            <span className="text-[12px] text-slate-400 font-medium truncate w-full">{user.email}</span>
                            <RoleBadge roleName={user.roleName} className="mt-2" />
                        </div>
                    </div>

                    {/* Links Group 1 */}
                    <div className="p-2.5 space-y-1.5">
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 text-[14px] font-semibold text-slate-600 rounded-[18px] hover:bg-slate-50 hover:text-#5d00ff transition-all duration-300 group"
                        >
                            <User className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                            Профиль
                        </Link>

                        {(["Руководство", "Отдел продаж"].includes(user.departmentName) || user.roleName === "Администратор") && (
                            <>
                                <Link
                                    href="/dashboard/warehouse"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3 text-[14px] font-semibold text-slate-600 rounded-[18px] hover:bg-slate-50 hover:text-#5d00ff transition-all duration-300 group"
                                >
                                    <Package className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                    Склад
                                </Link>

                                <Link
                                    href="/dashboard/finance"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3 text-[14px] font-semibold text-slate-600 rounded-[18px] hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-300 group"
                                >
                                    <BarChart3 className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                    Финансы
                                </Link>
                            </>
                        )}

                        {user.roleName === "Администратор" && (
                            <Link
                                href="/dashboard/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 text-[14px] font-semibold text-slate-600 rounded-[18px] hover:bg-amber-50 hover:text-amber-600 transition-all duration-300 group"
                            >
                                <Shield className="h-5 w-5 opacity-60 group-hover:opacity-100" />
                                Админ-панель
                            </Link>
                        )}
                    </div>

                    {/* Exit Section */}
                    <div className="p-2.5 bg-rose-50/30">
                        <form action={async () => {
                            await logout();
                            router.push("/login");
                        }}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-4 px-4 py-3 text-[14px] font-semibold text-rose-600 rounded-[18px] hover:bg-rose-50 transition-all duration-300 group"
                            >
                                <LogOut className="h-5 w-5 opacity-70 group-hover:opacity-100" />
                                Выйти
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
