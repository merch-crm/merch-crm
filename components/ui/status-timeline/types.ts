import * as React from "react";

export type StatusType =
    | "created"
    | "confirmed"
    | "paid"
    | "processing"
    | "packed"
    | "shipped"
    | "in_transit"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded"
    | "on_hold"
    | "custom";

export type StatusState = "completed" | "current" | "pending" | "error";

export interface StatusEvent {
    id: string;
    status: StatusType;
    label: string;
    description?: string;
    timestamp: Date;
    user?: string;
    comment?: string;
    icon?: React.ReactNode;
    state?: StatusState;
}

export interface StatusTimelineProps {
    events: StatusEvent[];
    className?: string;
}

export interface StatusTimelineHorizontalProps {
    events: StatusEvent[];
    className?: string;
}

export interface StatusTimelineCardProps {
    events: StatusEvent[];
    title?: string;
    currentStatus?: string;
    className?: string;
}

export interface StatusTimelineMiniProps {
    events: StatusEvent[];
    maxVisible?: number;
    className?: string;
}

export interface StatusTimelineGroupedProps {
    events: StatusEvent[];
    className?: string;
}

export interface StatusBadgeProps {
    status: StatusType;
    label?: string;
    size?: "sm" | "md";
    className?: string;
}
