"use client";

import { useFormStatus } from "react-dom";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends ButtonProps {
    isLoading?: boolean;
    text?: string;
    loadingText?: string;
}

export function SubmitButton({
    children,
    isLoading,
    className,
    disabled,
    text,
    loadingText,
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus();
    const isLoadingState = isLoading || pending;

    return (
        <Button
            type="submit"
            disabled={disabled || isLoadingState}
            className={cn("gap-2", className)}
            {...props}
        >
            {isLoadingState && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoadingState ? (loadingText || text || children) : (text || children)}
        </Button>
    );
}
