export type DeliveryProvider = "cdek" | "russian_post" | "boxberry" | "dpd" | "pek" | "dellin" | "custom";

export type DeliveryStatus =
    | "created"
    | "accepted"
    | "in_transit"
    | "arrived_at_destination"
    | "out_for_delivery"
    | "delivered"
    | "returned"
    | "lost"
    | "customs"
    | "awaiting_pickup";

export interface DeliveryEvent {
    id: string;
    status: DeliveryStatus;
    title: string;
    description?: string;
    location?: string;
    timestamp: Date;
}

export interface DeliveryInfo {
    trackingNumber: string;
    provider: DeliveryProvider;
    providerName?: string;
    status: DeliveryStatus;
    statusLabel?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
    senderCity?: string;
    receiverCity?: string;
    receiverAddress?: string;
    receiverName?: string;
    receiverPhone?: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    events: DeliveryEvent[];
    lastUpdate?: Date;
    providerUrl?: string;
}

export interface DeliveryTrackerProps {
    delivery: DeliveryInfo;
    onRefresh?: () => void;
    isLoading?: boolean;
    className?: string;
}

export interface DeliveryTrackerCompactProps {
    delivery: DeliveryInfo;
    onClick?: () => void;
    className?: string;
}

export interface DeliveryBadgeProps {
    provider: DeliveryProvider;
    tracking: string;
    status: DeliveryStatus;
    className?: string;
}

export interface TrackingInputProps {
    onTrack: (provider: DeliveryProvider, tracking: string) => void;
    isLoading?: boolean;
    className?: string;
}

export interface RecipientInfoProps {
    name?: string;
    phone?: string;
    address?: string;
    className?: string;
}
