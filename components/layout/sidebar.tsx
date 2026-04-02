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
    BookOpen,
    Package,
    Layers,
    ImageIcon,
    FileText,
    PenTool,
    Sparkles,
    Box,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
    {
        name: "Клиенты",
        href: "/dashboard/clients",
        icon: Users,
        departments: ["Руководство", "Отдел продаж"],
    },
    { name: "Задачи", href: "/dashboard/tasks", icon: CheckSquare },
    {
        name: "Производство",
        href: "/dashboard/production",
        icon: Settings,
        departments: ["Руководство", "Производство"],
    },
    {
        name: "Дизайн",
        href: "/dashboard/design",
        icon: Palette,
        departments: ["Руководство", "Дизайн"],
        children: [
            { name: "Студия", href: "/dashboard/design" },
            { name: "Очередь", href: "/dashboard/design/queue", icon: CheckSquare },
            { name: "Принты", href: "/dashboard/design/prints", icon: ImageIcon },
            { name: "Редактор", href: "/dashboard/design/editor", icon: PenTool },
            { name: "AI Лаборатория", href: "/dashboard/design/ai-lab", icon: Sparkles },
            { name: "3D Мокапы", href: "/dashboard/design/mockups", icon: Box },
        ],
    },
    {
        name: "Склад",
        href: "/dashboard/warehouse",
        icon: Package,
        departments: ["Руководство", "Склад", "Производство"],
        children: [
            { name: "Обзор", href: "/dashboard/warehouse/overview" },
            { name: "Категории", href: "/dashboard/warehouse/categories" },
            { name: "Линейки", href: "/dashboard/warehouse/lines", icon: Layers },
            { name: "Характеристики", href: "/dashboard/warehouse/characteristics" },
        ],
    },
    { name: "База знаний", href: "/dashboard/knowledge-base", icon: BookOpen },
    { name: "Документация", href: "/dashboard/docs", icon: FileText },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    user: {
        name: string;
        email: string;
        roleName: string;
        departmentName: string;
        image?: string | null;
    };
}

export function Sidebar({ className, user }: SidebarProps) {
    const pathname = usePathname();

    const filteredNavigation = navigation.filter((item) => {
        if (!item.departments) return true;
        return item.departments.includes(user.departmentName);
    });

    return (
        <div
            data-testid="sidebar"
            className={cn("flex flex-col bg-white py-4", className)}
        >
            <div className="px-6 mb-6 flex items-center gap-3">
                <div className="bg-primary rounded-[14px] w-9 h-9 p-1 flex items-center justify-center shadow-sm">
                    <Printer className="h-7 w-7 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 ">MerchCRM</span>
            </div>

            <nav data-testid="main-nav" className="flex-1 px-4 space-y-1">
                {filteredNavigation.map((item) => {
                    const isActive =
                        item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);

                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = isActive && hasChildren;

                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-inner)] text-[14px] font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/5 text-primary shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 hover:scale-[1.02] hover:shadow-sm"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5",
                                        isActive ? "text-primary" : "text-slate-400"
                                    )}
                                />
                                {item.name}
                            </Link>

                            {/* Подменю */}
                            {isExpanded && item.children && (
                                <div className="ml-8 mt-1 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {item.children.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        const ChildIcon = child.icon;

                                        return (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                                                    isChildActive
                                                        ? "text-primary bg-primary/5"
                                                        : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                                                )}
                                            >
                                                {ChildIcon && (
                                                    <ChildIcon
                                                        className={cn(
                                                            "h-4 w-4",
                                                            isChildActive
                                                                ? "text-primary"
                                                                : "text-slate-400"
                                                        )}
                                                    />
                                                )}
                                                {child.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
