"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ButtonProps {
    text?: string;
}

export function SubmitButton({
    children,
    className,
    disabled,
    text,
    color = "dark",
    isLoading,
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus();
    const isLoadingState = isLoading || pending;

    return (
        <Button 
            type="submit" 
            disabled={disabled || isLoadingState} 
            color={color}
            className={cn("gap-2", className)} 
            isLoading={isLoadingState}
            {...props}
        >
            {text || children}
        </Button>
    );
}
