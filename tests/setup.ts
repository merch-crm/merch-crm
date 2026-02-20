/**
 * Global test setup — mocks Next.js server-only modules that cannot run in Node/Vitest.
 * This file is loaded before every test suite via vitest.config.ts `setupFiles`.
 */
import { vi } from 'vitest';

// Mock next/cache (revalidatePath, revalidateTag, etc.)
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
}));

// Mock next/navigation (redirect, notFound, etc.)
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
    notFound: vi.fn(),
    useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
    usePathname: vi.fn(() => '/'),
    useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock next/headers (cookies, headers)
vi.mock('next/headers', () => ({
    cookies: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        has: vi.fn(),
    })),
    headers: vi.fn(() => ({
        get: vi.fn(),
        has: vi.fn(),
        entries: vi.fn(() => []),
    })),
}));
