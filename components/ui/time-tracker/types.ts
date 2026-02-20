import * as React from "react";

export type TrackerStatus = "idle" | "working" | "break" | "paused";

export interface TimeEntry {
    id: string;
    startTime: Date;
    endTime?: Date;
    status: TrackerStatus;
    note?: string;
}

export interface TimeTrackerProps {
    status: TrackerStatus;
    startTime?: Date | null;
    totalToday?: number;
    onStart: () => void;
    onStop: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onBreak?: () => void;
    className?: string;
}

export interface TimeTrackerCompactProps {
    status: TrackerStatus;
    startTime?: Date | null;
    onStart: () => void;
    onStop: () => void;
    className?: string;
}

export interface TimeTrackerToggleProps {
    isWorking: boolean;
    startTime?: Date | null;
    onToggle: () => void;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export interface TimeTrackerWidgetProps {
    status: TrackerStatus;
    startTime?: Date | null;
    entries: TimeEntry[];
    onStart: () => void;
    onStop: () => void;
    className?: string;
}

export interface TimeTrackerBadgeProps {
    status: TrackerStatus;
    startTime?: Date | null;
    className?: string;
}

export interface TimeTrackerStatsProps {
    periodLabel: string;
    totalTime: number;
    averagePerDay?: number;
    daysWorked?: number;
    className?: string;
}
