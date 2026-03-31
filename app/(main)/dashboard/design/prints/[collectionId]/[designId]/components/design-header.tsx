"use client";

import { Edit, Trash2, MoreVertical, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DesignWithFullData } from "@/lib/types";

interface DesignHeaderProps {
    design: DesignWithFullData;
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
    canDelete 
}: DesignHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-6 bg-card border rounded-xl">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{design.name}</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Layers className="h-3.5 w-3.5" />
                            {versionsCount} версий
                        </span>
                        <span>•</span>
                        <span>{filesCount} файлов</span>
                        {design.isActive ? (
                            <Badge variant="success" className="ml-2">Активен</Badge>
                        ) : (
                            <Badge variant="secondary" className="ml-2">Неактивен</Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                </Button>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                            onClick={onDelete}
                            disabled={!canDelete}
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить принт
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
