"use client";

import Image from"next/image";
import { Button } from"@/components/ui/button";
import { Badge } from"@/components/ui/badge";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu";
import {
 Download,
 Trash2,
 MoreHorizontal,
 Image as ImageIcon,
 FileCode,
 Star,
} from"lucide-react";
import { formatFileSize } from"@/lib/utils/upload";

interface DesignFile {
 id: string;
 versionId: string;
 filename: string;
 originalName: string;
 format: string;
 fileType:"preview"|"source";
 size: number;
 width: number | null;
 height: number | null;
 path: string;
 createdAt: Date;
}

interface FileTableProps {
 files: DesignFile[];
 onDelete: (fileId: string) => void;
 onSetAsPreview: (fileId: string) => void;
}

export function FileTable({ files, onDelete, onSetAsPreview }: FileTableProps) {
 // Sort files: preview first, then by name
 const sortedFiles = [...files].sort((a, b) => {
 if (a.fileType !== b.fileType) {
 return a.fileType ==="preview"? -1 : 1;
 }
 return a.originalName.localeCompare(b.originalName);
 });

 return (
 <div className="border rounded-lg overflow-hidden">
 <Table>
 <TableHeader>
 <TableRow>
 <TableHead className="w-16">Превью</TableHead>
 <TableHead>Файл</TableHead>
 <TableHead className="w-24">Тип</TableHead>
 <TableHead className="w-24">Размер</TableHead>
 <TableHead className="w-28">Разрешение</TableHead>
 <TableHead className="w-16"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {sortedFiles.map((file) => (
 <TableRow key={file.id}>
 {/* Preview thumbnail */}
 <TableCell>
 <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
 {file.fileType ==="preview"? (
 <Image
 src={file.path}
 alt={file.originalName}
 width={40}
 height={40}
 className="w-full h-full object-cover"
 />
) : (
 <FileCode className="h-5 w-5 text-muted-foreground"/>
)}
 </div>
 </TableCell>

 {/* File name */}
 <TableCell>
 <div className="min-w-0 text-xs sm:text-sm">
 <p className="font-medium truncate max-w-[150px] sm:max-w-none"title={file.originalName}>
 {file.originalName}
 </p>
 <p className="text-xs text-muted-foreground">
 {file.format}
 </p>
 </div>
 </TableCell>

 {/* Type badge */}
 <TableCell>
 <Badge
 variant={file.fileType ==="preview"?"default":"outline"}
 className="text-xs"
 >
 {file.fileType ==="preview"? (
 <>
 <ImageIcon className="h-3 w-3 mr-1"/>
 Превью
 </>
) : (
 <>
 <FileCode className="h-3 w-3 mr-1"/>
 Исходник
 </>
)}
 </Badge>
 </TableCell>

 {/* Size */}
 <TableCell className="text-sm text-muted-foreground">
 {formatFileSize(file.size)}
 </TableCell>

 {/* Dimensions */}
 <TableCell className="text-sm text-muted-foreground">
 {file.width && file.height ? `${file.width}×${file.height}` :"—"}
 </TableCell>

 {/* Actions */}
 <TableCell>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost"size="icon"className="h-8 w-8">
 <MoreHorizontal className="h-4 w-4"/>
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem asChild>
 <a href={file.path} download={file.originalName} className="flex items-center">
 <Download className="h-4 w-4 mr-2"/>
 Скачать оригинал
 </a>
 </DropdownMenuItem>
 {file.fileType ==="preview"&& (
 <DropdownMenuItem onClick={() => onSetAsPreview(file.id)}>
 <Star className="h-4 w-4 mr-2"/>
 Сделать превью принта
 </DropdownMenuItem>
)}
 <DropdownMenuSeparator />
 <DropdownMenuItem
 onClick={() => onDelete(file.id)}
 className="text-destructive focus:text-destructive"
 >
 <Trash2 className="h-4 w-4 mr-2"/>
 Удалить
 </DropdownMenuItem>
 </DropdownMenuContent>
 </ DropdownMenu>
 </TableCell>
 </TableRow>
))}
 </TableBody>
 </Table>
 </div>
);
}
