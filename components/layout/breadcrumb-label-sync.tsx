"use client";

import { useEffect } from "react";
import { useBreadcrumbs } from "./breadcrumbs-context";

interface BreadcrumbLabelSyncProps {
    id: string;
    label: string;
}

export function BreadcrumbLabelSync({ id, label }: BreadcrumbLabelSyncProps) {
    const { setLabels } = useBreadcrumbs();

    useEffect(() => {
        setLabels(prev => {
            if (prev.get(id) === label) return prev;
            const next = new Map(prev);
            next.set(id, label);
            return next;
        });
    }, [id, label, setLabels]);

    return null;
}
