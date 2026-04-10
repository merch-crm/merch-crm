"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import type { Notification } from "@/lib/types";

interface DashboardNotificationsProps {
  notifications: Notification[];
}

export function DashboardNotifications({ notifications }: DashboardNotificationsProps) {
  return (
    <div className="crm-card col-span-12 lg:col-span-8 relative group overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold text-slate-900">Последние уведомления</h4>
          <p className="text-slate-400 text-xs font-medium">Обновлено только что</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs font-bold hover:underline">Прочитать все</Button>
      </div>

      <div className="card-breakout border-t border-slate-100 mt-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Нет новых уведомлений
          </div>
        ) : (
          notifications.map((note) => (
            <div key={note.id} className="flex items-center justify-between px-[var(--radius-padding)] py-4 bg-transparent hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full ring-4 shrink-0",
                  note.type === "success" ? "bg-emerald-500 ring-emerald-500/10" :
                    note.type === "info" ? "bg-sky-500 ring-sky-500/10" :
                      note.type === "warning" ? "bg-amber-500 ring-amber-500/10" : "bg-rose-500 ring-rose-500/10"
                )} />
                <div>
                  <span className="text-sm font-bold text-slate-700 block">{note.title}</span>
                  <span className="text-xs text-slate-500 line-clamp-1">{note.message}</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 shrink-0 ml-4">
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ru })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
