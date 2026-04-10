"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  spacing?: "tight" | "normal" | "loose";
  plusAppearance?: "subtle" | "bold";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "square" | "circle";
}

interface AvatarGroupChildProps extends React.HTMLAttributes<HTMLElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "square" | "circle";
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 5, spacing = "normal", plusAppearance = "bold", size = "md", shape = "circle", ...props }, ref) => {
    const validChildren = React.Children.toArray(children).filter(React.isValidElement);
    const totalAvatars = validChildren.length;
    const showPlus = max > 0 && totalAvatars > max;
    const renderAvatars = showPlus ? validChildren.slice(0, max) : validChildren;

    return (
      <div
        ref={ref}
        className={cn("flex items-center isolate", className)}
        {...props}
      >
        {renderAvatars.map((child, index) => {
          const avatarChild = child as React.ReactElement<AvatarGroupChildProps>;
          return React.cloneElement(avatarChild, {
            key: index,
            // Pass size and shape down to children if not explicitly set on them
            size: avatarChild.props.size || size,
            shape: avatarChild.props.shape || shape,
            className: cn(
              avatarChild.props.className,
              "ring-2 ring-white relative",
              spacing === "tight" && "-ml-3 first:ml-0",
              spacing === "normal" && "-ml-2 first:ml-0",
              spacing === "loose" && "-ml-1.5 first:ml-0"
            ),
            style: {
              ...(avatarChild.props.style || {}),
              zIndex: index,
            },
          });
        })}

        {showPlus && (
          <div
            className={cn(
              "relative flex shrink-0 items-center justify-center font-bold ring-2 ring-white",
              // Match child size and shape
              size === "xs" && "size-6 text-xs",
              size === "sm" && "size-8 text-xs",
              size === "md" && "size-10 text-sm",
              size === "lg" && "size-12 text-base",
              size === "xl" && "size-16 text-xl",
              shape === "circle" ? "rounded-full" : "rounded-element",
              spacing === "tight" && "-ml-3",
              spacing === "normal" && "-ml-2",
              spacing === "loose" && "-ml-1.5",
              plusAppearance === "bold" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
            )}
            style={{ zIndex: renderAvatars.length }}
          >
            +{totalAvatars - max}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
