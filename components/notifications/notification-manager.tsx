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
    const originalFavicons = useRef<Map<HTMLLinkElement, string>>(new Map());

    // Reset new orders indicator when visiting the orders page
    useEffect(() => {
        if (pathname?.includes("/dashboard/orders")) {
            setTimeout(() => setHasNewOrders(false), 0);
        }
    }, [pathname]);

    const updateFavicon = (count: number, showOrderDot: boolean) => {
        if (typeof window === "undefined") return;

        const faviconElements = Array.from(document.querySelectorAll('link[rel*="icon"]')) as HTMLLinkElement[];

        if (faviconElements.length === 0) {
            // If no favicon found yet, retry once after a delay (Next.js might be inserting them)
            return;
        }

        // Store original hrefs on first encounter for each element
        faviconElements.forEach(el => {
            if (!originalFavicons.current.has(el)) {
                // Important: store the initial href before we modify it
                originalFavicons.current.set(el, el.href);
            }
        });

        if (count <= 0 && !showOrderDot) {
            faviconElements.forEach(el => {
                const original = originalFavicons.current.get(el);
                if (original && el.href !== original) {
                    el.href = original;
                }
            });
            return;
        }

        // Use the first icon as the base template
        const mainFavicon = faviconElements[0];
        const originalHref = originalFavicons.current.get(mainFavicon);
        if (!originalHref) return;

        const img = new Image();

        // Only use crossOrigin if it's an absolute URL from another origin to prevent loading issues
        const isExternal = originalHref.startsWith('http') && !originalHref.includes(window.location.host);
        if (isExternal) {
            img.crossOrigin = "anonymous";
        }

        img.src = originalHref;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, 32, 32);

            // Draw original icon
            ctx.drawImage(img, 0, 0, 32, 32);

            // 1. Order Dot (Top-Left) - Purple
            if (showOrderDot) {
                ctx.save();
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
                ctx.restore();
            }

            // 2. Badge (Top-Right) - Red with count
            if (count > 0) {
                const text = count > 9 ? "9+" : count.toString();
                const badgeRadius = text.length > 1 ? 10 : 8;
                const badgeX = 32 - badgeRadius;
                const badgeY = badgeRadius;

                ctx.save();
                // Shadow for badge
                ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 1;

                // Draw badge circle
                ctx.beginPath();
                ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
                ctx.fillStyle = "#ef4444"; // Bright Red (rose-500 equivalent)
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
                ctx.font = `bold ${text.length > 1 ? '11px' : '13px'} Arial, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                // Adjust text position slightly for optical centering
                ctx.fillText(text, badgeX, badgeY + 1);
                ctx.restore();
            }

            const dataUrl = canvas.toDataURL("image/png");

            // Update all favicon elements
            faviconElements.forEach(el => {
                if (el.href !== dataUrl) {
                    el.href = dataUrl;
                }
            });
        };

        img.onerror = () => {
            console.warn("Failed to update favicon badge: could not load", originalHref);
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
