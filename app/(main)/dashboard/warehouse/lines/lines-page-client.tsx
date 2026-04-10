"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { type InferSelectModel } from "drizzle-orm";
import { productLines } from "@/lib/schema/product-lines";
type ProductLine = InferSelectModel<typeof productLines>;
import { EmptyState } from "@/components/ui/empty-state";
import { LineCard } from "./components/line-card";
import { Plus, Search, Package, Tag, Layers } from "lucide-react";
import type { Category } from "../types";

interface LinesPageClientProps {
  lines: (ProductLine & { positionsCount: number; totalStock: number })[];
  categories: Category[];
}

type LineFilter = "all" | "base" | "finished";

export function LinesPageClient({ lines, categories }: LinesPageClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<LineFilter>("all");
  const [categoryId, setCategoryId] = useState<string>("all");

  const filteredLines = useMemo(() => {
    return lines.filter((line) => {
      const matchesSearch = line.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType =
        filter === "all" || line.type === filter;
      const matchesCategory =
        categoryId === "all" || line.categoryId === categoryId;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [lines, search, filter, categoryId]);

  const stats = useMemo(() => ({
    total: lines.length,
    base: lines.filter((l) => l.type === "base").length,
    finished: lines.filter((l) => l.type === "finished").length,
  }), [lines]);

  return (
    <div className="space-y-3">
      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск линеек..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryId} onChange={setCategoryId} options={[ { id: "all", title: "Все категории" }, ...categories.map(cat => ({ id: cat.id, title: cat.name }))
          ]}
          placeholder="Все категории"
          className="w-full sm:w-[200px]"
        />

        <Button onClick={() => router.push("/dashboard/warehouse/items/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Создать линейку
        </Button>
      </div>

      {/* Табы типов */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as LineFilter)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Layers className="h-4 w-4" />
            Все ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="base" className="gap-2">
            <Package className="h-4 w-4" />
            Базовые ({stats.base})
          </TabsTrigger>
          <TabsTrigger value="finished" className="gap-2">
            <Tag className="h-4 w-4" />
            Готовые ({stats.finished})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Сетка линеек */}
      {filteredLines.length === 0 ? (
        <EmptyState icon={Package} title="Линейки не найдены" description={ search || categoryId !== "all" ? "Попробуйте изменить параметры поиска" : "Создайте первую линейку продуктов" }>
          {!search && categoryId === "all" && (
            <Button variant="outline" onClick={() => router.push("/dashboard/warehouse/items/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Создать линейку
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredLines.map((line) => (
            <LineCard key={line.id} line={line} category={categories.find((c) => c.id === line.categoryId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
