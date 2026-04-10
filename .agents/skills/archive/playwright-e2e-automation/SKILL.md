---
description: Patterns for robust End-to-End testing using Playwright in the CRM context.
related_to: [[webapp-testing]] [[testing-patterns]]
---
# Playwright E2E Automation

E2E testing is critical to CRM stability. Follow these patterns for tests running out of the `playwright/` or `e2e/` directories.

## Core Rules
1. **Page Object Model (POM)**: Never write raw locators inside test files. Define a Page Object class (e.g., `LoginPage`) that encapsulates selectors and actions.
2. **Setup and Authentication**:
  - Do not re-login via UI in every test unless testing the login flow itself.
  - Use Playwright's `storageState` to inject auth cookies/tokens before the test starts, or use API login in a `beforeAll` / global setup step.
3. **Resilient Selectors**:
  - Prefer user-oriented locators: `getByRole`, `getByText`, `getByTestId`.
  - Never use brittle CSS selectors tied to styling (e.g., `.bg-blue-500 > div > span`).
4. **Mocking vs Real DB**:
  - For complex UI flows without backend, use `page.route` to mock API responses.
  - For full integration, spin up a test database schema, seed data before the test, and tear down after.
5. **Awaiting State**: Do not use `page.waitForTimeout()`. Rely on Playwright's auto-waiting or explicitly wait for UI states: `expect(locator).toBeVisible()`.
