export interface ConversationWithDetails {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string | null;
  clientType: string;
  clientAvatar: string | null;
  channelType: string;
  channelName: string;
  channelColor: string;
  status: string;
  unreadCount: number;
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
  assignedManagerId: string | null;
  assignedManagerName: string | null;
}

export interface MessageWithSender {
  id: string;
  conversationId: string;
  direction: string;
  messageType: string;
  content: string | null;
  mediaUrl: string | null;
  status: string;
  sentAt: Date;
  sentById: string | null;
  sentByName: string | null;
  sentByAvatar: string | null;
}
