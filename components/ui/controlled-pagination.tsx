"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralizeRU } from "@/lib/pluralize";

export function PaginationControlled() {
  const [page, setPage] = useState(1);
  const totalPages = 12;
  const itemsPerPage = 10;
  const totalItems = 120;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  if (!isMounted) {
    return <div className="w-full max-w-4xl h-24 rounded-card bg-white border border-slate-100 animate-pulse" />;
  }

  return (
    <nav 
      aria-label="Навигация по результатам"
      className="flex flex-col gap-5 w-full max-w-4xl mx-auto p-8 rounded-card bg-white border border-slate-100 shadow-premium group/nav hover:border-primary-base/20 transition-all duration-700 overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
        <p className="text-[11px] font-black text-slate-400 tracking-[0.2em] leading-none">
          Показано <span className="text-slate-900 tabular-nums px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg">{startItem}-{endItem}</span> из <span className="text-slate-900 tabular-nums">{totalItems}</span> {pluralizeRU(totalItems, "единица", "единицы", "единиц")}
        </p>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-card border border-slate-100 shadow-inner">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Предыдущая страница"
            className="flex items-center gap-3 px-5 h-11 rounded-element text-[11px] font-black tracking-widest text-slate-500 hover:bg-white hover:shadow-xl hover:text-primary-base transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10"
          >
            <ChevronLeft className="size-4" />
            <span>Назад</span>
          </button>

          <ul className="flex items-center gap-2" role="list">
            {getPageNumbers().map((p, i) => (
              <li key={i}>
                {p === "ellipsis" ? (
                  <div className="size-11 flex items-center justify-center text-slate-300" aria-hidden="true">
                    <MoreHorizontal className="size-4" />
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-current={p === page ? "page" : undefined}
                    aria-label={`Перейти на страницу ${p}`}
                    onClick={() => setPage(p)}
                    className={cn(
                      "size-11 rounded-element text-[11px] font-black tracking-tight transition-all active:scale-90 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20",
                      p === page 
                        ? "bg-slate-950 text-white shadow-2xl shadow-black/20" 
                        : "text-slate-400 hover:bg-white hover:shadow-xl hover:text-slate-950 hover:border hover:border-slate-100"
                    )}
                  >
                    {p}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Следующая страница"
            className="flex items-center gap-3 px-5 h-11 rounded-element text-[11px] font-black tracking-widest text-slate-500 hover:bg-white hover:shadow-xl hover:text-primary-base transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10"
          >
            <span>Далее</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
