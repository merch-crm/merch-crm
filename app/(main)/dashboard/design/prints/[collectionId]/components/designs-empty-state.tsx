"use client";

import { Button } from"@/components/ui/button";
import { Card, CardContent } from"@/components/ui/card";
import { Palette, Plus } from"lucide-react";

interface DesignsEmptyStateProps {
 onCreateClick: () => void;
}

export function DesignsEmptyState({ onCreateClick }: DesignsEmptyStateProps) {
 return (
 <Card className="border-dashed">
 <CardContent className="flex flex-col items-center justify-center py-16">
 <div className="rounded-full bg-primary/10 p-4 mb-4">
 <Palette className="h-8 w-8 text-primary"/>
 </div>
 <h3 className="text-lg font-medium mb-2">Нет принтов</h3>
 <p className="text-muted-foreground text-center max-w-sm mb-6">
 В этой коллекции пока нет принтов. Добавьте первый принт, чтобы начать.
 </p>
 <Button onClick={onCreateClick}>
 <Plus className="h-4 w-4 mr-2"/>
 Добавить принт
 </Button>
 </CardContent>
 </Card>
);
}
