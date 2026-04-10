"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/components/library/custom/utils/cn";
import { Monitor, Tablet, Smartphone } from "lucide-react";

type Device = "desktop" | "tablet" | "mobile";

const deviceConfig: Record<
  Device,
  { width: number; height: number; label: string; icon: typeof Monitor }
> = {
  desktop: { width: 1280, height: 800, label: "Desktop", icon: Monitor },
  tablet: { width: 768, height: 1024, label: "Tablet", icon: Tablet },
  mobile: { width: 375, height: 812, label: "Mobile", icon: Smartphone },
};

interface DevicePreviewProps {
  device: Device;
  children: ReactNode;
  className?: string;
  maxPreviewHeight?: number;
}

function IframePortal({
  children,
  width,
  height,
  maxPreviewHeight,
}: {
  children: ReactNode;
  width: number;
  height: number;
  maxPreviewHeight: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Copy parent styles into iframe
      const parentStyles = document.querySelectorAll(
        'link[rel="stylesheet"], style'
      );
      parentStyles.forEach((style) => {
        doc.head.appendChild(style.cloneNode(true));
      });

      // Copy CSS custom properties
      const root = doc.documentElement;
      const parentRoot = document.documentElement;
      const computedStyle = getComputedStyle(parentRoot);
      const cssVars = [
        "--background",
        "--foreground",
        "--primary",
        "--primary-hover",
        "--primary-light",
        "--card",
        "--border",
        "--muted",
        "--muted-foreground",
        "--radius-outer",
        "--radius-inner",
        "--radius-padding",
        "--padding-xl",
        "--crm-grid-gap",
        "--shadow-crm-sm",
        "--shadow-crm-md",
        "--shadow-crm-lg",
      ];
      cssVars.forEach((v) => {
        root.style.setProperty(v, computedStyle.getPropertyValue(v));
      });

      // Set body styles
      doc.body.style.margin = "0";
      doc.body.style.padding = "16px";
      doc.body.style.fontFamily = "Manrope, sans-serif";
      doc.body.style.backgroundColor = "#f2f2f2";
      doc.body.style.overflow = "auto";

      // Create mount point
      let container = doc.getElementById("preview-root");
      if (!container) {
        container = doc.createElement("div");
        container.id = "preview-root";
        doc.body.appendChild(container);
      }
      setMountNode(container);
    };

    iframe.addEventListener("load", handleLoad);
    // Trigger for about:blank
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => iframe.removeEventListener("load", handleLoad);
  }, []);

  // Scale to fit container
  const scale = Math.min(1, 600 / width); // max container width ~600px
  const scaledHeight = Math.min(height * scale, maxPreviewHeight);

  return (
    <div
      className="relative overflow-hidden rounded-b-[var(--radius-inner)] bg-[var(--background)]"
      style={{ height: scaledHeight }}
    >
      <iframe
        ref={iframeRef}
        src="about:blank"
        title="Device Preview"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          border: "none",
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </div>
  );
}

export function DevicePreview({
  device,
  children,
  className,
  maxPreviewHeight = 500,
}: DevicePreviewProps) {
  const config = deviceConfig[device];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-inner)] border border-border bg-white",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          {config.label}
        </span>
        <span className="ml-auto text-[11px] tabular-nums text-muted-foreground/60">
          {config.width} × {config.height}
        </span>
      </div>

      {/* iframe preview */}
      <IframePortal width={config.width} height={config.height} maxPreviewHeight={maxPreviewHeight}>
        {children}
      </IframePortal>
    </div>
  );
}

export function ResponsiveShowcase({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      {title && (
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      )}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <DevicePreview device="desktop">{children}</DevicePreview>
        <DevicePreview device="tablet">{children}</DevicePreview>
        <DevicePreview device="mobile">{children}</DevicePreview>
      </div>
    </div>
  );
}
