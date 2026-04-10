"use client";

import { ArrowLeft, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 group mr-1 sm:mr-2"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-none truncate">{category.name}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {category.id !== "orphaned" && !category.parentId && mounted && (
          <AddCategoryDialog parentId={category.id} buttonText="Добавить подкатегорию" className="h-10 w-10 sm:h-11 sm:w-auto" />
        )}
        <Button type="button" onClick={() => {
            const url = category.parentId
              ? `/dashboard/warehouse/items/new?categoryId=${category.parentId}&subcategoryId=${category.id}`
              : `/dashboard/warehouse/items/new?categoryId=${category.id}`;
            router.push(url);
          }}
          className={cn("h-10 w-10 sm:h-11 sm:w-auto rounded-full sm:rounded-2xl p-0 sm:px-6 gap-2 font-bold inline-flex items-center justify-center text-xs sm:text-sm border-none shadow-lg shadow-primary/20 transition-all active:scale-95"
          )}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Добавить позицию</span>
        </Button>
      </div>
    </div>
  );
}
