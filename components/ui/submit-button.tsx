"use client";

import { useFormStatus } from "react-dom";
import { CrmButton, CrmButtonProps } from "@/components/ui/crm-button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends CrmButtonProps {
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
    variant = "action",
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus();
    const isLoadingState = isLoading || pending;

    return (
        <CrmButton
            type="submit"
            disabled={disabled || isLoadingState}
            variant={variant}
            className={cn("gap-2", className)}
            {...props}
        >
            {isLoadingState ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>{loadingText || text || children}</span>
                </>
            ) : (
                <span>{text || children}</span>
            )}
        </CrmButton>
    );
}
