"use client";

import Image from"next/image";
import { Button } from"@/components/ui/button";
import { Badge } from"@/components/ui/badge";
import { Card, CardContent } from"@/components/ui/card";
import {
 Edit,
 Trash2,
 Image as ImageIcon,
 Layers,
 FileStack,
 Link2,
 Calendar,
 Folder,
} from"lucide-react";
import { formatDistanceToNow } from"date-fns";
import { ru } from"date-fns/locale";

interface DesignHeaderProps {
 design: {
 id: string;
 name: string;
 description: string | null;
 preview: string | null;
 createdAt: Date;
 collection: {
 id: string;
 name: string;
 };
 linkedLines: Array<{
 id: string;
 name: string;
 categoryName: string;
 }>;
 };
 versionsCount: number;
 filesCount: number;
 onEdit: () => void;
 onDelete: () => void;
 canDelete: boolean;
}

export function DesignHeader({
 design,
 versionsCount,
 filesCount,
 onEdit,
 onDelete,
 canDelete,
}: DesignHeaderProps) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className="flex flex-col lg:flex-row gap-3">
 {/* Preview */}
 <div className="flex-shrink-0">
 <div className="w-full lg:w-48 h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
 {design.preview ? (
 <Image
 src={design.preview}
 alt={design.name}
 width={192}
 height={192}
 className="w-full h-full object-cover"
 />
) : (
 <ImageIcon className="h-16 w-16 text-muted-foreground/50"/>
)}
 </div>
 </div>

 {/* Info */}
 <div className="flex-1 min-w-0">
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Badge variant="outline">
 <Folder className="h-3 w-3 mr-1"/>
 {design.collection.name}
 </Badge>
 </div>
 <h1 className="text-2xl font-bold">{design.name}</h1>
 {design.description && (
 <p className="text-muted-foreground mt-2 max-w-2xl">
 {design.description}
 </p>
)}
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2">
 <Button variant="outline"size="sm"onClick={onEdit}>
 <Edit className="h-4 w-4 mr-2"/>
 Редактировать
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={onDelete}
 className={canDelete ?"text-destructive hover:text-destructive":""}
 disabled={!canDelete}
 >
 <Trash2 className="h-4 w-4 mr-2"/>
 Удалить
 </Button>
 </div>
 </div>

 {/* Stats */}
 <div className="flex flex-wrap gap-3 mt-6">
 <div className="flex items-center gap-2">
 <Layers className="h-4 w-4 text-muted-foreground"/>
 <span className="text-sm">
 <span className="font-medium">{versionsCount}</span>{""}
 {pluralize(versionsCount,"версия","версии","версий")}
 </span>
 </div>

 <div className="flex items-center gap-2">
 <FileStack className="h-4 w-4 text-muted-foreground"/>
 <span className="text-sm">
 <span className="font-medium">{filesCount}</span>{""}
 {pluralize(filesCount,"файл","файла","файлов")}
 </span>
 </div>

 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4 text-muted-foreground"/>
 <span className="text-sm text-muted-foreground">
 Создан{""}
 {formatDistanceToNow(new Date(design.createdAt), {
 addSuffix: true,
 locale: ru,
 })}
 </span>
 </div>
 </div>

 {/* Linked lines */}
 {design.linkedLines.length > 0 && (
 <div className="mt-6">
 <div className="flex items-center gap-2 mb-2">
 <Link2 className="h-4 w-4 text-muted-foreground"/>
 <span className="text-sm font-medium">Используется в линейках:</span>
 </div>
 <div className="flex flex-wrap gap-2">
 {design.linkedLines.map((line) => (
 <Badge key={line.id} variant="secondary">
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
