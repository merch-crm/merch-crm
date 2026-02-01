"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [startPoint, setStartPoint] = useState(0);
    const [pullChange, setPullChange] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (window.scrollY === 0) {
                setStartPoint(e.touches[0].clientY);
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (window.scrollY === 0 && startPoint > 0) {
                const pull = e.touches[0].clientY - startPoint;
                if (pull > 0) {
                    setPullChange(pull);
                    // Prevent default only if we are pulling down significantly to avoid interfering with normal scroll too much
                    if (pull > 50) e.preventDefault();
                }
            }
        };

        const handleTouchEnd = () => {
            if (pullChange > 120) { // Threshold to refresh
                setRefreshing(true);
                setPullChange(0); // Snap back or keep spinning? 
                // Let's keep it spinning for a bit or just trigger refresh
                router.refresh();
                setTimeout(() => {
                    setRefreshing(false);
                    setStartPoint(0);
                }, 1000);
            } else {
                setPullChange(0);
                setStartPoint(0);
            }
        };

        document.addEventListener("touchstart", handleTouchStart);
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [startPoint, pullChange, router]);

    return (
        <>
            <div
                className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none transition-transform duration-200"
                style={{
                    transform: `translateY(${refreshing ? 20 : pullChange > 0 ? pullChange * 0.4 : -50}px)`,
                    opacity: pullChange > 0 || refreshing ? 1 : 0
                }}
            >
                <div className="bg-white rounded-full p-2 shadow-xl border border-slate-200 flex items-center justify-center">
                    <Loader2 className={`w-5 h-5 text-#5d00ff ${refreshing || pullChange > 100 ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullChange * 2}deg)` }} />
                </div>
            </div>
            {children}
        </>
    );
}
