"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { playSound } from "@/lib/sounds";

interface NotificationManagerProps {
    initialUnreadCount: number;
    customSoundUrl?: string | null;
}

export function NotificationManager({ initialUnreadCount, customSoundUrl }: NotificationManagerProps) {
    const pathname = usePathname();
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const [hasNewOrders, setHasNewOrders] = useState(false);

    const prevCount = useRef(initialUnreadCount);
    const prevOrderCount = useRef<number | null>(null);
    const originalFavicon = useRef<string | null>(null);

    // Reset new orders indicator when visiting the orders page
    useEffect(() => {
        if (pathname?.includes("/dashboard/orders")) {
            setTimeout(() => setHasNewOrders(false), 0);
        }
    }, [pathname]);


    const updateFavicon = (count: number, showOrderDot: boolean) => {
        if (typeof window === "undefined") return;

        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!favicon) return;

        if (!originalFavicon.current) {
            originalFavicon.current = favicon.href;
        }

        if (count <= 0 && !showOrderDot) {
            favicon.href = originalFavicon.current;
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = originalFavicon.current;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Draw original icon
            ctx.drawImage(img, 0, 0, 32, 32);

            // 1. Order Dot (Top-Left) - Purple
            if (showOrderDot) {
                ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(8, 8, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "#a855f7"; // purple-500
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Badge Configuration
            if (count > 0) {
                const text = count > 9 ? "9+" : count.toString();
                const badgeRadius = text.length > 1 ? 10 : 8;
                const badgeX = 32 - badgeRadius;
                const badgeY = badgeRadius;

                // Shadow for badge
                ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;

                // Draw badge circle
                ctx.beginPath();
                ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "#ff0000"; // Bright Red
                ctx.fill();

                // Clear shadow for text and stroke
                ctx.shadowBlur = 0;
                ctx.shadowOffsetY = 0;

                // Border
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.stroke();

                // Text
                ctx.fillStyle = "#ffffff";
                ctx.font = `bold ${text.length > 1 ? '11px' : '12px'} Arial, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Adjust text position slightly for optical centering
                ctx.fillText(text, badgeX, badgeY + 1);
            }

            favicon.href = canvas.toDataURL("image/png");
        };
    };

    useEffect(() => {
        if (unreadCount > prevCount.current) {
            playSound("notification");
        }
        prevCount.current = unreadCount;
        updateFavicon(unreadCount, hasNewOrders);
    }, [unreadCount, hasNewOrders, customSoundUrl]);

    useEffect(() => {
        if (orderCount !== null && prevOrderCount.current !== null && orderCount > prevOrderCount.current) {
            playSound("order_created");
            setTimeout(() => setHasNewOrders(true), 0);
        }
        prevOrderCount.current = orderCount;
    }, [orderCount, customSoundUrl]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const interval = setInterval(async () => {
            try {
                const [nRes, oRes] = await Promise.all([
                    fetch("/api/notifications/unread-count"),
                    fetch("/api/orders/count")
                ]);

                if (nRes.ok) {
                    const nData = await nRes.json();
                    if (typeof nData.count === "number") setUnreadCount(nData.count);
                }

                if (oRes.ok) {
                    const oData = await oRes.json();
                    if (typeof oData.count === "number") setOrderCount(oData.count);
                }
            } catch {
                // Ignore
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
