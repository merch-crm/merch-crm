import { getSession } from "@/lib/session";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { findFirstMock, findManyMock, insertMock, selectMock } = vi.hoisted(() => {
  const findFirstMock = vi.fn();
  const findManyMock = vi.fn();
  const insertMock = vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{ id: 'mock-id' }]))
    }))
  }));
  const selectMock = vi.fn();
  return { findFirstMock, findManyMock, insertMock, selectMock };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/redis', () => ({ invalidateCache: vi.fn() }));
vi.mock('@/lib/notifications', () => ({ checkItemStockAlerts: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      inventoryItems: { findMany: findManyMock, findFirst: findFirstMock },
      inventoryCategories: { findMany: findManyMock, findFirst: findFirstMock },
      inventoryTransactions: { findMany: findManyMock },
      orderItems: { findMany: findManyMock },
      productLines: { findFirst: findFirstMock, findMany: findManyMock },
    },
    insert: insertMock,
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })) })),
    delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
    select: selectMock,
    transaction: vi.fn(async (fn) => fn({ insert: insertMock, query: { inventoryItems: { findMany: findManyMock } } })),
  },
}));

vi.mock('@/app/(main)/dashboard/warehouse/actions-utils', () => ({
  getCategoryPath: vi.fn().mockResolvedValue('/uploads/warehouse'),
  saveFile: vi.fn().mockResolvedValue(null),
  getCategoryFullPath: vi.fn().mockResolvedValue('/uploads/warehouse'),
  isDescendant: vi.fn().mockResolvedValue(false),
  updateChildrenPaths: vi.fn().mockResolvedValue(undefined),
}));

import {
  getInventoryItems,
} from '@/app/(main)/dashboard/warehouse/item-actions';
import {
  addPositionsToExistingLine,
} from '@/app/(main)/dashboard/warehouse/items/new/actions';

describe('Warehouse Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findFirstMock.mockReset();
    findManyMock.mockReset();
    insertMock.mockClear();
    selectMock.mockReset();
  });

  describe('getInventoryItems', () => {
    it('возвращает список товаров', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(mockSession());
      findManyMock.mockResolvedValueOnce([{ id: '1' }]);
      selectMock.mockReturnValue({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([{ count: 1 }]))
          }))
        }))
      });
      const result = await getInventoryItems();
      expect(result.success).toBe(true);
    });
  });

  describe('addPositionsToExistingLine', () => {
    it('успешно добавляет позиции', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(mockSession());

      findFirstMock.mockResolvedValueOnce({
        id: 'line-id',
        name: 'T-shirt',
        categoryId: 'cat-id',
        type: 'base'
      });

      findManyMock.mockResolvedValueOnce([]);

      const result = await addPositionsToExistingLine('line-id', [
        { sku: 'S1', sizeCode: 'L', quantity: 10, storageLocationId: 'loc1' }
      ]);

      expect(result.success).toBe(true);
      expect(insertMock).toHaveBeenCalled();
    });

    it('ошибка если линейка не найдена', async () => {
      vi.mocked(getSession).mockResolvedValueOnce(mockSession());
      findFirstMock.mockResolvedValueOnce(null);

      const result = await addPositionsToExistingLine('line-id', []);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Линейка не найдена');
    });
  });
});
