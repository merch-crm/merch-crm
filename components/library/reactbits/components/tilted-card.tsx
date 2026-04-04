"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "../utils/cn";

interface TiltedCardProps {
  imageSrc: string;
  altText?: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  scaleOnHover?: number;
  rotateAmplitude?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  displayOverlayContent?: boolean;
  overlayContent?: React.ReactNode;
  className?: string;
}

export const TiltedCard = ({
  imageSrc,
  altText = "Tilted card image",
  captionText = "",
  containerHeight = "600px",
  containerWidth = "100%",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showTooltip = true,
  displayOverlayContent = false,
  overlayContent = null,
  className = "",
}: TiltedCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTransform(
      `perspective(600px) rotateX(${-y * rotateAmplitude}deg) rotateY(${x * rotateAmplitude}deg) scale(${scaleOnHover})`
    );
  };

  const handleMouseLeave = () => {
    setTransform("perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ height: containerHeight, width: containerWidth }}
    >
      <figure
        ref={containerRef}
        className="relative cursor-pointer"
        style={{ width: imageWidth, height: imageHeight }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="h-full w-full relative">
          <Image
            src={imageSrc}
            alt={altText}
            fill
            className="rounded-xl object-cover transition-transform duration-200 ease-out"
            style={{ transform }}
          />
        </div>
        {displayOverlayContent && overlayContent && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
            {overlayContent}
          </div>
        )}
        {showTooltip && captionText && (
          <figcaption className="mt-2 text-center text-sm text-neutral-400">
            {captionText}
          </figcaption>
        )}
      </figure>
    </div>
  );
};
