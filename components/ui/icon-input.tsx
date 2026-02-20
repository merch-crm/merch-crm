
import React from 'react';
import { Input, InputProps } from './input';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconInputProps extends InputProps {
    startIcon?: LucideIcon;
    endIcon?: LucideIcon;
}

export const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
    ({ startIcon: StartIcon, endIcon: EndIcon, className, ...props }, ref) => {
        return (
            <div className="relative w-full">
                {StartIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted-foreground">
                        <StartIcon className="h-4 w-4" />
                    </div>
                )}
                <Input
                    className={cn(
                        StartIcon && "pl-10",
                        EndIcon && "pr-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {EndIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-muted-foreground">
                        <EndIcon className="h-4 w-4" />
                    </div>
                )}
            </div>
        );
    }
);
IconInput.displayName = 'IconInput';
