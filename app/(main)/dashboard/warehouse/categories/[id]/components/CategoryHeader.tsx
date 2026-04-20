"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { AddCategoryDialog } from "@/app/(main)/dashboard/warehouse/add-category-dialog";

interface CategoryHeaderProps {
  category: { id: string; name: string; parentId?: string | null };
  mounted: boolean;
}

export function CategoryHeader({ category, mounted }: CategoryHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button 
          type="button" 
          variant="outline" 
          color="gray" 
          size="icon" 
          onClick={() => router.back()}
          className="size-11 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 group"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none truncate ml-1 sm:ml-0">{category.name}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {category.id !== "orphaned" && !category.parentId && mounted && (
          <AddCategoryDialog parentId={category.id} buttonText="Добавить подкатегорию" />
        )}
        <Button 
          type="button" 
          onClick={() => {
            const url = category.parentId
              ? `/dashboard/warehouse/items/new?categoryId=${category.parentId}&subcategoryId=${category.id}`
              : `/dashboard/warehouse/items/new?categoryId=${category.id}`;
            router.push(url);
          }}
          className="h-11 px-5 sm:px-8 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-xs sm:text-sm border-none"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="hidden sm:inline">Добавить позицию</span>
        </Button>
      </div>
    </div>
  );
}
