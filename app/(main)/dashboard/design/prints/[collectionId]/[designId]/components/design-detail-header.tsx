"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Copy, 
  MoreVertical, 
  PenTool 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DesignDetailHeaderProps {
  design: {
    id: string;
    name: string;
    isActive: boolean;
    sku?: string | null;
  };
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function DesignDetailHeader({ 
  design, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: DesignDetailHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Button variant="ghost" color="neutral" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">{design.name}</h1>
            {!design.isActive && (
              <Badge color="neutral">Неактивен</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {design.sku && `SKU: ${design.sku}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" color="neutral" asChild>
          <Link href={`/dashboard/design/editor/new?designId=${design.id}`}>
            <PenTool className="h-4 w-4 mr-2" />
            Открыть в редакторе
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" color="neutral" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Дублировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
