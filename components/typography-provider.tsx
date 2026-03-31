"use client";

import React, { useEffect } from "react";
import { applyTypography } from "@/lib/typography";

/**
 * TypographyProvider
 * 
 * A global component that uses MutationObserver to automatically apply
 * typography rules (non-breaking spaces) to all text nodes in the DOM.
 */
export function TypographyProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Function to process a single node
        const processNode = (node: Node) => {
            // Only process text nodes
            if (node.nodeType === Node.TEXT_NODE) {
                const originalText = node.textContent || "";
                const typographedText = applyTypography(originalText);

                if (originalText !== typographedText) {
                    node.textContent = typographedText;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Skip processing for script, style, and interactive inputs
                const tagName = (node as Element).tagName.toLowerCase();
                if (["script", "style", "textarea", "input"].includes(tagName)) {
                    return;
                }

                // Recursively process children
                node.childNodes.forEach(processNode);
            }
        };

        // Initial pass on mount
        processNode(document.body);

        // Observer to handle dynamic content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach(processNode);
                } else if (mutation.type === "characterData") {
                    // Prevent infinite loops: check if the change was made by us
                    const node = mutation.target;
                    const originalText = node.textContent || "";
                    const typographedText = applyTypography(originalText);

                    if (originalText !== typographedText) {
                        node.textContent = typographedText;
                    }
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
        });

        return () => observer.disconnect();
    }, []);

    return <>{children}</>;
}
