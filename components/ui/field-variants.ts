import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Shared placeholder style for ALL inputs and simulations in the system.
 * Change these to update every placeholder at once.
 */
export const FIELD_PLACEHOLDER_BASE = "text-slate-400/70 !font-normal !text-[14px]";
export const FIELD_PLACEHOLDER_CLASSES = "placeholder:text-slate-400/70 placeholder:!font-normal placeholder:!text-[14px]";
export const FIELD_PLACE_HOLDERS = "placeholder:text-slate-400/70 placeholder:!font-normal placeholder:!text-[14px]";

/**
 * Shared styling for dropdown/popover containers.
 * Centralizes rounding, border, background and shadow.
 */
export const DROPDOWN_CONTENT_CLASSES = "z-[1100] overflow-hidden rounded-[14px] border border-slate-200 bg-white text-slate-900 shadow-crm-xl animate-in fade-in-0 zoom-in-95";

/**
 * Shared visual style for all branded input fields (Text, Select, Date, etc.)
 * Strictly follows the "Modern Industrial Craft" standard:
 * - Height: 48px (h-12)
 * - Rounding: 12px
 * - Background: Solid slate-50 (#F8FAFC) for consistency (hover: white)
 * - Font: Semibold 14px
 */
export const fieldVariants = cva(
  cn(
    "flex w-full border text-slate-900 ring-offset-background focus-visible:outline-none focus:ring-4 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    FIELD_PLACEHOLDER_CLASSES
  ),
  {
    variants: {
      status: {
        default: "border-slate-200 bg-[#F8FAFC] hover:border-slate-300 hover:bg-white focus:border-slate-300 focus:bg-white focus:ring-slate-100/50",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 placeholder:text-emerald-400 focus:border-emerald-300 focus:ring-emerald-100/50",
        danger: "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 placeholder:text-rose-400 focus:border-rose-300 focus:ring-rose-100/50",
        warning: "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 placeholder:text-amber-400 focus:border-amber-300 focus:ring-amber-100/50",
      },
      size: {
        default: "h-12 rounded-[12px] px-4 py-2 text-[14px] font-semibold",
        sm: "h-10 rounded-[10px] px-3.5 py-1.5 text-[13px] font-semibold",
      }
    },
    defaultVariants: {
      status: "default",
      size: "default",
    },
  }
);
