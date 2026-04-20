"use client";
import { Button } from"@/components/ui/button";
import { cn } from"@/lib/utils";
import { motion, AnimatePresence } from"framer-motion";
import { Layers } from"lucide-react";
import { getCategoryIcon } from"../../category-utils";
import { Select, SelectOption } from"@/components/ui/select";
import { useMemo } from"react";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface CategoryTabsProps {
  rootCategories: Category[];
  hasUncategorized: boolean;
  activeCategoryId: string;
  handleCategoryChange: (id: string) => void;
}

export function CategoryTabs({
  rootCategories,
  hasUncategorized,
  activeCategoryId,
  handleCategoryChange
}: CategoryTabsProps) {
  const options = useMemo(() => {
    const categoryOptions: SelectOption[] = rootCategories.map(cat => {
      const Icon = getCategoryIcon(cat);
      return {
        id: cat.id,
        title: cat.name,
        icon: <Icon className="w-4 h-4" />
      };
    });

    if (hasUncategorized) {
      categoryOptions.push({
        id:"uncategorized",
        title:"Без категории",
        icon: <Layers className="w-4 h-4" />
      });
    }

    return categoryOptions;
  }, [rootCategories, hasUncategorized]);

  const showDropdownOnTablet = options.length > 4;

  if (rootCategories.length === 0 && !hasUncategorized) {
    return null;
  }

  return (
    <>
      {/* Mobile/Tablet Navigation (Select Dropdown) */}
      <div className={cn("w-full",
        showDropdownOnTablet ?"lg:hidden" :"sm:hidden"
      )}>
        <Select options={options} value={activeCategoryId} onChange={handleCategoryChange} variant="solid" color="primary" compact center className="w-full" triggerClassName="crm-card rounded-2xl !bg-white border-slate-100 shadow-sm !h-12" />
      </div>

      {/* Desktop Navigation (Horizontal Tabs) */}
      <div className={cn("crm-card w-full overflow-x-auto h-[58px] items-center gap-2 p-[6px] rounded-2xl scrollbar-hide bg-white border border-slate-100 shadow-sm",
        showDropdownOnTablet ?"hidden lg:flex" :"hidden sm:flex"
      )}>
        {rootCategories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          const Icon = getCategoryIcon(cat);

          return (
            <Button key={cat.id} asChild variant="ghost" className="p-0 border-none bg-transparent hover:bg-transparent shadow-none flex-1 h-full">
              <button type="button"
                onClick={() => handleCategoryChange(cat.id)}
                title={cat.name}
                className={cn("relative w-full h-full shrink-0 px-4 rounded-xl text-sm font-bold group whitespace-nowrap flex items-center justify-center gap-2 transition-colors duration-200",
                  isActive ?"text-white hover:text-white" :"text-slate-500 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryTab"
                    className="absolute inset-0 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/10 z-0"
                    transition={{ type:"spring", bounce: 0, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className={cn("hidden md:inline-block", isActive &&"inline-block")}
                    >
                      {cat.name}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
            </Button>
          );
        })}
        {hasUncategorized && (
          <Button asChild variant="ghost" className="p-0 border-none bg-transparent hover:bg-transparent shadow-none flex-1 h-full">
            <button type="button"
              onClick={() => handleCategoryChange("uncategorized")}
              title="Без категории"
              className={cn("relative w-full h-full shrink-0 px-4 rounded-xl text-sm font-bold group whitespace-nowrap flex items-center justify-center transition-colors duration-200",
                activeCategoryId ==="uncategorized" ?"text-white hover:text-white" :"text-slate-500 hover:text-slate-900"
              )}
            >
              {activeCategoryId ==="uncategorized" && (
                <motion.div
                  layoutId="activeCategoryTab"
                  className="absolute inset-0 bg-slate-900 rounded-xl shadow-lg shadow-slate-900/10"
                  transition={{ type:"spring", bounce: 0, duration: 0.4 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Layers className="w-5 h-5 shrink-0" />
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={cn("hidden md:inline-block", activeCategoryId ==="uncategorized" &&"inline-block")}
                  >
                    Без категории
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </Button>
        )}
      </div>
    </>
  );
}
