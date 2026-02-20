import * as React from "react";

export interface IconItem {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    svgContent?: string;
}

export interface IconGroup {
    id: string;
    label: string;
    groupIcon: React.ComponentType<{ className?: string }>;
    icons: IconItem[];
}

export interface IconGroupInput {
    name: string;
    group_icon: string;
    groupIconName?: string;
    icons: Array<{
        name: string;
        label: string;
        svg?: string;
    }>;
}

export interface SerializedIconGroup {
    name: string;
    group_icon?: string;
    groupIconName: string;
    icons: Array<{
        name: string;
        label: string;
        svgContent?: string;
    }>;
}
