// Mocking process.env for tsx
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need to set some env vars that the schema might check
process.env.NODE_ENV = 'development';

import { getBrandingSettings } from "../lib/branding.ts";

async function test() {
    try {
        console.log('⏳ Вызов getBrandingSettings()...');
        const settings = await getBrandingSettings();
        console.log('✅ Настройки получены:', JSON.stringify(settings, null, 2));
    } catch (err) {
        console.error('❌ Ошибка:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        process.exit(0);
    }
}

test();
