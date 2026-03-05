"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Paperclip,
    MoreVertical,
    User,
    Building2,
    Check,
    CheckCheck,
    X,
    ChevronDown,
    Sparkles,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import type { ConversationWithDetails, MessageWithSender } from "../actions/chat.types";
import type { MessageTemplate } from "@/lib/schema/communications";
import Link from "next/link";

interface ChatWindowProps {
    conversation: ConversationWithDetails | null;
    messages: MessageWithSender[];
    templates: MessageTemplate[];
    onSendMessage: (content: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
    isSending?: boolean;
}

export function ChatWindow({
    conversation,
    messages,
    templates,
    onSendMessage,
    onLoadMore,
    hasMore,
    isLoading,
    isSending,
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [showTemplates, setShowTemplates] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputValue.trim() || isSending) return;
        onSendMessage(inputValue.trim());
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        if (inputValue.startsWith("/")) {
            const template = templates.find(t => t.shortcut === inputValue);
            if (template && e.key === "Tab") {
                e.preventDefault();
                setInputValue(template.content);
            }
        }
    };

    const insertTemplate = (template: MessageTemplate) => {
        setInputValue(template.content);
        setShowTemplates(false);
        inputRef.current?.focus();
    };

    const formatMessageTime = (date: Date) => {
        return format(new Date(date), "HH:mm", { locale: ru });
    };

    const formatDateDivider = (date: Date) => {
        const d = new Date(date);
        if (isToday(d)) return "Сегодня";
        if (isYesterday(d)) return "Вчера";
        return format(d, "d MMMM yyyy", { locale: ru });
    };

    const groupedMessages = messages.reduce((groups, message) => {
        const date = format(new Date(message.sentAt), "yyyy-MM-dd", { locale: ru });
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {} as Record<string, MessageWithSender[]>);

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        Выберите диалог
                    </h3>
                    <p className="text-slate-500">
                        Выберите диалог из списка слева, чтобы начать общение
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50">
            <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold">
                            {conversation.clientName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            {conversation.clientType === "b2b" ? (
                                <Building2 className="w-4 h-4 text-purple-500" />
                            ) : (
                                <User className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="font-semibold text-slate-900">
                                {conversation.clientName}
                            </span>
                            <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: conversation.channelColor, color: conversation.channelColor }}
                            >
                                {conversation.channelName}
                            </Badge>
                        </div>
                        {conversation.clientCompany && (
                            <p className="text-xs text-slate-500">{conversation.clientCompany}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href={`/dashboard/clients?client=${conversation.clientId}`}
                        className="h-9 px-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Карточка</span>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Назначить менеджера</DropdownMenuItem>
                            <DropdownMenuItem>Архивировать</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Заблокировать</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {hasMore && (
                    <div className="text-center mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onLoadMore}
                            disabled={isLoading}
                        >
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Загрузить ранние сообщения
                        </Button>
                    </div>
                )}

                {(Object.entries(groupedMessages) as [string, MessageWithSender[]][]).map(([date, msgs]) => (
                    <div key={date}>
                        <div className="flex items-center justify-center my-4">
                            <div className="bg-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                                {formatDateDivider(msgs[0].sentAt)}
                            </div>
                        </div>

                        {msgs.map((message: MessageWithSender, index: number) => {
                            const isOutbound = message.direction === "outbound";
                            const showAvatar = !isOutbound && (
                                index === 0 || msgs[index - 1]?.direction !== message.direction
                            );

                            return (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex mb-2",
                                        isOutbound ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {!isOutbound && (
                                        <div className="w-8 mr-2 flex-shrink-0">
                                            {showAvatar && (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                                        {conversation.clientName.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    )}

                                    <div
                                        className={cn(
                                            "max-w-[70%] px-4 py-2 rounded-2xl",
                                            isOutbound
                                                ? "bg-primary text-white rounded-br-md"
                                                : "bg-white text-slate-900 rounded-bl-md shadow-sm"
                                        )}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {message.content}
                                        </p>
                                        <div
                                            className={cn(
                                                "flex items-center justify-end gap-1 mt-1",
                                                isOutbound ? "text-white/70" : "text-slate-400"
                                            )}
                                        >
                                            <span className="text-xs">
                                                {formatMessageTime(message.sentAt)}
                                            </span>
                                            {isOutbound && (
                                                message.status === "read" ? (
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                ) : message.status === "delivered" ? (
                                                    <CheckCheck className="w-3.5 h-3.5 opacity-50" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5 opacity-50" />
                                                )
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <AnimatePresence>
                    {showTemplates && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-3 p-3 bg-slate-50 rounded-xl shadow-inner"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                                    Быстрые ответы
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setShowTemplates(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.slice(0, 6).map((template) => (
                                    <button
                                        type="button"
                                        key={template.id}
                                        onClick={() => insertTemplate(template)}
                                        className="text-left p-3 rounded-xl hover:bg-white transition-all hover:shadow-sm border border-transparent hover:border-slate-100"
                                    >
                                        <p className="text-xs font-bold text-slate-900 truncate mb-0.5">
                                            {template.title}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate font-medium">
                                            {template.content}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-end gap-2">
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-10 w-10 rounded-xl transition-all",
                                showTemplates ? "bg-amber-50 text-amber-600" : "text-slate-400 hover:text-slate-600"
                            )}
                            onClick={() => setShowTemplates(!showTemplates)}
                        >
                            <Sparkles className="w-5 h-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-600"
                            disabled
                        >
                            <Paperclip className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 relative">
                        <Textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Введите сообщение..."
                            className="min-h-[44px] max-h-[120px] resize-none pr-12 rounded-2xl bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20 transition-all py-3 px-4 font-medium text-sm"
                            rows={1}
                        />
                        {inputValue.startsWith("/") && (
                            <div className="absolute left-4 -top-6 text-xs font-bold text-primary animate-bounce">
                                Нажмите Tab для вставки шаблона
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isSending}
                        className="h-11 w-11 rounded-2xl shadow-md transition-all active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>

                <div className="mt-3 p-2 bg-amber-50 rounded-xl border border-amber-100/50 text-center">
                    <p className="text-xs font-bold text-amber-700 leading-tight">
                        🚧 ДЕМО-РЕЖИМ • Сообщения не отправляются в реальные каналы.
                        <br />
                        Для интеграции обратитесь в поддержку CRM.
                    </p>
                </div>
            </div>
        </div>
    );
}
