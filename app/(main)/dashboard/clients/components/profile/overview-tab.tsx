"use client";

import {
    Building2,
    Info,
    Phone,
    Mail,
    MapPin,
    Link as LinkIcon,
    MessageCircle,
    ExternalLink,
    User,
    RotateCcw,
    MessageSquare,
    Send,
    Instagram,
    Globe,
    Smartphone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoRow } from "@/components/ui/info-row";
import { ClientStatsWidget } from "../client-stats-widget";
import { RFMSegmentBadge } from "../rfm-segment-badge";
import { LoyaltyLevelSelect } from "../loyalty-level-select";
import type { ClientProfile } from "@/lib/types";
import { type ClientChatPreview } from "../../client-profile-drawer";
import { formatDate } from "@/lib/formatters";
import { safeExternalOpen } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";

interface OverviewTabProps {
    client: ClientProfile;
    userRoleName?: string | null;
    onLoyaltyChange: (levelId: string | null, setManually: boolean) => Promise<void>;
    onRecalculate: () => Promise<void>;
    clientChats: ClientChatPreview[];
}

export function OverviewTab({
    client,
    userRoleName,
    onLoyaltyChange,
    onRecalculate,
    clientChats
}: OverviewTabProps) {
    const { toast } = useToast();

    return (
        <div className="space-y-3">
            <ClientStatsWidget
                stats={{
                    totalOrdersCount: client.totalOrders || 0,
                    totalOrdersAmount: client.totalSpent || 0,
                    averageCheck: client.stats?.total && client.totalOrders
                        ? client.stats.total / client.totalOrders
                        : 0,
                    lastOrderAt: client.lastOrderAt ? new Date(client.lastOrderAt) : null,
                    firstOrderAt: client.firstOrderAt ? new Date(client.firstOrderAt) : null,
                    daysSinceLastOrder: client.daysSinceLastOrder || null,
                }}
            />

            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-slate-400">Лояльность и сегмент</h3>
                        {client.loyaltyLevelSetManually && (
                            <Badge className="bg-amber-100 text-amber-600 border-none font-black text-xs">
                                Manual
                            </Badge>
                        )}
                    </div>
                    <RFMSegmentBadge
                        segment={client.rfmSegment || null}
                        score={client.rfmScore || null}
                        size="sm"
                        showScore
                    />
                </div>
                <LoyaltyLevelSelect
                    value={client.loyaltyLevelId || null}
                    onChange={onLoyaltyChange}
                    isManual={client.loyaltyLevelSetManually}
                />
            </div>

            {client.clientType === "b2b" && (
                <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-sm font-bold text-blue-900">Организация (B2B)</p>
                        {client.company && (
                            <p className="text-xs text-slate-400 font-mono">{client.company}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                    <Info className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400">
                        {client.clientType === "b2b" ? "Контактное лицо" : "Основная информация"}
                    </h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <InfoRow
                        icon={Phone}
                        label="Телефон"
                        value={["Печатник", "Дизайнер"].includes(userRoleName || "") ? "HIDDEN" : client.phone}
                        variant="minimal"
                    />
                    {client.email && (
                        <InfoRow icon={Mail} label="Email" value={client.email} variant="minimal" />
                    )}
                    {client.city && (
                        <InfoRow
                            icon={MapPin}
                            label="География"
                            value={`${client.city}${client.address ? `, ${client.address}` : ''}`}
                            variant="minimal"
                        />
                    )}
                    {client.company && client.clientType !== "b2b" && (
                        <InfoRow icon={Building2} label="Компания" value={client.company} variant="minimal" />
                    )}
                </div>
            </div>

            {/* Social & Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <LinkIcon className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-semibold text-slate-400">Ссылки</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {client.telegram && (
                            <Badge variant="outline" className="h-8 pl-1 pr-3 rounded-full border-blue-100 bg-blue-50 text-blue-600 gap-2 font-semibold cursor-pointer hover:bg-blue-100 transition-all" onClick={() => {
                                safeExternalOpen(`https://t.me/${client.telegram?.replace('@', '')}`, "Telegram", toast);
                            }}>
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white"><MessageCircle className="w-3 h-3" /></div>
                                Telegram
                            </Badge>
                        )}
                        {client.instagram && (
                            <Badge variant="outline" className="h-8 pl-1 pr-3 rounded-full border-pink-100 bg-pink-50 text-pink-600 gap-2 font-semibold cursor-pointer hover:bg-pink-100 transition-all" onClick={() => {
                                safeExternalOpen(`https://instagram.com/${client.instagram?.replace('@', '')}`, "Instagram", toast);
                            }}>
                                <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white"><ExternalLink className="w-3 h-3" /></div>
                                Instagram
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <User className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-semibold text-slate-400">Менеджер</h3>
                    </div>
                    <InfoRow
                        icon={User}
                        label="Ответственный"
                        value={client.manager?.name || "Не назначен"}
                        variant="minimal"
                    />
                </div>
            </div>

            {client.comments && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <MessageCircle className="w-4 h-4 text-slate-400" />
                        <h3 className="text-xs font-semibold text-slate-400">Примечания</h3>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-slate-700 leading-relaxed font-medium text-sm">
                        {client.comments}
                    </div>
                </div>
            )}

            {clientChats.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2 px-1">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        Активные диалоги
                    </h4>
                    <div className="space-y-2">
                        {clientChats.slice(0, 3).map(chat => {
                            const channelIcons: Record<string, React.ElementType> = {
                                telegram: Send,
                                instagram: Instagram,
                                vk: Globe,
                                whatsapp: MessageCircle,
                                email: Mail,
                                sms: Smartphone,
                            };
                            const Icon = channelIcons[chat.channelType] || MessageCircle;

                            return (
                                <Link
                                    key={chat.id}
                                    href={`/dashboard/communications?chat=${chat.id}`}
                                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all group"
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                                        style={{ backgroundColor: chat.channelColor || undefined }}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{chat.channelName}</p>
                                            {chat.lastMessageAt && (
                                                <span className="text-xs font-medium text-slate-400">
                                                    {formatDate(new Date(chat.lastMessageAt), "HH:mm")}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                                            {chat.lastMessagePreview || "Нет сообщений"}
                                        </p>
                                    </div>
                                    {(chat.unreadCount || 0) > 0 && (
                                        <Badge className="bg-rose-500 text-white border-none font-black text-xs min-w-[20px] h-[20px] flex items-center justify-center rounded-full">
                                            {chat.unreadCount}
                                        </Badge>
                                    )}
                                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                </Link>
                            );
                        })}
                    </div>
                    <Link
                        href={`/dashboard/communications?client=${client.id}`}
                        className="mt-3 px-2 text-xs font-bold text-primary hover:underline flex items-center gap-1.5 transition-all"
                    >
                        Перейти ко всем диалогам
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div className="pt-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full h-10 border-2 border-dashed border-slate-100 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-2xl text-[11px] font-bold gap-2"
                    onClick={onRecalculate}
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Пересчитать статистику и RFM
                </Button>
            </div>
        </div>
    );
}
