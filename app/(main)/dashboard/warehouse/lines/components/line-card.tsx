"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, Boxes, Hash } from "lucide-react";
import { type InferSelectModel } from "drizzle-orm";
import { productLines } from "@/lib/schema/product-lines";
type ProductLine = InferSelectModel<typeof productLines>;
import type { Category } from "../../types";

interface LineCardProps {
  line: ProductLine & { positionsCount: number; totalStock: number };
  category?: Category;
}

export function LineCard({ line, category }: LineCardProps) {
  const router = useRouter();

  const typeConfig = {
    base: {
      label: "Базовая",
      icon: Package,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    finished: {
      label: "Готовая",
      icon: Tag,
      color: "bg-green-500/10 text-green-600 border-green-500/20",
    },
  };

  const config = typeConfig[line.type as keyof typeof typeConfig] || typeConfig.base;
  const TypeIcon = config.icon;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push(`/dashboard/warehouse/lines/${line.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{line.name}</CardTitle>
            {category && (
              <CardDescription className="truncate">
                {category.name}
              </CardDescription>
            )}
          </div>
          <Badge color="primary" variant="outline" className={config.color}>
            <TypeIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Hash className="h-4 w-4" />
            <span>{line.positionsCount} позиций</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Boxes className="h-4 w-4" />
            <span>{line.totalStock} шт.</span>
          </div>
        </div>
        {line.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {line.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
