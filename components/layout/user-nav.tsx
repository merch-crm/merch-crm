"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, ChevronDown, Shield, Package } from "lucide-react";
import { logout } from "@/app/dashboard/profile/actions";

import { useRouter } from "next/navigation";

import { RoleBadge } from "@/components/ui/role-badge";

export function UserNav({ user }: { user: { name: string, email: string, roleName: string, departmentName: string } }) {
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
                className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
            >
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                    <User className="h-5 w-5" />
                </div>
                <div className="hidden lg:block text-left">
                    <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{user.roleName}</div>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none z-[100] animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-5 flex items-center gap-4 border-b border-slate-50 bg-white text-left">
                        <div className="h-14 w-14 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-500 shrink-0">
                            <User className="h-7 w-7" />
                        </div>
                        <div className="flex flex-col gap-1 items-start overflow-hidden">
                            <span className="text-lg font-bold text-slate-900 leading-tight truncate w-full">{user.name}</span>
                            <span className="text-sm text-slate-400 font-medium truncate w-full">{user.email}</span>
                            <RoleBadge roleName={user.roleName} className="mt-1 px-3 py-1 text-xs" />
                        </div>
                    </div>

                    {/* Links Group 1 */}
                    <div className="p-2 space-y-1">
                        <Link
                            href="/dashboard/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 text-[15px] font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                            <User className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            Профиль
                        </Link>

                        {(["Руководство", "Отдел продаж"].includes(user.departmentName) || user.roleName === "Администратор") && (
                            <Link
                                href="/dashboard/warehouse"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 text-[15px] font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                <Package className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                Склад
                            </Link>
                        )}

                        {user.roleName === "Администратор" && (
                            <Link
                                href="/dashboard/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 text-[15px] font-bold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                <Shield className="h-5 w-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                                Админ-панель
                            </Link>
                        )}

                    </div>

                    {/* Exit Section */}
                    <div className="p-2 border-t border-slate-50 bg-white">
                        <form action={async () => {
                            await logout();
                            router.push("/login");
                        }}>
                            <button
                                type="submit"
                                className="w-full flex items-center gap-4 px-4 py-3 text-[15px] font-bold text-slate-900 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                <LogOut className="h-5 w-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                                Выйти
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}
