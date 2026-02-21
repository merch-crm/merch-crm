import { Page, expect } from '@playwright/test';

/**
 * Ожидает полной загрузки страницы CRM
 * Проверяет несколько индикаторов готовности
 */
export async function waitForPageLoad(page: Page, options?: {
    timeout?: number;
    expectUrl?: string | RegExp;
}) {
    const timeout = options?.timeout ?? 15000;

    // 1. Ждём завершения сетевых запросов
    await page.waitForLoadState('networkidle', { timeout }).catch(() => {
        // Игнорируем таймаут networkidle, так как некоторые сокеты или аналитика могут висеть
    });

    // 2. Ждём исчезновения лоадеров (если есть)
    const loader = page.locator('[data-testid="page-loader"], .loading-spinner, [aria-busy="true"]');
    await loader.waitFor({ state: 'hidden', timeout }).catch(() => {
        // Игнорируем если лоадера нет
    });

    // 3. Ждём появления main контента
    const mainContent = page.locator('main, [role="main"], .dashboard-content, .page-content').first();
    await mainContent.waitFor({ state: 'visible', timeout });

    // 4. Проверяем URL если указан
    if (options?.expectUrl) {
        await expect(page).toHaveURL(options.expectUrl);
    }
}

/**
 * Находит возможные заголовки страницы в порядке приоритета
 */
export function getPageHeaderLocators(page: Page) {
    const main = page.locator('main');

    return [
        // 1. Явные маркеры заголовков (теперь глобально)
        page.locator('[data-testid="page-title"]'),
        page.locator('h1.sr-only'),

        // 2. Внутри контента
        main.locator('h1'),

        // 3. Глобальные/мобильные заголовки
        page.locator('header [data-testid="mobile-page-title"]'),
        page.locator('header h1'),

        // 4. Подзаголовки
        main.locator('h2'),
        main.locator('[data-testid="admin-page-header"] h1'),

        // 5. Активный пункт в хлебных крошках
        page.locator('nav[aria-label="Breadcrumb"] [aria-current="page"]'),

        // 6. Любой h3 в контенте
        main.locator('h3')
    ];
}

/**
 * Проверяет что страница загружена и содержит заголовок
 */
export async function expectPageLoaded(page: Page, options?: {
    title?: string | RegExp;
    timeout?: number;
}) {
    const timeout = options?.timeout ?? 15000;
    await waitForPageLoad(page, { timeout });

    const locators = getPageHeaderLocators(page);
    let foundHeader = null;

    // Пытаемся найти подходящий заголовок
    if (options?.title) {
        for (const locator of locators) {
            try {
                // Ждём появления хоть какого-то текста в локаторе в течение короткого времени
                const isVisible = await locator.isVisible().catch(() => false);
                // Для sr-only проверяем наличие в DOM
                const count = await locator.count().catch(() => 0);

                if (isVisible || count > 0) {
                    const text = (await locator.textContent().catch(() => "")) || "";
                    const isMatch = typeof options.title === 'string'
                        ? text.trim().includes(options.title)
                        : options.title.test(text.trim());

                    if (isMatch) {
                        foundHeader = locator;
                        break;
                    }
                }
            } catch (_e) {
                // Игнорируем ошибки поиска
            }
        }
    }

    // Если нашли - проверяем окончательно
    if (foundHeader) {
        await expect(foundHeader).toHaveText(options!.title!, { timeout: 5000 });
    } else {
        // Если не нашли заголовок с нужным текстом, проверяем хотя бы видимость main
        await expect(page.locator('main').first()).toBeVisible({ timeout: 5000 });

        // И если был указан титул, пробуем проверить его по всей странице как fallback
        if (options?.title) {
            const bodyText = (await page.textContent('body')) || "";
            const isMatch = typeof options.title === 'string'
                ? bodyText.trim().includes(options.title)
                : options.title.test(bodyText.trim());

            if (!isMatch) {
                // Если даже в body нет текста - это провал
                throw new Error(`Page title "${options.title}" not found anywhere on the page`);
            }
        }
    }
}
