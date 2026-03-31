import { test } from '@playwright/test';

test('debug warehouse visibility', async ({ page }) => {
    await page.goto('/dashboard/warehouse');
    await page.waitForLoadState('networkidle');

    const h1 = page.locator('h1').first();
    const isPresent = await h1.count() > 0;
    console.log('H1 present:', isPresent);

    if (isPresent) {
        const text = await h1.innerText();
        console.log('H1 text:', text);

        const box = await h1.boundingBox();
        console.log('H1 bounding box:', box);

        const visibility = await h1.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                zIndex: style.zIndex,
                width: style.width,
                height: style.height,
                clip: style.clip,
                clipPath: style.clipPath
            };
        });
        console.log('H1 computed style:', visibility);

        await page.screenshot({ path: 'debug-warehouse.png' });
    }
});
