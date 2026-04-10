"use client";

import dynamic from "next/dynamic";

export const AiLabClientWrapper = dynamic(
  () => import("./ai-lab-client").then(mod => mod.AiLabClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
);
