/* eslint-disable @typescript-eslint/no-require-imports */
import { type FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import path from 'path';

async function globalSetup(config: FullConfig) {
    console.log('--- Global Setup Starting ---');

    // Загружаем переменные строго ДО импорта модулей, использующих БД
    dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

    // Динамический импорт чтобы избежать хойстинга и преждевременной инициализации lib/env
    const setup = require('../../scripts/setup-e2e').default;
    await setup();

    console.log('--- Global Setup Finished ---');
}

export default globalSetup;
