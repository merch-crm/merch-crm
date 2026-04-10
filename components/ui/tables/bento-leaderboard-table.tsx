"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: string | number;
  trend: "up" | "down" | "flat";
}

interface BentoLeaderboardTableProps {
  title: string;
  users: LeaderboardUser[];
  className?: string;
}

export function BentoLeaderboardTable({ title, users: propUsers, className }: BentoLeaderboardTableProps) {
  const [isMounted, setIsMounted] = useState(false);
  const users = propUsers || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className={cn("bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card h-64 animate-pulse", className)} />;
  }

  return (
    <div className={cn("bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col", className)}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground  ">{title}</h3>
        <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shadow-inner">
          <Trophy className="w-4 h-4" />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
          <tbody>
            {(users || []).map((user) => (
              <tr key={user.id} className="group bg-secondary/20 hover:bg-secondary/50 hover:-translate-y-0.5 transition-all outline outline-1 outline-transparent hover:outline-border/50 rounded-element overflow-hidden shadow-sm">
                <td className="py-3 px-3 rounded-l-xl w-12 text-center text-xs font-black text-muted-foreground font-heading">
                  #{user.rank}
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm bg-background">
                        <Image src={user.avatar} alt={user.name} fill className="object-cover transition-opacity hover:opacity-80" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-background">
                        {user.name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                    )}
                    <span className="font-semibold">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right font-black font-heading ">
                  {user.score}
                </td>
                <td className="py-3 px-3 rounded-r-xl w-10 text-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center ml-auto",
                    user.trend === "up" ? "bg-emerald-50 text-emerald-500" :
                    user.trend === "down" ? "bg-rose-50 text-rose-500" : "bg-gray-50 text-gray-400"
                  )}>
                    {user.trend === "up" && <TrendingUp className="w-3 h-3" />}
                    {user.trend === "down" && <TrendingDown className="w-3 h-3" />}
                    {user.trend === "flat" && <Minus className="w-3 h-3" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
