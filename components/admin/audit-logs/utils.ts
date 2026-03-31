"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Activity, Database, User, Shield, Package, HardDrive, Layout, Server, Folder
} from "lucide-react";
import { AuditLogDetails } from "@/lib/types";

export const PAGE_SIZE = 20;

export interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    details: AuditLogDetails | null;
    createdAt: Date | string;
    userId: string | null;
    user?: {
        name: string;
        avatar?: string | null;
    } | null;
}

export const formatLogDetails = (details: AuditLogDetails | null): string | null => {
    if (!details) return null;

    return (
        (details.fileName as string) ||
        (details.name as string) ||
        (details.reason as string) ||
        (details.oldKey && details.newKey ? `${details.oldKey} → ${details.newKey}` : null) ||
        (details.oldPath && details.newPath ? `${details.oldPath} → ${details.newPath}` : null) ||
        (details.key as string) ||
        (details.path as string) ||
        (details.count ? `Объектов: ${details.count}` : null) ||
        JSON.stringify(details)
    );
};

export const formatDate = (date: Date | string, formatStr: string) => {
    try {
        return format(new Date(date), formatStr, { locale: ru });
    } catch {
        return "—";
    }
};

export const getEntityInfo = (type: string) => {
    switch (type) {
        case "users":
        case "user":
            return { icon: User, color: "text-blue-500", bg: "bg-blue-50" };
        case "s3_storage":
            return { icon: Server, color: "text-sky-500", bg: "bg-sky-50" };
        case "local_storage":
            return { icon: HardDrive, color: "text-emerald-500", bg: "bg-emerald-50" };
        case "order":
            return { icon: Package, color: "text-indigo-500", bg: "bg-indigo-50" };
        case "system_settings":
            return { icon: Layout, color: "text-amber-500", bg: "bg-amber-50" };
        case "security_event":
            return { icon: Shield, color: "text-rose-500", bg: "bg-rose-50" };
        case "folder":
            return { icon: Folder, color: "text-orange-500", bg: "bg-orange-50" };
        case "file":
            return { icon: Database, color: "text-purple-500", bg: "bg-purple-50" };
        default:
            return { icon: Activity, color: "text-slate-400", bg: "bg-slate-50" };
    }
};
