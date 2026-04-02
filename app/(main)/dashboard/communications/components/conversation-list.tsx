"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    MessageCircle,
    Send,
    Instagram,
    Globe,
    Mail,
    Smartphone,
    User,
    Building2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import type { ConversationWithDetails } from "../actions/chat.types";

interface ConversationListProps {
    conversations: ConversationWithDetails[];
    selectedId?: string;
    onSelect: (conversation: ConversationWithDetails) => void;
    onSearch: (query: string) => void;
    isLoading?: boolean;
}

import { IconType } from "@/components/ui/stat-card";

const channelIcons: Record<string, IconType> = {
    telegram: Send as IconType,
    instagram: Instagram as IconType,
    vk: Globe as IconType,
    whatsapp: MessageCircle as IconType,
    email: Mail as IconType,
    sms: Smartphone as IconType,
};

export function ConversationList({
    conversations,
    selectedId,
    onSelect,
    onSearch,
    isLoading,
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        onSearch(value);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-slate-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Поиск диалогов..."
                        className="pl-9 bg-slate-50 border-0"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {conversations.map((conversation, index) => {
                        const ChannelIcon = channelIcons[conversation.channelType] || MessageCircle;
                        const isSelected = conversation.id === selectedId;

                        return (
                            <motion.div
                                key={conversation.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(conversation)}
                                    className={cn(
                                        "w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-100",
                                        isSelected && "bg-primary/5 hover:bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex-shrink-0">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={conversation.clientAvatar || undefined} alt={conversation.clientName} />
                                                <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">
                                                    {conversation.clientName.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                                                style={{ backgroundColor: conversation.channelColor }}
                                            >
                                                <ChannelIcon className="w-3 h-3 text-white" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    {conversation.clientType === "b2b" ? (
                                                        <Building2 className="w-3.5 h-3.5 text-purple-500" />
                                                    ) : (
                                                        <User className="w-3.5 h-3.5 text-blue-500" />
                                                    )}
                                                    <span className="font-semibold text-slate-900 truncate">
                                                        {conversation.clientName}
                                                    </span>
                                                </div>
                                                {conversation.lastMessageAt && (
                                                    <span className="text-xs text-slate-400 flex-shrink-0">
                                                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                                            addSuffix: false,
                                                            locale: ru,
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            {conversation.clientCompany && (
                                                <p className="text-xs text-slate-500 truncate mb-1">
                                                    {conversation.clientCompany}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-slate-600 truncate flex-1">
                                                    {conversation.lastMessagePreview || "Нет сообщений"}
                                                </p>
                                                {conversation.unreadCount > 0 && (
                                                    <Badge className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                                        {conversation.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {conversations.length === 0 && !isLoading && (
                    <div className="p-8 text-center text-slate-400">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">Нет диалогов</p>
                        <p className="text-sm mt-1">Диалоги с клиентами появятся здесь</p>
                    </div>
                )}

                {isLoading && (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
