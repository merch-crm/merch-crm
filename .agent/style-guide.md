# MerchCRM Design Style Guide

This document defines the visual and interaction standards for the MerchCRM project. Follow these rules to ensure a premium, consistent user experience.

## Visual Foundation
- **Radii**:
  - Main containers/dialogs: `rounded-[2.5rem]` (40px).
  - Secondary cards/buttons: `rounded-2xl` (16px).
  - Small elements: `rounded-xl` (12px).
- **Typography**:
  - Headings: `font-black` (900), `tracking-tight`.
  - Body: `font-medium` or `font-semibold`.
  - Labels/Accents: `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.2em]`.
- **Effects**:
  - Overlays: `bg-slate-900/60` with `backdrop-blur-md`.
  - Shadows: Soft, themed shadows (e.g., `shadow-indigo-500/10`).
  - Transitions: `transition-all duration-300`, `active:scale-95`.

## Color Palette
- **Primary (Indigo)**: `#6366f1` (`text-indigo-600`, `bg-indigo-600`). Used for "Create", "Move", and "Info".
- **Danger (Rose)**: `#f43f5e` (`text-rose-600`, `bg-rose-600`). Used for "Delete", "Clear", and errors.
- **Success (Emerald)**: `#10b981` (`text-emerald-600`, `bg-emerald-600`). Used for "Check-in", "Increase", and success states.
- **Backgrounds**:
  - Light mode: `bg-white` main, `bg-slate-50` for secondary areas.

## Component Patterns
### Form Inputs
- **Height**: `h-14` (56px).
- **Style**: `bg-slate-50`, `border-slate-100`, `font-bold`.
- **Validation**:
  - Error state: `border-rose-300 bg-rose-50/50 text-rose-900`.
  - Focus: `focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5`.

### Buttons (Primary)
- **Props**: `h-14`, `rounded-2xl`, `font-black`, `uppercase`, `tracking-widest`, `text-xs` (or `text-sm`).
- **Interaction**: Must have `active:scale-95` or `hover:scale-[1.02]`.

### Dialogs
- Follow the `rounded-[2.5rem]` pattern with an icon in a colored square (rounded-2xl) in the top-left, and a close button (rounded-xl) in the top-right.

## Interaction Principles
1. **Immediate Feedback**: Use `useToast` for all successful/failed actions.
2. **Data Freshness**: Always call `router.refresh()` after server actions in client components.
3. **Confirming Destructive Actions**: Always use the custom `ConfirmDialog` with `variant="destructive"`.
