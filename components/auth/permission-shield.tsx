"use client";

import React from "react";
import { authClient } from "@/lib/auth-client";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

// better-auth adminClient plugin creates an Atom/hook union — cast to hook explicitly
type UseSessionHook = () => { isPending: boolean; data: { user: Record<string, unknown>; session: unknown } | null };
const _useSession = authClient.useSession as unknown as UseSessionHook;
 
interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
  permissions?: Record<string, Record<string, boolean>> | string;
}

export type PermissionPath = 
  | "modules.orders" 
  | "modules.clients" 
  | "modules.warehouse" 
  | "modules.production" 
  | "modules.finance" 
  | "modules.employees" 
  | "modules.admin"
  | "privacy.view_contacts"
  | "privacy.view_costs"
  | "privacy.view_analytics";

interface PermissionShieldProps {
  permission: PermissionPath;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showIcon?: boolean;
}

/**
 * Компонент-обёртка для разграничения доступа в интерфейсе.
 * Проверяет наличие прав у текущего пользователя.
 */
export function PermissionShield({ 
  permission, 
  children, 
  fallback,
  showIcon = false 
}: PermissionShieldProps) {
  const session = _useSession();
  
  if (session.isPending) return null;

  const user = session.data?.user as unknown as ExtendedUser | undefined;
  let permissions: Record<string, Record<string, boolean>> = {};
  
  const rawPermissions = user?.permissions || {};
  
  if (typeof rawPermissions === 'string') {
    try {
      permissions = JSON.parse(rawPermissions);
    } catch {
      permissions = {};
    }
  } else {
    permissions = rawPermissions as Record<string, Record<string, boolean>>;
  }

  const [category, action] = permission.split(".");
  const hasPermission = permissions[category]?.[action] === true;

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  if (showIcon) {
    return (
      <div className="flex items-center gap-1.5 text-slate-400 italic text-xs">
        <Lock className="w-3 h-3" />
        <span>Доступ ограничен</span>
      </div>
    );
  }

  return null;
}

/**
 * Хук для проверки прав в логике компонентов
 */
export function usePermission(path: PermissionPath): boolean {
  const session = _useSession();
  if (!session.data?.user) return false;

  const user = session.data.user as unknown as ExtendedUser;
  let permissions: Record<string, Record<string, boolean>> = {};

  const rawPermissions = user?.permissions || {};

  if (typeof rawPermissions === 'string') {
    try {
      permissions = JSON.parse(rawPermissions);
    } catch {
      permissions = {};
    }
  } else {
    permissions = rawPermissions as Record<string, Record<string, boolean>>;
  }

  const [category, action] = path.split(".");
  return permissions[category]?.[action] === true;
}

/**
 * Специализированный компонент для скрытия конфиденциальных данных (цены, контакты)
 */
export function PrivacyShield({ 
  type, 
  value, 
  className 
}: { 
  type: "contacts" | "costs" | "analytics", 
  value: React.ReactNode,
  className?: string
}) {
  const permissionMap: Record<string, PermissionPath> = {
    contacts: "privacy.view_contacts",
    costs: "privacy.view_costs",
    analytics: "privacy.view_analytics"
  };

  const hasAccess = usePermission(permissionMap[type]);

  if (hasAccess) {
    return <span className={className}>{value}</span>;
  }

  // Для контактов скрываем часть, для цен — блюрим или заменяем на звездочки
  return (
    <span className={cn("inline-flex items-center gap-1 text-slate-300 font-mono blur-[3.5px] select-none cursor-not-allowed", className)}>
      {typeof value === 'string' ? value.replace(/./g, '*') : '********'}
    </span>
  );
}
