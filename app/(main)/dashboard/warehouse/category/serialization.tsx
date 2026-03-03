import React from"react";
import DOMPurify from"isomorphic-dompurify";
import { cn } from"@/lib/utils";
import { ALL_ICONS_MAP, ICON_GROUPS, Box } from"./icons";

// Types for icon group serialization
export interface IconGroupInput {
    name: string;
    groupIcon?: React.ComponentType<{ className?: string }>;
    groupIconName?: string;
    icons: Array<{ name: string; label: string; svgContent?: string; icon?: React.ComponentType<{ className?: string }> }>;
}

export interface SerializedIconGroup {
    name: string;
    groupIconName: string;
    icons: Array<{ name: string; label: string; svgContent?: string }>;
}

// Functions to serialize/deserialize for DB storage
export function serializeIconGroups(groups: IconGroupInput[]): SerializedIconGroup[] {
    return groups.map(group => ({
        name: group.name,
        // Store groupIcon as string name only if it's a function (component)
        groupIconName: typeof group.groupIcon === 'function' ?
            Object.keys(ALL_ICONS_MAP).find(key => ALL_ICONS_MAP[key] === group.groupIcon) ||"box"
            : group.groupIconName ||"box",
        icons: group.icons.map((icon) => ({
            name: icon.name,
            label: icon.label,
            svgContent: icon.svgContent
        }))
    }));
}

export const createSvgIcon = (svgContent: string) => {
    const SvgIcon = ({ className }: { className?: string }) => {
        const sanitizedContent = DOMPurify.sanitize(
            svgContent.includes('<svg') ? svgContent : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svgContent}</svg>`,
            { ALLOWED_TAGS: ['svg', 'path', 'g', 'circle', 'rect', 'line', 'polyline', 'polygon'], ALLOWED_ATTR: ['viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'd', 'points', 'x', 'y', 'width', 'height', 'r', 'cx', 'cy', 'transform'] }
        );

        return (
            <div
                className={cn("flex items-center justify-center", className)}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }} // Safe: Sanitized via DOMPurify
            />
        );
    };
    SvgIcon.displayName = 'SvgIcon';
    return SvgIcon;
};

export function hydrateIconGroups(storedGroups: SerializedIconGroup[]) {
    if (!storedGroups || !Array.isArray(storedGroups)) return ICON_GROUPS;

    return storedGroups.map(group => {
        // Find group icon component
        const GroupIconComponent = ALL_ICONS_MAP[group.groupIconName] || Box;

        return {
            ...group,
            groupIcon: GroupIconComponent,
            icons: group.icons.map((icon) => ({
                ...icon,
                icon: icon.svgContent ? createSvgIcon(icon.svgContent) : (ALL_ICONS_MAP[icon.name] || Box)
            }))
        };
    });
}
