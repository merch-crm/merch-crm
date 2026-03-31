"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationList } from "./components/conversation-list";
import { ChatWindow } from "./components/chat-window";
import { ChannelTabs } from "./components/channel-tabs";
import {
    getConversations,
    getConversationMessages,
    sendMessage,
} from "./actions";
import type {
    ConversationWithDetails,
    MessageWithSender
} from "./actions/chat.types";
import type { MessageTemplate } from "@/lib/schema/communications";
import { useToast } from "@/components/ui/toast";

interface CommunicationsClientProps {
    initialConversations: ConversationWithDetails[];
    templates: MessageTemplate[];
    stats?: {
        totalConversations: number;
        activeConversations: number;
        unreadConversations: number;
        totalUnreadMessages: number;
        byChannel: Array<{ channelType: string; count: number; unread: number }>;
    } | Record<string, unknown>;
}

export function CommunicationsClient({
    initialConversations,
    templates,
    stats,
}: CommunicationsClientProps) {
    const { toast } = useToast();

    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
    const [messages, setMessages] = useState<MessageWithSender[]>([]);
    const [activeChannel, setActiveChannel] = useState("all");
    const [ui, setUi] = useState({
        isLoadingConversations: false,
        isLoadingMessages: false,
        isSending: false,
        hasMoreMessages: false,
        searchQuery: "",
    });

    const channelStats = (Array.isArray(stats?.byChannel) ? stats.byChannel : []).reduce((acc, ch) => {
        acc[ch.channelType] = { count: ch.count, unread: ch.unread };
        return acc;
    }, {} as Record<string, { count: number; unread: number }>) || {};

    const loadConversations = useCallback(async () => {
        setUi(prev => ({ ...prev, isLoadingConversations: true }));
        try {
            const res = await getConversations({
                channelType: activeChannel !== "all" ? activeChannel : undefined,
                search: ui.searchQuery || undefined,
            });
            if (res.success && res.data) {
                setConversations(res.data);
            }
        } catch (error) {
            console.error("Failed to load conversations:", error);
        } finally {
            setUi(prev => ({ ...prev, isLoadingConversations: false }));
        }
    }, [activeChannel, ui.searchQuery]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    const loadMessages = useCallback(async (conversationId: string) => {
        setUi(prev => ({ ...prev, isLoadingMessages: true }));
        try {
            const res = await getConversationMessages(conversationId);
            if (res.success) {
                setMessages(res.data);
                setUi(prev => ({ ...prev, hasMoreMessages: res.data.hasMore || false }));
            }
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setUi(prev => ({ ...prev, isLoadingMessages: false }));
        }
    }, []);

    const handleSelectConversation = (conversation: ConversationWithDetails) => {
        setSelectedConversation(conversation);
        loadMessages(conversation.id);

        setConversations(prev =>
            prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
        );
    };

    const handleSendMessage = async (content: string) => {
        if (!selectedConversation) return;

        setUi(prev => ({ ...prev, isSending: true }));
        try {
            const res = await sendMessage({
                conversationId: selectedConversation.id,
                content,
                messageType: "text",
            });

            if (res.success) {
                setMessages(prev => [...prev, res.data]);

                setConversations(prev =>
                    prev.map(c =>
                        c.id === selectedConversation.id
                            ? { ...c, lastMessagePreview: content, lastMessageAt: new Date() }
                            : c
                    )
                );

                toast("Сообщение отправлено (Демо)", "info");
            } else {
                toast(res.error || "Не удалось отправить сообщение", "error");
            }
        } catch (_error) {
            toast("Произошла ошибка при отправке", "error");
        } finally {
            setUi(prev => ({ ...prev, isSending: false }));
        }
    };

    const handleLoadMore = async () => {
        if (!selectedConversation || messages.length === 0) return;

        const oldestMessage = messages[0];
        const res = await getConversationMessages(
            selectedConversation.id,
            50,
            oldestMessage.sentAt.toString()
        );

        if (res.success) {
            setMessages(prev => [...res.data, ...prev]);
            setUi(prev => ({ ...prev, hasMoreMessages: res.data.hasMore || false }));
        }
    };

    const handleSearch = (query: string) => {
        setUi(prev => ({ ...prev, searchQuery: query }));
    };

    return (
        <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border border-slate-200/60 flex flex-col h-[calc(100vh-220px)] min-h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                <ChannelTabs
                    activeChannel={activeChannel}
                    onChange={setActiveChannel}
                    stats={channelStats}
                />
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="w-80 lg:w-96 flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden">
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversation?.id}
                        onSelect={handleSelectConversation}
                        onSearch={handleSearch}
                        isLoading={ui.isLoadingConversations}
                    />
                </div>

                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    templates={templates}
                    onSendMessage={handleSendMessage}
                    onLoadMore={handleLoadMore}
                    hasMore={ui.hasMoreMessages}
                    isLoading={ui.isLoadingMessages}
                    isSending={ui.isSending}
                />
            </div>
        </div>
    );
}
