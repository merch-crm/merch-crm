# UI Development Rules

## Border Radius
- **Rule**: All functional blocks, cards, containers, buttons, and inputs MUST have a border radius of exactly **14px**.
- **Implementation**: In Tailwind CSS, consistently use the arbitrary value class `rounded-[14px]`.
- **Exceptions**: Only perfectly circular elements (like indicator dots or circular color pickers) can use `rounded-full`. Everything else (cards, buttons, inputs, sidebars, main content areas) must use `rounded-[14px]`.

## Spacing and Layout
- Maintain consistent padding and gaps as per the "Vertical Studio" layout design.
- Sidebar width: 300px.
- Main content area: flexible/grow.
- Consistent `gap-4` between sidebar and main content.

## State Persistence
- **Rule**: All client-side tabs, active sections, and important view states (e.g., active category in a dictionary) MUST be synchronized with URL search parameters.
- **Implementation**:
  - Use `useSearchParams` and `useRouter` from `next/navigation` to read and update the URL.
  - Update the URL using `router.replace('?tab=...', { scroll: false })` when the user switches tabs.
  - Initialize `useState` from the URL parameters on component mount or using a lazy initializer.
- **Purpose**: This ensures that when the user refreshes the page or shares a link, they remain on the exact same view/tab they were previously on.

## UI Integrity during Refactoring
- **Rule**: Technical refactoring or bug fixing must NEVER alter the established UI design.
- **Constraint**: If a component's code is rewritten to resolve linting or type errors, every CSS class, Tailwind utility, and layout structure must be preserved or meticulously reconstructed to match the original "Premium" aesthetic.

## Localization (L10n)
- **Rule**: All user-facing text, including navigation elements, buttons, headers, and breadcrumbs, MUST be in **Russian**.
- **Breadcrumbs**:
  - Technical path segments (e.g., `finance`, `promocodes`, `admin`) MUST be mapped to their Russian equivalents in the `routeLabels` dictionary within the `Breadcrumbs` component.
  - When adding new routes, immediately add the corresponding translation to `components/layout/breadcrumbs.tsx`.
- **Formatting**: Use Russian locale (`ru` from `date-fns/locale`) for dates and currency formatting where applicable.
