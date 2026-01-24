"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ShoppingCart,
    Users,
    Palette,
    Settings,
    Printer,
    CheckSquare,
    BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
    {
        name: "Клиенты",
        href: "/dashboard/clients",
        icon: Users,
        departments: ["Руководство", "Отдел продаж"]
    },
    { name: "Задачи", href: "/dashboard/tasks", icon: CheckSquare },
    {
        name: "Производство",
        href: "/dashboard/production",
        icon: Settings,
        departments: ["Руководство", "Производство"]
    },
    {
        name: "Дизайн",
        href: "/dashboard/design",
        icon: Palette,
        departments: ["Руководство", "Дизайн"]
    },
    { name: "База знаний", href: "/dashboard/knowledge-base", icon: BookOpen },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user: {
        name: string;
        email: string;
        roleName: string;
        departmentName: string;
        avatar?: string | null;
    };
}

export function Sidebar({ className, user }: SidebarProps) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter(item => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <div className={cn("flex flex-col h-full bg-white py-4", className)}>
            <div className="px-6 mb-6 flex items-center gap-3">
                <div className="bg-[#5d00ff] rounded-[14px] p-1.5 shadow-md shadow-indigo-200">
                    <Printer className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">MerchCRM</span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {filteredNavigation.map((item) => {
                    const isActive = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200",
                                isActive
                                    ? "bg-indigo-50 text-[#5d00ff]"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-[#5d00ff]" : "text-slate-400")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
