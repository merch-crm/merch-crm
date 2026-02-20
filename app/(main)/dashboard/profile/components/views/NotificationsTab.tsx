import React from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { ActivityItem } from "../../types";

interface NotificationsTabProps {
    activities: ActivityItem[];
}

export function NotificationsTab({ activities }: NotificationsTabProps) {
    return (
        <div className="crm-card !p-8 !rounded-3xl min-h-[400px]">
            <h2 className="text-xl font-bold mb-6">История уведомлений</h2>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 group">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center text-primary font-bold shadow-sm group-hover:shadow-md transition-all">
                            {/* Simple Icon placeholder */}
                            <CheckCircle2 className="w-5 h-5 opacity-50 group-hover:opacity-100" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors">{activity.text}</p>
                            <p className="text-xs text-slate-400 font-bold mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {activity.time}
                            </p>
                        </div>
                    </div>
                ))}
                {activities.length === 0 && (
                    <p className="text-center text-slate-400 py-10">Уведомлений пока нет</p>
                )}
            </div>
        </div>
    );
}
