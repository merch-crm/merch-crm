"use client";

import { Palette, Plus } from"lucide-react";
import { Button } from"@/components/ui/button";

interface PrintsEmptyStateProps {
 onCreateClick: () => void;
}

export function PrintsEmptyState({ onCreateClick }: PrintsEmptyStateProps) {
 return (
 <div className="flex flex-col items-center justify-center py-16 px-4">
 <div className="relative mb-6">
 {/* Background decoration */}
 <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-50 scale-150"/>

 {/* Icon container */}
 <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
 <Palette className="w-12 h-12 text-white"/>
 </div>
 </div>

 <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">
 Нет коллекций
 </h3>
 <p className="text-slate-500 text-center max-w-md mb-6">
 Создайте первую коллекцию принтов для организации ваших дизайнов.
 Коллекции используются при создании готовой продукции.
 </p>

 <Button onClick={onCreateClick} size="lg">
 <Plus className="w-5 h-5 mr-2"/>
 Создать коллекцию
 </Button>
 </div>
);
}
