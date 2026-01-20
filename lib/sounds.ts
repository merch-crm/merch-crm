"use client";

export const playNotificationSound = () => {
    try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
        console.error("Error playing sound:", e);
    }
};

export const playActionSound = () => {
    try {
        const audio = new Audio("/sounds/action.mp3");
        audio.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
        console.error("Error playing sound:", e);
    }
};
