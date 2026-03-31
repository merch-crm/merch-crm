"use client";

import { useEffect, useCallback, useState } from "react";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    // Only show browser notification if document is hidden (user is in another tab)
    if (document.visibilityState === "visible") return;

    if (permission === "granted") {
      new Notification(title, {
        icon: "/favicon.ico",
        ...options,
      });
    }
  }, [permission]);

  return { permission, requestPermission, showNotification };
}

export function registerServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("/sw.js").then(
        function(registration) {
          console.log("ServiceWorker registration successful with scope: ", registration.scope);
        },
        function(err) {
          console.log("ServiceWorker registration failed: ", err);
        }
      );
    });
  }
}
