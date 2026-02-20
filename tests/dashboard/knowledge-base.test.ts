import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    const mockFindFirst = vi.fn();
    const mockTx = {
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    };
    return { mockFindMany, mockFindFirst, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            wikiFolders: { findMany: mockFindMany, findFirst: mockFindFirst },
            wikiPages: { findMany: mockFindMany, findFirst: mockFindFirst },
        },
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import {
    getWikiFolders,
    createWikiFolder,
    getWikiPages,
    getWikiPageDetail,
    createWikiPage,
    updateWikiPage,
    deleteWikiPage,
} from '@/app/(main)/dashboard/knowledge-base/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

const ADMIN_SESSION = { roleName: 'Администратор' };
const MANAGER_SESSION = { roleName: 'Менеджер' };

const setupMocks = () => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation(
        (async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as never,
    );
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as never);
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as never);
    mockTx.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
};

// ─── getWikiFolders ───────────────────────────────────────────────────────────

describe('getWikiFolders', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getWikiFolders();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает список папок', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const folders = [{ id: 'f1', name: 'Общие', parentId: null }];
        mockFindMany.mockResolvedValueOnce(folders);
        const result = await getWikiFolders();
        expect(result).toEqual({ success: true, data: folders });
    });

    it('возвращает ошибку при сбое БД', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getWikiFolders();
        expect(result.success).toBe(false);
    });
});

// ─── createWikiFolder ─────────────────────────────────────────────────────────

describe('createWikiFolder', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await createWikiFolder('New Folder');
        expect(result).toEqual({ success: false, error: 'Недостаточно прав' });
    });

    it('возвращает ошибку если нет прав (роль Менеджер)', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(MANAGER_SESSION));
        const result = await createWikiFolder('New Folder');
        expect(result).toEqual({ success: false, error: 'Недостаточно прав' });
    });

    it('возвращает ошибку при пустом имени', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const result = await createWikiFolder('');
        expect(result.success).toBe(false);
    });

    it('создаёт папку при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const newFolder = { id: 'f1', name: 'Новая папка', parentId: null };
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newFolder]) }),
        });
        const result = await createWikiFolder('Новая папка');
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data.name).toBe('Новая папка');
        }
    });
});

// ─── getWikiPages ─────────────────────────────────────────────────────────────

describe('getWikiPages', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getWikiPages();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает все статьи без фильтра папки', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const pages = [{ id: 'p1', title: 'Инструкция', content: '...', author: { name: 'Admin' } }];
        mockFindMany.mockResolvedValueOnce(pages);
        const result = await getWikiPages();
        expect(result).toEqual({ success: true, data: pages });
    });

    it('возвращает статьи из папки', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const pages = [{ id: 'p1', title: 'Статья 1', folderId: 'f1', author: { name: 'Admin' } }];
        mockFindMany.mockResolvedValueOnce(pages);
        const result = await getWikiPages('f1');
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data).toHaveLength(1);
        }
    });
});

// ─── getWikiPageDetail ────────────────────────────────────────────────────────

describe('getWikiPageDetail', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getWikiPageDetail('p1');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает детали статьи', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const page = { id: 'p1', title: 'Инструкция', content: 'Контент', author: { name: 'Admin' }, folder: null };
        mockFindFirst.mockResolvedValueOnce(page);
        const result = await getWikiPageDetail('p1');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(page);
        }
    });
});

// ─── createWikiPage ───────────────────────────────────────────────────────────

describe('createWikiPage', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(MANAGER_SESSION));
        const result = await createWikiPage({ title: 'Test', content: 'Content', folderId: null });
        expect(result).toEqual({ success: false, error: 'Недостаточно прав' });
    });

    it('возвращает ошибку при пустом заголовке', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const result = await createWikiPage({ title: '', content: 'Content', folderId: null });
        expect(result.success).toBe(false);
    });

    it('создаёт статью при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const newPage = { id: 'p1', title: 'Новая статья', content: 'Контент' };
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newPage]) }),
        });
        const result = await createWikiPage({ title: 'Новая статья', content: 'Контент', folderId: null });
        expect(result.success).toBe(true);
    });
});

// ─── updateWikiPage ───────────────────────────────────────────────────────────

describe('updateWikiPage', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(MANAGER_SESSION));
        const result = await updateWikiPage('p1', { title: 'Updated' });
        expect(result).toEqual({ success: false, error: 'Недостаточно прав' });
    });

    it('обновляет статью', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const result = await updateWikiPage('p1', { title: 'Обновлённый заголовок' });
        expect(result).toEqual({ success: true });
    });
});

// ─── deleteWikiPage ───────────────────────────────────────────────────────────

describe('deleteWikiPage', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(MANAGER_SESSION));
        const result = await deleteWikiPage('p1');
        expect(result).toEqual({ success: false, error: 'Недостаточно прав' });
    });

    it('возвращает ошибку при пустом ID', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const result = await deleteWikiPage('');
        expect(result).toEqual({ success: false, error: 'Невалидный ID' });
    });

    it('удаляет статью', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession(ADMIN_SESSION));
        const result = await deleteWikiPage('p1');
        expect(result).toEqual({ success: true });
    });
});
