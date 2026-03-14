import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getConsumablesConfig } from "../consumables-actions";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(),
                })),
            })),
        })),
        insert: vi.fn(),
    },
}));

vi.mock("@/lib/auth", () => ({
    getSession: vi.fn(),
}));

describe("consumables-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue({ id: "user-1" } as unknown as Awaited<ReturnType<typeof getSession>>);
    });

    describe("getConsumablesConfig", () => {
        it("should return defaults if no config found", async () => {
            const mockSelect = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            };
            (db.select as Mock).mockReturnValue(mockSelect);

            const result = await getConsumablesConfig("dtf");

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.inkWhitePerM2).toBe(10);
                expect(result.data.inkCmykPerM2).toBe(4);
                expect(result.data.powderPerM2).toBe(34);
                expect(result.data.applicationType).toBe("dtf");
            }
        });

        it("should return found config", async () => {
             const mockConfig = {
                applicationType: "dtf",
                inkWhitePerM2: "15.5",
                inkCmykPerM2: "5.5",
                powderPerM2: "40.2",
                paperPerM2: null,
                fillPercent: 90,
                wastePercent: 5,
                config: null,
            };
            const mockSelect = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([mockConfig]),
            };
            (db.select as Mock).mockReturnValue(mockSelect);

            const result = await getConsumablesConfig("dtf");

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.inkWhitePerM2).toBe(15.5);
                expect(result.data.inkCmykPerM2).toBe(5.5);
                expect(result.data.powderPerM2).toBe(40.2);
                expect(result.data.paperPerM2).toBeNull();
                expect(result.data.fillPercent).toBe(90);
                expect(result.data.wastePercent).toBe(5);
                expect(result.data.config).toBeNull();
            }
        });
    });
});
