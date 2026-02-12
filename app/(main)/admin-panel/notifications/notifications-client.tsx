"use client";

import { useState } from "react";
import {
    Bell,
    Send,
    ShieldAlert,
    Info,
    CheckCircle2,
    Save,
    Bot,
    Smartphone,
    Monitor,
    Zap,
    AlertTriangle,
    ShoppingBag,
    Boxes,
    UserCheck,
    Loader2,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateNotificationSettingsAction, NotificationSettings } from "../actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";

// --- Constants ---

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    system: { enabled: true, browserPush: false },
    telegram: {
        enabled: false,
        botToken: "",
        chatId: "",
        notifyOnNewOrder: true,
        notifyOnLowStock: true,
        notifyOnSystemError: true
    },
    events: {
        new_order: true,
        order_status_change: true,
        stock_low: true,
        task_assigned: true,
        system_error: false,
        big_payment: false,
        client_update: false,
        security_alert: false
    }
};

const EVENT_CONFIG: { key: string; label: string; icon: LucideIcon; color: string }[] = [
    { key: "new_order", label: "Новый заказ", icon: ShoppingBag, color: "bg-emerald-50 text-emerald-600" },
    { key: "order_status_change", label: "Смена статуса", icon: CheckCircle2, color: "bg-blue-50 text-blue-600" },
    { key: "stock_low", label: "Мало остатков", icon: Boxes, color: "bg-orange-50 text-orange-600" },
    { key: "task_assigned", label: "Новая задача", icon: UserCheck, color: "bg-purple-50 text-purple-600" },
    { key: "system_error", label: "Ошибки системы", icon: ShieldAlert, color: "bg-rose-50 text-rose-600" },
    { key: "big_payment", label: "Крупный платеж", icon: Zap, color: "bg-amber-50 text-amber-600" },
    { key: "client_update", label: "Изменение клиента", icon: Info, color: "bg-indigo-50 text-indigo-600" },
    { key: "security_alert", label: "Безопасность", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
];

// --- Component ---

interface NotificationsClientProps {
    initialSettings: NotificationSettings;
}

export function NotificationsClient({ initialSettings }: NotificationsClientProps) {
    const { toast } = useToast();
    const [settings, setSettings] = useState<NotificationSettings>(
        initialSettings ?? DEFAULT_NOTIFICATION_SETTINGS
    );
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await updateNotificationSettingsAction(settings);
            if (res.success) {
                toast("Настройки уведомлений сохранены", "success");
                playSound("notification_success");
            } else {
                toast(res.error || "Ошибка при сохранении", "error");
                playSound("notification_error");
            }
        } catch (error) {
            console.error("Failed to save notification settings:", error);
            toast("Не удалось сохранить настройки", "error");
            playSound("notification_error");
        } finally {
            setLoading(false);
        }
    };

    const toggleNested = (section: keyof NotificationSettings, key: string) => {
        setSettings((prev) => {
            const sectionData = prev[section];
            if (typeof sectionData !== "object" || sectionData === null) return prev;

            const currentValue = (sectionData as Record<string, unknown>)[key];
            if (typeof currentValue !== "boolean") return prev;

            return {
                ...prev,
                [section]: {
                    ...sectionData,
                    [key]: !currentValue
                }
            };
        });
    };

    const updateValue = (section: keyof NotificationSettings, key: string, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const isEventEnabled = (key: string): boolean => {
        return Boolean(settings.events[key]);
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/5 rounded-[18px] flex items-center justify-center border border-primary/10">
                        <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-normal">Уведомления</h1>
                        <p className="text-slate-700 text-[11px] font-medium mt-0.5">Управление каналами связи и триггерами системы</p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="lg"
                    className="btn-dark rounded-[var(--radius-inner)] font-bold shadow-xl shadow-slate-900/10 border-none"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Сохранить изменения
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* System & Push Settings */}
                <div className="crm-card space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Системные уведомления</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Внутри браузера</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200 transition-colors hover:border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Общие уведомления</p>
                                    <p className="text-[10px] text-slate-700 mt-0.5 font-medium">Показывать в колокольчике CRM</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.system.enabled}
                                onCheckedChange={() => toggleNested("system", "enabled")}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200 transition-colors hover:border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Push-уведомления</p>
                                    <p className="text-[10px] text-slate-700 mt-0.5 font-medium">Всплывающие окна рабочего стола</p>
                                </div>
                            </div>
                            <Switch
                                checked={settings.system.browserPush}
                                onCheckedChange={() => toggleNested("system", "browserPush")}
                            />
                        </div>
                    </div>
                </div>

                {/* Telegram Integration */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Send className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold">Telegram Бот</h3>
                            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-widest mt-0.5">Мгновенные оповещения</p>
                        </div>
                        <Switch
                            checked={settings.telegram.enabled}
                            onCheckedChange={() => toggleNested("telegram", "enabled")}
                            className="ml-auto"
                        />
                    </div>

                    <div className={cn("space-y-5 relative z-10 transition-all", !settings.telegram.enabled && "opacity-40 pointer-events-none grayscale")}>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 ml-1">Токен бота (API Token)</label>
                            <Input
                                type="password"
                                value={settings.telegram.botToken}
                                onChange={(e) => updateValue("telegram", "botToken", e.target.value)}
                                placeholder="123456789:ABCDEF..."
                                className="w-full bg-slate-800 border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium !text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 ml-1">ID Группы или Чат-ID</label>
                            <Input
                                type="text"
                                value={settings.telegram.chatId}
                                onChange={(e) => updateValue("telegram", "chatId", e.target.value)}
                                placeholder="-100123456789"
                                className="w-full bg-slate-800 border-slate-700 rounded-2xl px-5 py-4 text-sm font-medium !text-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-slate-600"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-300 text-xs font-bold">
                            <Bot className="w-5 h-5 shrink-0" />
                            <p>Добавьте бота в нужный чат и отправьте любое сообщение, чтобы узнать ID.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Triggers */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">События для уведомлений</h3>
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                        {Object.values(settings.events).filter(Boolean).length} триггера активно
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {EVENT_CONFIG.map((item) => {
                        const Icon = item.icon;
                        const enabled = isEventEnabled(item.key);

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => toggleNested("events", item.key)}
                                aria-pressed={enabled}
                                aria-label={`${item.label}: ${enabled ? "активно" : "выключено"}`}
                                className={cn(
                                    "p-6 rounded-3xl border transition-all cursor-pointer group hover:shadow-lg text-left",
                                    enabled
                                        ? "bg-white border-slate-200 shadow-sm"
                                        : "bg-slate-50/50 border-transparent grayscale opacity-60"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm mb-1">{item.label}</h4>
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest group-hover:text-primary transition-colors">
                                    {enabled ? "Активно" : "Выключено"}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
