"use client";

import { useRouter, usePathname } from "next/navigation";
import type { ApplicationType } from "@/lib/schema/production";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Settings, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TypeTabsProps {
  types: (ApplicationType & { orderCount?: number })[];
  activeSlug?: string;
  totalOrdersCount?: number;
}

export function TypeTabs({ types, activeSlug, totalOrdersCount = 0 }: TypeTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isAllActive = !activeSlug || pathname === "/dashboard/production";

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-2">
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-1">
            {/* All Orders Tab */}
            <Button color={isAllActive ? "primary" : "neutral"} size="sm" className={cn( "rounded-lg gap-2 shrink-0 h-9", isAllActive && "bg-primary/10 text-primary hover:bg-primary/20" )} onClick={() => router.push("/dashboard/production")}
            >
              <LayoutGrid className="h-4 w-4" />
              Все
              {totalOrdersCount > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-none" color="neutral">
                  {totalOrdersCount}
                </Badge>
              )}
            </Button>

            {/* Divider */}
            <div className="w-px h-6 bg-border mx-2" />

            {/* Type Tabs */}
            {types.map((type) => {
              const isActive = activeSlug === type.slug;
              return (
                <Button key={type.id} color={isActive ? "primary" : "neutral"} size="sm" className={cn( "rounded-lg gap-2 shrink-0 h-9", isActive && "bg-primary/10 text-primary hover:bg-primary/20" )} onClick={() => router.push(`/dashboard/production/${type.slug}`)}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: type.color || undefined }}
                  />
                  {type.name}
                  {type.orderCount !== undefined && type.orderCount > 0 && (
                    <Badge className="ml-1 h-5 px-1.5 text-xs font-bold border-none" color="neutral">
                      {type.orderCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Settings Link */}
        <div className="flex items-center pl-2 border-l ml-2">
          <Link href="/dashboard/production/settings">
            <Button variant="ghost" color="neutral" size="icon" className="rounded-lg h-9 w-9 shrink-0" title="Настройки производства">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
