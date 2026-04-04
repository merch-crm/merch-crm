"use client";

import React from "react";
import { useProgress, Html } from "@react-three/drei";

export const Loader: React.FC = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3 backdrop-blur-md bg-slate-900/50 p-4 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <span className="text-xs font-bold text-white/70">{Math.round(progress)} %</span>
            </div>
        </Html>
    );
};
