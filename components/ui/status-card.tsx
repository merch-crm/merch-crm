"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { User } from "lucide-react";

export interface StatusCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  statusText: string;
  availabilityText: string;
  avatarSrc?: string;
  onProfileClick?: () => void;
  onChatClick?: () => void;
}

const StatusCard = React.forwardRef<HTMLDivElement, StatusCardProps>(
  ({ className, name, statusText, availabilityText, avatarSrc, onProfileClick, onChatClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-3 p-6 bg-white rounded-[32px] border border-gray-100 shadow-crm-md w-full max-w-sm justify-between",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <div className="relative group/avatar">
            <Avatar shape="square" size="xl" className="rounded-[24px] bg-slate-900 border-none text-white shadow-2xl transition-transform hover:scale-105 duration-500 overflow-visible">
              <AvatarImage src={avatarSrc} alt={name} />
              <AvatarFallback className="bg-transparent">
                <User size={40} className="mt-2 opacity-50 relative z-10" />
              </AvatarFallback>
            </Avatar>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-400/20 to-transparent rounded-[24px] z-0 pointer-events-none" />
            
            {/* Status dot */}
            <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse-slow z-20" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-black text-slate-900">{name}</h4>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">{statusText}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-emerald-500 rounded-full" />
            <span className="text-[11px] font-black text-slate-600">{availabilityText}</span>
          </div>
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="size-5 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onProfileClick}
            className="py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black hover:bg-slate-800 transition-all"
          >
            Профиль
          </button>
          <button
            type="button"
            onClick={onChatClick}
            className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-black hover:border-slate-400 hover:text-slate-900 transition-all"
          >
            Чат
          </button>
        </div>
      </div>
    );
  }
);
StatusCard.displayName = "StatusCard";

export { StatusCard };
