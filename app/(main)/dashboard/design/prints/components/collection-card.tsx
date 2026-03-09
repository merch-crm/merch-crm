"use client";

import { useRouter } from"next/navigation";
import { useSortable } from"@dnd-kit/sortable";
import { CSS } from"@dnd-kit/utilities";
import {
 Card,
 CardContent,
} from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { GripVertical, Image as ImageIcon, Package, Palette } from"lucide-react";
import { cn } from"@/lib/utils";
import { pluralize } from"@/lib/pluralize";

import Image from"next/image";
import { CollectionWithStats } from"@/lib/types";

interface CollectionCardProps {
 collection: CollectionWithStats;
 isSorting: boolean;
}

export function CollectionCard({ collection, isSorting }: CollectionCardProps) {
 const router = useRouter();

 const {
 attributes,
 listeners,
 setNodeRef,
 transform,
 transition,
 isDragging,
 } = useSortable({ id: collection.id });

 const style = {
 transform: CSS.Transform.toString(transform),
 transition,
 };

 const handleClick = () => {
 if (!isSorting) {
 router.push(`/dashboard/design/prints/${collection.id}`);
 }
 };

 return (
 <Card
 ref={setNodeRef}
 style={style}
 className={cn(
"group cursor-pointer transition-all duration-200 overflow-hidden",
"hover:shadow-lg hover:scale-[1.02]",
 isDragging &&"opacity-50 shadow-2xl scale-105 z-50",
 isSorting &&"cursor-grab active:cursor-grabbing"
)}
 onClick={handleClick}
 {...(isSorting ? { ...attributes, ...listeners } : {})}
 >
 {/* Cover Image */}
 <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
 {collection.coverImage ? (
 <Image
 src={collection.coverImage}
 alt={collection.name}
 width={400}
 height={200}
 className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
 />
) : (
 <div className="w-full h-full flex items-center justify-center">
 <div className="w-20 h-20 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
 <Palette className="w-10 h-10 text-slate-400"/>
 </div>
 </div>
)}

 {/* Sorting Handle Overlay */}
 {isSorting && (
 <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
 <div className="bg-white rounded-xl p-3 shadow-lg">
 <GripVertical className="w-6 h-6 text-slate-600"/>
 </div>
 </div>
)}

 {/* Linked Lines Badge */}
 {collection.linkedLinesCount > 0 && (
 <div className="absolute top-3 right-3">
 <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0">
 <Package className="w-3 h-3 mr-1"/>
 {collection.linkedLinesCount}
 </Badge>
 </div>
)}
 </div>

 {/* Content */}
 <CardContent className="p-4">
 <h3 className="font-bold text-lg text-slate-900 truncate mb-1">
 {collection.name}
 </h3>

 {collection.description && (
 <p className="text-sm text-slate-500 line-clamp-2 mb-3">
 {collection.description}
 </p>
)}

 <div className="flex items-center gap-3 text-sm text-slate-500">
 <div className="flex items-center gap-1.5">
 <ImageIcon className="w-4 h-4"/>
 <span>
 {collection.designsCount}{""}
 {pluralize(collection.designsCount,"принт","принта","принтов")}
 </span>
 </div>
 </div>
 </CardContent>
 </Card>
);
}
