import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

// Загружаем .env.local для доступа к переменным окружения
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

export default defineConfig({
    testDir: './e2e',
    globalSetup: require.resolve('./e2e/setup/global-setup'),
    fullyParallel: true,
    forbidOnly: !!process.env.CI,

    // Оптимизация для локальной разработки и CI
    retries: process.env.CI ? 2 : 0, // 0 для мгновенного падения (fail-fast) при локальной разработке
    workers: process.env.CI ? 1 : 6, // 6 воркеров для распараллеливания по платформам

    // Увеличенные таймауты для тяжёлых страниц CRM
    timeout: 90000,
    expect: {
        timeout: 30000,
    },

    outputDir: 'test-results',
    reporter: [
        ['html'],
        ['list']
    ],

    use: {
        baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        navigationTimeout: 60000,
        actionTimeout: 20000,
    },

    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        // Основной проект для тестов - Chrome
        {
            name: 'chrome',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome',
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        // Мобильная версия для проверки адаптивности
        {
            name: 'mobile-safari',
            use: {
                ...devices['iPhone 14'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
        // Планшетная версия
        {
            name: 'tablet-safari',
            use: {
                ...devices['iPad Pro 11'],
                storageState: 'playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
    ],

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
        env: {
            NEXT_PUBLIC_E2E: 'true',
        },
    },
});
