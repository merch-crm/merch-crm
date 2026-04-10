"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { User } from "lucide-react";

export interface StatusAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  badgeText?: string;
  showIndicators?: boolean;
}

const StatusAvatar = React.forwardRef<HTMLDivElement, StatusAvatarProps>(
  ({ className, src, badgeText = "ST", showIndicators = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-3", className)}
        {...props}
      >
        <div className="relative">
          <div className="size-20 rounded-[28px] bg-slate-900 p-0.5 shadow-2xl">
            <div className="w-full h-full rounded-[26px] bg-white p-1">
              <div className="w-full h-full rounded-[24px] bg-slate-100 flex items-center justify-center overflow-hidden">
                <Avatar shape="square" size="xl" className="w-full h-full rounded-[24px] bg-slate-100 shadow-none border-none text-slate-400">
                  <AvatarImage src={src} />
                  <AvatarFallback className="bg-transparent">
                    <User size={40} className="mt-2 text-slate-400 opacity-50" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white">
            {badgeText}
          </div>
        </div>

        {showIndicators && (
          <div className="flex flex-col gap-1.5">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse-slow shadow-[0_0_12px_rgba(16,185,129,0.3)]" />
            <div className="size-2 bg-slate-200 rounded-full" />
            <div className="size-2 bg-slate-200 rounded-full" />
          </div>
        )}
      </div>
    );
  }
);
StatusAvatar.displayName = "StatusAvatar";

export { StatusAvatar };
