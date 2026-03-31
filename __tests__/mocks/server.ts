import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Настройка MSW сервера для Node.js окружения (Vitest)
 * @audit testing
 */
export const server = setupServer(...handlers);
