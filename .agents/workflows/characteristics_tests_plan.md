# Implementation Plan: Update Unit and E2E Tests for Characteristics

## 1. Unit Tests for Hooks
### `use-add-attribute-type.test.ts`
- Test `transliterateToSlug` function mapping.
- Test initialization (no name, default `text` type).
- Test changing dataType sets correct default name if empty.
- Test `handleOpen` resets state correctly.
- Mock `createInventoryAttributeType` action.
- Test `handleCreate` success flow: sets loading, calls action, shows toast, plays sound, redirects/refreshes, closes modal.
- Test `handleCreate` error flow: empty name sets error, action error sets error.

### `use-warehouse-characteristic.test.ts` (simplified tests for core logic)
- Test `getColorHex` helper.
- Test `sortAttributeValues` helper (sorts numbers, sizes standard, text alphabetical, density, etc.).
- Test transliteration integration if exported or utilized directly in helpers.

## 2. E2E Tests (`e2e/modules/warehouse/characteristics.spec.ts`)
- The user highlighted that existing characteristics in DB shouldn't be strictly hardcoded because they might vary.
- The test will dynamically interact with the page.
- Test path: `/dashboard/warehouse` -> navigate to Characteristics tab or page `/dashboard/warehouse/attributes`.
- Test: Open "New Characteristic" modal.
- Test: Select a random type (e.g. Dimensions or Text).
- Test: Generate a random string `TestChar_${Date.now()}` for the name.
- Test: Save characteristic.
- Test: Open the characteristic settings.
- Test: Add a value to the created characteristic (e.g., `Value 1`).
- Test: Delete the added characteristic at the end of the test (cleanup), or check its creation.

## 3. Run and Validate Tests
- Run `npm run test` for the unit tests and ensure they pass.
- Run `npm run test:e2e` for the new e2e test (if playwright allows running a single file easily).
