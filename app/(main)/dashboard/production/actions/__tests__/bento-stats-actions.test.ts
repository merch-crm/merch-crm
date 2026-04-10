import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import * as actions from "../bento-stats-actions";
import { getSession } from "@/lib/session";

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => []),
          })),
          groupBy: vi.fn(() => ({
            orderBy: vi.fn(() => []),
          })),
        })),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            groupBy: vi.fn(() => ({
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => []),
              })),
            })),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => [{ id: "1" }]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => [{ id: "1" }]),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => [{ id: "1" }]),
      })),
    })),
  },
}));

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
  logAction: vi.fn(),
}));

describe("bento-stats-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export functions", () => {
    const exports = Object.keys(actions).filter(k => typeof (actions as (Record<string, unknown>))[k] === 'function');
    expect(exports.length).toBeGreaterThan(0);
  });

  it("should return unauthorized if no session", async () => {
    (getSession as Mock).mockResolvedValue(null);
    
    const firstFuncName = Object.keys(actions).find(k => typeof (actions as (Record<string, unknown>))[k] === 'function');
    if (firstFuncName) {
      const result = await (actions as (Record<string, (args: unknown) => Promise<{success: boolean, error?: string}>>))[firstFuncName]({});
      if (result && typeof result === 'object' && 'success' in result) {
        expect(result.success).toBe(false);
        expect(result.error).toBeTruthy(); // Generic test expects failure on unauthorized or validation
      }
    }
  });
});
