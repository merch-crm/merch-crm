import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './e2e',
    globalSetup: require.resolve('./e2e/setup/global-setup'),
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['html'],
        ['./e2e/reporters/fix-plan-reporter.ts'],
    ],

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        // Google Chrome
        {
            name: 'chrome',
            use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },

        // Safari (WebKit)
        {
            name: 'safari',
            use: { ...devices['Desktop Safari'] },
        },

        // Safari на iPhone
        {
            name: 'mobile-safari',
            use: { ...devices['iPhone 14'] },
        },

        // Safari на iPad
        {
            name: 'tablet-safari',
            use: { ...devices['iPad Pro 11'] },
        },

        // Firefox
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

    ],

    // Автозапуск dev-сервера
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        env: {
            NEXT_PUBLIC_E2E: 'true',
        },
    },
})
