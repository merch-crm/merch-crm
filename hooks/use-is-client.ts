"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if component is mounted on the client.
 * Use this to avoid hydration mismatches for browser-only APIs or dynamic data.
 */
export function useIsClient() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return isClient;
}
