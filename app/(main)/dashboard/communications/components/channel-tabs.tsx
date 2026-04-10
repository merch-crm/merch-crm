"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Send,
  Instagram,
  Globe,
  MessageCircle,
  Mail,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { channelTypeColors } from "@/lib/schema/communications";

interface ChannelTabsProps {
  activeChannel: string;
  onChange: (channel: string) => void;
  stats?: Record<string, { count: number; unread: number }>;
}

import { IconType } from "@/components/ui/stat-card";

const channelIcons: Record<string, IconType> = {
  all: MessageSquare as IconType,
  telegram: Send as IconType,
  instagram: Instagram as IconType,
  vk: Globe as IconType,
  whatsapp: MessageCircle as IconType,
  email: Mail as IconType,
  sms: Smartphone as IconType,
};

const channels = [
  { key: "all", label: "Все каналы" },
  { key: "telegram", label: "Telegram" },
  { key: "instagram", label: "Instagram" },
  { key: "vk", label: "ВКонтакте" },
  { key: "email", label: "Email" },
];

export function ChannelTabs({ activeChannel, onChange, stats }: ChannelTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-hide">
      {channels.map((channel) => {
        const Icon = channelIcons[channel.key];
        const isActive = activeChannel === channel.key;
        const channelStats = stats?.[channel.key];
        const unreadCount = channel.key === "all"
          ? Object.values(stats || {}).reduce((sum, s) => sum + (s.unread || 0), 0)
          : channelStats?.unread || 0;

        return (
          <button
            type="button"
            key={channel.key}
            onClick={() => onChange(channel.key)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
              isActive
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="channelTabIndicator"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="w-4 h-4" style={{ color: channel.key !== "all" ? channelTypeColors[channel.key as keyof typeof channelTypeColors] : undefined }} />
              <span>{channel.label}</span>
              {unreadCount > 0 && (
                <Badge className="bg-rose-500 text-white text-xs font-bold px-1.5 py-0 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </Badge>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
