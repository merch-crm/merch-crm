"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const EditorLoader = dynamic(
    () => import("./editor-page-client").then((mod) => mod.EditorPageClient),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-[600px] w-full p-4">
                <Skeleton className="w-full h-full rounded-xl" />
            </div>
        )
    }
);
