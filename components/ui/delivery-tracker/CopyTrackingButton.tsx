"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Copy } from "lucide-react";

export function CopyTrackingButton({ tracking, className }: { tracking: string; className?: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(tracking);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={cn(
                "p-1.5 rounded-md hover:bg-slate-100 transition-colors",
                className
            )}
            title="Копировать трек-номер"
        >
            {copied ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
                <Copy className="w-4 h-4 text-slate-400" />
            )}
        </button>
    );
}
