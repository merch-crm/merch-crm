"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Layers,
    Droplets,
    Shirt,
    Grid3X3,
    Scissors,
    PenTool,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    APPLICATION_TYPE_LABELS,
    type ApplicationType,
} from "../types";

interface NavItem {
    type: ApplicationType;
    href: string;
    icon: React.ElementType;
    enabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
    {
        type: "dtf",
        href: "/dashboard/production/calculators/dtf",
        icon: Layers,
        enabled: true,
    },
    {
        type: "print-application",
        href: "/dashboard/production/calculators/print-application",
        icon: PenTool, // Changed from Layers to PenTool for better semantic fit
        enabled: true,
    },
    {
        type: "sublimation",
        href: "/dashboard/production/calculators/sublimation",
        icon: Droplets,
        enabled: true,
    },
    {
        type: "dtg",
        href: "/dashboard/production/calculators/dtg",
        icon: Shirt,
        enabled: true,
    },
    {
        type: "silkscreen",
        href: "/dashboard/production/calculators/silkscreen",
        icon: Grid3X3,
        enabled: true,
    },
    {
        type: "thermotransfer",
        href: "/dashboard/production/calculators/thermotransfer",
        icon: Scissors,
        enabled: false,
    },
    {
        type: "embroidery",
        href: "/dashboard/production/calculators/embroidery",
        icon: Scissors,
        enabled: true,
    },
];

export function CalculatorsNav() {
    const pathname = usePathname();

    // Определяем активный тип по URL
    const activeType = NAV_ITEMS.find((item) =>
        pathname.startsWith(item.href)
    )?.type;

    return (
        <nav className="flex items-center gap-1 p-1.5 bg-slate-100/50 rounded-[20px] border border-slate-200/30 shadow-inner overflow-x-auto">
            {NAV_ITEMS.filter((item) => item.enabled).map((item) => {
                const isActive = activeType === item.type;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.type}
                        href={item.href}
                        className={cn(
                            "relative flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-bold transition-colors whitespace-nowrap",
                            isActive
                                ? "text-primary"
                                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="calculators-nav-active"
                                className="absolute inset-0 bg-white rounded-[14px] shadow-md"
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35,
                                }}
                            />
                        )}
                        <span className="relative flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {APPLICATION_TYPE_LABELS[item.type]}
                            </span>
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
