"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

interface AvatarStackProps {
  users: Array<Partial<User> & { id: string }>;
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
}

export function AvatarStack({ users, maxDisplay = 3, size = "sm" }: AvatarStackProps) {
  const safeUsers = users || [];
  const displayUsers = safeUsers.slice(0, maxDisplay);
  const remainingCount = safeUsers.length - maxDisplay;

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-11 w-11 text-base",
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
  };

  if (safeUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <Tooltip 
            key={user.id}
            content={<p className="font-medium">{user.name}</p>}
          >
              <Avatar
                className={cn(
                  sizeClasses[size],
                  "border-2 border-white cursor-pointer transition-all duration-200",
                  "hover:z-20 hover:scale-110 hover:border-violet-200",
                  "ring-0 hover:ring-2 hover:ring-violet-400/30"
                )}
                style={{ zIndex: displayUsers.length - index }}
              >
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-violet-400 to-purple-500 text-white font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip
            content={
              <p className="font-medium">
                {users.slice(maxDisplay).map((u) => u.name).join(", ")}
              </p>
            }
          >
              <div
                className={cn(
                  sizeClasses[size],
                  "rounded-full bg-slate-100 border-2 border-white flex items-center justify-center",
                  "text-slate-600 font-semibold cursor-pointer",
                  "hover:bg-slate-200 transition-colors"
                )}
              >
                +{remainingCount}
              </div>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
