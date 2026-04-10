import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Category, ItemFormData, AttributeType, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon } from "@/app/(main)/dashboard/warehouse/category-utils";
import { cn } from "@/lib/utils";

interface NameEditState {
  isEditing: boolean;
  tempName: string;
  onEditClick: () => void;
  onNameChange: (val: string) => void;
  onSaveName: () => void;
  onCancelName: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface LivePreviewCardProps {
  formData: ItemFormData;
  category?: Category;
  attributeTypes: AttributeType[];
  dynamicAttributes: InventoryAttribute[];
  activeSubcategory?: Category;
  accentColor?: string;
  isMobile?: boolean;
  nameEdit?: NameEditState;
  className?: string;
}

export function LivePreviewCard({
  formData,
  category,
  attributeTypes,
  dynamicAttributes,
  activeSubcategory,
  accentColor,
  className,
}: LivePreviewCardProps) {
  const CategoryIcon = getCategoryIcon(category || {});

  return (
    <div className={cn("relative bg-[#F8FAFC] rounded-[20px] md:rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-stretch md:min-h-[220px] overflow-hidden group", className)}>
      {/* Left Content Area */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center relative">
        {/* Radial Gradient */}
        <div
          className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0"
          style={{
            background: accentColor
              ? `radial-gradient(circle at 20% 50%, ${accentColor} 0%, transparent 70%)`
              : 'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 70%)'
          }}
        />

        {/* Background Category Icon */}
        {CategoryIcon && (
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 opacity-[0.03] pointer-events-none z-0 -rotate-12 transition-transform duration-1000 ease-out group-hover:scale-110 group-hover:-rotate-3">
            <CategoryIcon className="w-80 h-80 text-slate-900" />
          </div>
        )}

        <div className="relative z-10 space-y-2 md:space-y-3">
          {/* Category & Subcategory */}
          {category && (
            <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-0.5 md:mb-1">
              <div className="flex items-center gap-1.5 md:gap-2 bg-indigo-50/80 px-2 md:px-2.5 py-0.5 md:py-1 rounded-md border border-indigo-100/50">
                <span className="text-xs font-black tracking-normal text-indigo-500">
                  {category.name}
                </span>
                {activeSubcategory && (
                  <>
                    <span className="text-indigo-300 font-bold">/</span>
                    <span className="text-xs font-black tracking-normal text-indigo-500/80">
                      {activeSubcategory.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="text-lg md:text-[24px] lg:text-[32px] font-black text-slate-900 leading-[1.15] tracking-normal max-w-3xl min-h-[1.1em]">
            <AnimatePresence mode="wait">
              <motion.div
                key={formData.itemName || "empty"}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.15 }}
              >
                {formData.itemName || <span className="text-slate-300 italic opacity-80">Название позиции...</span>}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-full px-2.5 md:px-3.5 py-1 md:py-1.5 flex items-center gap-1.5 md:gap-2 shadow-sm">
              <span className="text-xs font-bold tracking-normal text-slate-400 mt-[1px] leading-none">SKU:</span>
              <span className="text-xs md:text-[13px] font-bold text-slate-600 tracking-normal break-all leading-none">{formData.sku || "---"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Attributes — hidden on mobile */}
      <div className="hidden md:flex w-full md:w-auto p-4 sm:p-6 lg:p-8 items-center min-w-[320px]">
        <div className="w-full h-full bg-white/50 backdrop-blur-md rounded-[24px] border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-5 lg:p-6 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

          <div className="relative flex-1 flex flex-col">
            <h3 className="text-xs font-bold tracking-normal text-slate-400 mb-5">Характеристики</h3>

            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              {(() => {
                const filteredEntries = Object.entries(formData.attributes || {}).map(([key, value]) => {
                  if (!value || typeof value !== 'string') return null;
                  if (/^[a-f0-9-]{36}$/.test(value) || /^[a-f0-9-]{36}$/.test(key)) return null;

                  const type = attributeTypes?.find(t => t.slug === key);
                  if (!type) return null;

                  const attr = dynamicAttributes?.find(a => a.type === key && a.value === value);
                  let displayValue = attr?.name || value;

                  const isCountry = type.slug === 'country' || type.name.toLowerCase().includes('страна');
                  if (isCountry && displayValue) {
                    displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
                  }

                  const label = type.name === "Единица измерения" ? "Ед. изм." : type.name;

                  return {
                    label,
                    displayValue,
                    slug: key,
                    sortOrder: type.sortOrder || 0,
                    showInName: type.showInName !== false
                  };
                }).filter((chip): chip is NonNullable<typeof chip> => {
                  if (!chip) return false;
                  if (!chip.showInName) return false;
                  const lowerSlug = chip.slug.toLowerCase();
                  if (lowerSlug.endsWith('code')) return false;
                  if (["thumbnailsettings"].includes(lowerSlug)) return false;
                  return true;
                }).sort((a, b) => a.sortOrder - b.sortOrder);

                if (filteredEntries.length === 0) {
                  return (
                    <div className="flex flex-col gap-3 opacity-60">
                      {[100, 70, 80].map((w, i) => (
                        <div key={i} className="flex justify-between items-center w-full">
                          <div className="h-3 rounded-[4px] bg-slate-200 animate-pulse w-12" />
                          <div className="h-3 rounded-[4px] bg-slate-200 animate-pulse" style={{ width: `${w}px` }} />
                        </div>
                      ))}
                    </div>
                  );
                }

                const columns = [];
                for (let i = 0; i < filteredEntries.length; i += 5) {
                  columns.push(filteredEntries.slice(i, i + 5));
                }

                return (
                  <div className="flex gap-3">
                    {columns.map((col, colIdx) => (
                      <div key={colIdx} className="flex flex-col space-y-3 min-w-[220px] flex-1">
                        {col.map((attr) => (
                          <div key={attr.slug} className="flex flex-row items-baseline justify-between text-[14px] tracking-normal w-full overflow-hidden group/item">
                            <span className="font-medium text-[#718096] whitespace-nowrap">{attr.label}</span>
                            <div className="flex-1 border-b border-dotted border-[#E2E8F0] mb-[4px] mx-2"></div>
                            <span className="font-bold text-[#2D3748] text-right shrink-0 max-w-[60%] truncate">{attr.displayValue}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Background Image Thumbnail (Optional) */}
      {formData.imagePreview && (
        <div className="absolute -right-20 -bottom-20 w-80 h-80 opacity-[0.02] pointer-events-none drop-shadow-2xl z-0">
          <Image src={formData.imagePreview} alt="Preview Bg" fill className="object-contain" unoptimized />
        </div>
      )}
    </div>
  );
}
