"use client";

import { useEffect } from "react";

export function NotificationInitializer() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((_registration) => {
            // SW registered
          })
          .catch((err) => {
            console.error("SW failed:", err);
          });
      });
    }
  }, []);

  return null;
}
