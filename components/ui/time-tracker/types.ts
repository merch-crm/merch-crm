
export type TrackerStatus ="idle" |"working" |"break" |"paused";

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
    initialElapsed?: number;
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
    initialElapsed?: number;
    onStart: () => void;
    onStop: () => void;
    onPause?: () => void;
    onResume?: () => void;
    className?: string;
}

export interface TimeTrackerToggleProps {
    status: TrackerStatus;
    startTime?: Date | null;
    initialElapsed?: number;
    onStart: () => void;
    onStop: () => void;
    onPause?: () => void;
    onResume?: () => void;
    size?:"sm" |"md" |"lg";
    className?: string;
}

export interface TimeTrackerWidgetProps {
    status: TrackerStatus;
    startTime?: Date | null;
    initialElapsed?: number;
    entries: TimeEntry[];
    onStart: () => void;
    onStop: () => void;
    onPause?: () => void;
    onResume?: () => void;
    className?: string;
}

export interface TimeTrackerBadgeProps {
    status: TrackerStatus;
    startTime?: Date | null;
    initialElapsed?: number;
    className?: string;
}

export interface TimeTrackerStatsProps {
    periodLabel: string;
    totalTime: number;
    averagePerDay?: number;
    daysWorked?: number;
    className?: string;
}
