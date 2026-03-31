"use client";

import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { AuditLog } from "./utils";

interface UserAvatarProps {
    user: AuditLog['user'];
    size?: number;
}

export function UserAvatar({ user, size = 28 }: UserAvatarProps) {
    const initial = (user?.name || "С")[0];

    return (
        <div
            className={cn(
                "rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center",
                "text-xs font-bold text-slate-500 shrink-0 overflow-hidden relative"
            )}
            style={{ width: size, height: size }}
        >
            {user?.avatar ? (
                <>
                    <span className="absolute inset-0 flex items-center justify-center">
                        {initial}
                    </span>
                    <NextImage
                        src={user.avatar}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover relative z-10"
                        width={size}
                        height={size}
                        unoptimized
                    />
                </>
            ) : (
                initial
            )}
        </div>
    );
}
