"use client";

import { useEffect, useState, useRef } from "react";
import { playNotificationSound } from "@/lib/sounds";

interface NotificationManagerProps {
    initialUnreadCount: number;
    userId: string;
}

export function NotificationManager({ initialUnreadCount }: NotificationManagerProps) {
    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const [orderCount, setOrderCount] = useState<number | null>(null);
    const prevCount = useRef(initialUnreadCount);
    const prevOrderCount = useRef<number | null>(null);
    const originalFavicon = useRef<string | null>(null);

    const updateFavicon = (count: number) => {
        if (typeof window === "undefined") return;

        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!favicon) return;

        if (!originalFavicon.current) {
            originalFavicon.current = favicon.href;
        }

        if (count === 0) {
            favicon.href = originalFavicon.current;
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = favicon.href;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, 32, 32);

            if (count > 0) {
                // Draw badge
                ctx.beginPath();
                ctx.arc(24, 8, 7, 0, 2 * Math.PI);
                ctx.fillStyle = "#ef4444";
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            favicon.href = canvas.toDataURL("image/png");
        };
    };

    useEffect(() => {
        if (unreadCount > prevCount.current) {
            playNotificationSound();
        }
        prevCount.current = unreadCount;
        updateFavicon(unreadCount);
    }, [unreadCount]);

    useEffect(() => {
        if (orderCount !== null && prevOrderCount.current !== null && orderCount > prevOrderCount.current) {
            playNotificationSound();
        }
        prevOrderCount.current = orderCount;
    }, [orderCount]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const nRes = await fetch("/api/notifications/unread-count");
                const nData = await nRes.json();
                if (typeof nData.count === "number") {
                    setUnreadCount(nData.count);
                }

                const oRes = await fetch("/api/orders/count");
                const oData = await oRes.json();
                if (typeof oData.count === "number") {
                    setOrderCount(oData.count);
                }
            } catch (e) {
                // Ignore
            }
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return null;
}
