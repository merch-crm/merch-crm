"use client";

import Image from"next/image";
import { useSortable } from"@dnd-kit/sortable";
import { CSS } from"@dnd-kit/utilities";
import { Card, CardContent } from"@/components/ui/card";
import { GripVertical, Image as ImageIcon, Layers, FileStack } from"lucide-react";
import { cn } from"@/lib/utils";

interface DesignCardProps {
 design: {
 id: string;
 name: string;
 description: string | null;
 preview: string | null;
 versionsCount: number;
 filesCount: number;
 };
 isSortMode: boolean;
 onClick: () => void;
}

export function DesignCard({ design, isSortMode, onClick }: DesignCardProps) {
 const {
 attributes,
 listeners,
 setNodeRef,
 transform,
 transition,
 isDragging,
 } = useSortable({ id: design.id });

 const style = {
 transform: CSS.Transform.toString(transform),
 transition,
 };

 return (
 <Card
 ref={setNodeRef}
 style={style}
 className={cn(
"cursor-pointer transition-all hover:shadow-md group",
 isDragging &&"opacity-50 shadow-lg z-50",
 isSortMode &&"ring-2 ring-primary/20"
)}
 onClick={isSortMode ? undefined : onClick}
 >
 <CardContent className="p-0 relative">
 {/* Drag handle */}
 {isSortMode && (
 <div
 {...attributes}
 {...listeners}
 className="absolute top-2 left-2 z-10 p-2 bg-background/80 rounded-md cursor-grab active:cursor-grabbing border shadow-sm"
 >
 <GripVertical className="h-4 w-4 text-muted-foreground"/>
 </div>
)}

 {/* Preview */}
 <div className="aspect-square relative bg-muted rounded-t-lg overflow-hidden">
 {design.preview ? (
 <Image
 src={design.preview}
 alt={design.name}
 fill
 className="object-cover transition-transform group-hover:scale-105"
 />
) : (
 <div className="w-full h-full flex items-center justify-center">
 <ImageIcon className="h-12 w-12 text-muted-foreground/50"/>
 </div>
)}
 </div>

 {/* Info */}
 <div className="p-4">
 <h3 className="font-medium truncate"title={design.name}>
 {design.name}
 </h3>

 {design.description && (
 <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
 {design.description}
 </p>
)}

 {/* Stats */}
 <div className="flex items-center gap-3 mt-3">
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <Layers className="h-3.5 w-3.5"/>
 <span>{design.versionsCount}</span>
 </div>
 <div className="flex items-center gap-1 text-sm text-muted-foreground">
 <FileStack className="h-3.5 w-3.5"/>
 <span>{design.filesCount}</span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
);
}
