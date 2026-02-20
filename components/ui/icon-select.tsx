import React from 'react';
import { Select, SelectProps, SelectOption } from './select';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconSelectProps extends Omit<SelectProps, 'options'> {
    startIcon?: LucideIcon;
    options: SelectOption[];
    containerClassName?: string;
}

export function IconSelect({ startIcon: StartIcon, options, className, containerClassName, ...props }: IconSelectProps) {
    return (
        <div className={cn("relative w-full", containerClassName)}>
            {StartIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted-foreground">
                    <StartIcon className="h-4 w-4" />
                </div>
            )}
            <Select
                className={cn(
                    StartIcon && "pl-10",
                    className
                )}
                options={options}
                {...props}
            />
        </div>
    );
}

IconSelect.displayName = 'IconSelect';
