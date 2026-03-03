"use client";

import { useRouter } from"next/navigation";
import { useEffect } from"react";

export default function WarehouseRootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/warehouse/overview");
    }, [router]);

    return null;
}
