import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node', // Actions are server-side
        setupFiles: ['./vitest.setup.ts'],
        globals: true,
        testTimeout: 60000,
        alias: {
            '@': path.resolve(__dirname, './')
        },
        include: ['**/__tests__/**/*.actions.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/.next/**'],
    },
})
