# Warehouse Item Creation & Editing — UI/UX Standards

This document defines the strict layout, styling, and behavioral rules for the **New Item Creation** (`items/new`) and **Item Edit** (`items/[id]`) pages. These rules are critical to maintaining the "premium" feel and preventing layout regressions.

## 1. General Layout Structure

*   **Breadcrumbs**: Must be placed at the very top of the page, spanning the full width (outside the main 2-column grid).
*   **Category Badge**: A dynamic, floating badge in the top-right corner of the content area must always show the currently selected Category and Subcategory with their respective icons and colors.
*   **Grid System**: Use a responsive grid (typically `lg:grid-cols-12`) where navigation/steps take up ~25% (e.g., `col-span-3`) and the form content takes up the rest.

## 2. Typography & Aesthetics

*   **Labels**: Use specific typography for all field labels to maintain the "premium technical" look:
    *   `text-[10px]` or `text-[11px]`
    *   `font-black` (Weight 900)
    *   `uppercase`
    *   `tracking-widest` or `tracking-[0.12em]`
    *   Color: `text-slate-400`
*   **Interactive Elements**:
    *   Primary Action Color: `indigo-500` / `indigo-600`.
    *   Destructive Action Color: `rose-500`.
    *   Success Color: `emerald-500`.
*   **Containers**: Use large rounded corners (`rounded-[24px]` or `rounded-[3rem]`) for main content blocks to create a soft, modern feel.

## 3. Media Upload Component (`MediaStep`)

This component has highly specific behaviors and must strictly adhere to the following:

### A. Main Image Block
*   **Layout**: Left column, fixed width (approx 35-40%).
*   **Container**: Fixed aspect-ratio (square) for the image area.
*   **Interaction**:
    *   **Controls**: Zoom (slider) and Pan (X/Y sliders) must be available for the main image.
    *   **Hover Overlay**: When an image is set, hovering must reveal a backdrop with **two buttons**:
        1.  **Replace** (`RefreshCcw` icon): Triggers file selection.
        2.  **Delete** (`Trash2` icon): Removes the image.
    *   **Button Style (Main)**: Rectangular rounded buttons (`rounded-2xl`) containing **Icon + Text Label** (e.g., "ЗАМЕНИТЬ").

### B. Storyboard & Gallery (Right Column)
*   **Storyboard**: Dedicated slots for "Back View" and "Side/Detail View".
*   **Detail Gallery**:
    *   **Grid**: Strictly `grid-cols-4`.
    *   **Limit**: Maximum **4** additional detail images.
    *   **Counter**: A counter (e.g., `2/4`) must be visible in the header.
*   **Miniature Interactions (CompactDropzone & Gallery Items)**:
    *   **Hover Overlay**: Must be present.
    *   **Button Style (Minis)**: **Circular Icons Only** (`rounded-full`, `w-8 h-8`).
        *   **NO TEXT LABELS** inside the buttons for these small items.
        *   Use `title` attribute for tooltips ("Заменить", "Удалить").

## 4. Input Behaviors

*   **Dropdowns (Brand/Category)**:
    *   **Focus-Trigger**: Dropdowns (e.g., `AttributeSelector`) must open automatically **when the input receives focus** (click or tab), not just on typing.
*   **Validation**:
    *   Required fields must block the "Next" step.
    *   Visual feedback (red borders/text) should appear on error.

## 5. Stock & Inventory (`StockStep`)

*   **Compromise**: Layout is optimized for density. Inputs should be `h-9` or `h-10`.
*   **Stock Levels**:
    *   Quantity inputs must be clearly separated from "Threshold" settings.
    *   Stock warnings (Low/Critical) must separate visually using standard colors (Amber/Rose).

## 6. Critical Implementation Rules (Do Not Change)

1.  **Do not add text labels** to the hover buttons in the Detail Gallery or Storyboard thumbnails. Only icons allowed.
2.  **Do not remove** the `X/4` file limit check in logic; it prevents layout breakage.
3.  **Do not move** Breadcrumbs inside the inner content columns; they belong at the page root level.
