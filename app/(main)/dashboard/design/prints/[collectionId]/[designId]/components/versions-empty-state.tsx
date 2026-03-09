"use client";

import { Button } from"@/components/ui/button";
import { Card, CardContent } from"@/components/ui/card";
import { Layers, Plus } from"lucide-react";

interface VersionsEmptyStateProps {
 onCreateClick: () => void;
}

export function VersionsEmptyState({ onCreateClick }: VersionsEmptyStateProps) {
 return (
 <Card className="border-dashed">
 <CardContent className="flex flex-col items-center justify-center py-16">
 <div className="rounded-full bg-primary/10 p-4 mb-4">
 <Layers className="h-8 w-8 text-primary"/>
 </div>
 <h3 className="text-lg font-medium mb-2">Нет версий</h3>
 <p className="text-muted-foreground text-center max-w-sm mb-6">
 Создайте версии принта для разных цветов ткани.
 Каждая версия может содержать превью и исходные файлы.
 </p>
 <Button onClick={onCreateClick}>
 <Plus className="h-4 w-4 mr-2"/>
 Добавить версию
 </Button>
 </CardContent>
 </Card>
);
}
