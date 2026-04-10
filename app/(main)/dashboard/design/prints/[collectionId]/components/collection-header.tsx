"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Image as ImageIcon,
  Layers,
  FileStack,
  Link2,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

import { CollectionWithFullStats } from "@/lib/types";

interface CollectionHeaderProps {
  collection: CollectionWithFullStats;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function CollectionHeader({
  collection,
  onEdit,
  onDelete,
  canDelete
}: CollectionHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Cover image */}
          <div className="flex-shrink-0">
            <div className="w-full lg:w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {collection.coverImage ? (
                <Image src={collection.coverImage} alt={collection.name} width={192} height={192} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{collection.name}</h1>
                {collection.description && (
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    {collection.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="outline" color="neutral" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
                <Button variant="outline" color="neutral" size="sm" onClick={onDelete} className={canDelete ? "text-destructive hover:text-destructive" : ""} disabled={!canDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{collection.stats.designs}</span>
                  {" "}
                  {pluralize(collection.stats.designs, "принт", "принта", "принтов")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FileStack className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{collection.stats.versions}</span>
                  {" "}
                  {pluralize(collection.stats.versions, "версия", "версии", "версий")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">{collection.stats.files}</span>
                  {" "}
                  {pluralize(collection.stats.files, "файл", "файла", "файлов")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground" suppressHydrationWarning>
                  Создана {formatDistanceToNow(new Date(collection.createdAt), {
                    addSuffix: true,
                    locale: ru
                  })}
                </span>
              </div>
            </div>

            {/* Linked lines */}
            {collection.linkedLines.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Используется в линейках:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {collection.linkedLines.map((line) => (
                    <Badge key={line.id} color="neutral">
                      {line.name} ({line.categoryName})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
