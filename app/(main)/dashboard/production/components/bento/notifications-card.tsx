"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Bell,
  AlertTriangle,
  Clock,
  Package,
  Wrench,
  UserX,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationsData, SystemNotification, NotificationType, NotificationPriority } from "../../types";

interface NotificationsCardProps {
  data: NotificationsData | null;
  onDismiss?: (id: string) => void;
  className?: string;
}

const typeConfig: Record<NotificationType, { icon: React.ElementType; label: string }> = {
  overdue_task: { icon: AlertTriangle, label: "Просрочка" },
  equipment_maintenance: { icon: Wrench, label: "ТО" },
  low_material: { icon: Package, label: "Склад" },
  unassigned_order: { icon: UserX, label: "Назначение" },
  system_alert: { icon: AlertCircle, label: "Алерт" },
  approval_needed: { icon: Clock, label: "Ожидание" },
};

const priorityConfig: Record<NotificationPriority, { color: string; bgColor: string; borderColor: string; iconBg: string }> = {
  critical: { color: "text-rose-600", bgColor: "bg-rose-50", borderColor: "border-rose-200/50", iconBg: "bg-white" },
  warning: { color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200/50", iconBg: "bg-white" },
  info: { color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200/50", iconBg: "bg-white" },
};

/**
 * Виджет уведомлений.
 * Агрегирует системные события разного уровня важности.
 */
export function NotificationsCard({ data, onDismiss, className }: NotificationsCardProps) {
  const notifications = data?.notifications ?? [];
  const counts = data?.counts ?? { critical: 0, warning: 0, info: 0 };
  const hasData = notifications.length > 0;

  return (
    <div className={cn(
      "crm-card flex flex-col h-full transition-all",
      counts.critical > 0 && "!border-rose-200 shadow-lg shadow-rose-500/5 bg-rose-50/5",
      className
    )}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border relative shadow-sm transition-colors",
            counts.critical > 0
              ? "bg-rose-50 text-rose-600 border-rose-100"
              : hasData
              ? "bg-amber-50 text-amber-600 border-amber-100"
              : "bg-emerald-50 text-emerald-600 border-emerald-100"
          )}>
            {hasData ? <Bell className="w-5 h-5 animate-tada" /> : <CheckCircle className="w-5 h-5" />}
            {hasData && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 border-2 border-white text-white text-xs font-bold flex items-center justify-center shadow-md">
                {notifications.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Уведомления</h3>
            <p className="text-xs font-medium text-slate-400">
              {hasData ? "Требуют внимания" : "Всё в порядке"}
            </p>
          </div>
        </div>

        {/* Счётчики по приоритетам в ряд */}
        {hasData && (
          <div className="flex items-center gap-1.5">
            {counts.critical > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-xs font-bold shadow-sm">
                {counts.critical} CRIT
              </span>
            )}
            {counts.warning > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-sm">
                {counts.warning} WARN
              </span>
            )}
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-hidden">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center p-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <span className="text-2xl">⚡️</span>
            </div>
            <p className="text-sm font-bold text-emerald-600">Очередь пуста</p>
            <p className="text-xs text-slate-400 mt-1">Критических событий не обнаружено</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(notifications || []).slice(0, 4).map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ссылка на полный список */}
      {hasData && (
        <div className="mt-4">
          <Link
            href="/dashboard/notifications"
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all group"
          >
            <span>ПЕРЕЙТИ В ЦЕНТР УВЕДОМЛЕНИЙ</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">({notifications.length})</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

interface NotificationRowProps {
  notification: SystemNotification;
  onDismiss?: (id: string) => void;
}

/** Строка уведомления с приоритизацией */
function NotificationRow({ notification, onDismiss }: NotificationRowProps) {
  const type = typeConfig[notification.type] || typeConfig.system_alert;
  const priority = priorityConfig[notification.priority] || priorityConfig.info;
  const Icon = type.icon;

  return (
    <div className={cn(
      "group relative flex items-start gap-3 p-3 rounded-xl border transition-all",
      priority.bgColor,
      priority.borderColor,
      "hover:shadow-sm"
    )}>
      {/* Иконка типа события */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105",
        priority.borderColor,
        priority.iconBg,
        priority.color
      )}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Контент уведомления */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-bold", priority.color)}>
            {type.label}
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-xs font-bold text-slate-400">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: ru,
            })}
          </span>
        </div>
        <p className="text-sm font-bold text-slate-900 leading-tight mt-1 truncate">
          {notification.title}
        </p>
        <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-1 leading-normal opacity-90">
          {notification.description}
        </p>
      </div>

      {/* Кнопки действий */}
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {notification.href && (
          <Link
            href={notification.href}
            className={cn(
              "p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-white shadow-sm",
              priority.color
            )}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(notification.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
