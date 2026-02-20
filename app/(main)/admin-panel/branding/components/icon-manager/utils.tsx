import React from "react";
import { IconGroup, IconItem, IconGroupInput, SerializedIconGroup } from "./types";

import { ReactSVG } from "react-svg";

/**
 * Creates a React component from an SVG string
 */
export const createSvgIcon = (content: string): React.ComponentType<{ className?: string }> => {
    const SvgIcon = ({ className }: { className?: string }) => {
        // Create an object URL from the raw SVG string since ReactSVG expects a URL
        const blob = new Blob([content], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        return (
            <ReactSVG
                src={url}
                className={className}
                beforeInjection={(svg) => {
                    svg.setAttribute('width', '100%');
                    svg.setAttribute('height', '100%');
                }}
            />
        );
    };
    SvgIcon.displayName = 'SvgIcon';
    return SvgIcon;
};

/**
 * Handle pluralization for Russian language
 */
export const pluralize = (count: number, one: string, two: string, five: string) => {
    const n = Math.abs(count) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return five;
    if (n1 > 1 && n1 < 5) return two;
    if (n1 === 1) return one;
    return five;
};

/**
 * Prepare internal React state for server-side persistence
 * (Handles converting React components back to serializable data if needed)
 */
export const prepareGroupsForSave = (groups: IconGroup[]): IconGroupInput[] => {
    return groups.map(g => ({
        name: g.label,
        group_icon: (g.groupIcon as React.ComponentType & { displayName?: string }).displayName || g.groupIcon.name || "Sparkles",
        icons: g.icons.map(i => ({
            name: i.name,
            label: i.label,
            svg: i.svgContent
        }))
    }));
};

/**
 * Serialize icon groups for server actions (ensuring they are plain objects)
 */
export const serializeIconGroups = (groups: IconGroupInput[]): SerializedIconGroup[] => {
    return JSON.parse(JSON.stringify(groups));
};

/**
 * Pure functions for hydrating server data to React-friendly state
 * (Moved from main component to be accessible by dialogs/modals)
 */
export const hydrateIconGroups = (data: SerializedIconGroup[]): IconGroup[] => {
    // This is a simplified version, the actual Lucia/Lucide mapping 
    // is usually handled via name-to-component dictionary
    return (data || []).map(group => ({
        id: group.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${Math.random()}`,
        label: group.name || "Untitled",
        groupIcon: (group as unknown as { groupIcon?: React.ComponentType<{ className?: string }> }).groupIcon || (() => null), // Actual mapping happens in main component if needed
        icons: (group.icons || []).map(icon => ({
            name: icon.name,
            label: icon.label,
            // If it has SVG, create component, else it's a library icon
            icon: icon.svgContent ? createSvgIcon(icon.svgContent) : (() => null),
            svgContent: icon.svgContent
        }))
    }));
};
