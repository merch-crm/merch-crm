"use client";

import { useEffect } from "react";
import { trackActivity } from "@/app/(main)/admin-panel/actions";

export function useActivityTracker() {
    useEffect(() => {
        // Track immediately on mount
        trackActivity();

        // Track every 5 minutes
        const interval = setInterval(() => {
            trackActivity();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);
}
