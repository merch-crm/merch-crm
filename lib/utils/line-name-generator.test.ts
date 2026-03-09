import { describe, it, expect } from "vitest";
import {
    generateLineName,
    generatePositionName,
    singularize,
    generatePositionSKU,
    transliterate,
    generateShortCode
} from "./line-name-generator";

describe("line-name-generator", () => {
    describe("generateLineName", () => {
        it("should generate name from prioritized attributes", () => {
            const attributes = [
                { attributeId: "1", attributeCode: "density", attributeName: "Плотность", value: "200" },
                { attributeId: "2", attributeCode: "brand", attributeName: "Бренд", value: "Muse" },
                { attributeId: "3", attributeCode: "fabric", attributeName: "Ткань", value: "Кулирка" },
            ];

            // Priority: brand (1), density (2), fabric (3)
            expect(generateLineName({ attributes })).toBe("Muse 200 Кулирка");
        });

        it("should use valueLabel if available", () => {
            const attributes = [
                { attributeId: "1", attributeCode: "color", attributeName: "Цвет", value: "#ffffff", valueLabel: "Белый" },
            ];
            expect(generateLineName({ attributes })).toBe("Белый");
        });

        it("should sort alphabetically for same priority", () => {
            const attributes = [
                { attributeId: "1", attributeCode: "other2", attributeName: "Я-Атрибут", value: "Значение2" },
                { attributeId: "2", attributeCode: "other1", attributeName: "А-Атрибут", value: "Значение1" },
            ];
            expect(generateLineName({ attributes })).toBe("Значение1 Значение2");
        });

        it("should truncate long names", () => {
            const attributes = [
                { attributeId: "1", attributeName: "Name", value: "Very long name that should be truncated eventually by the generator" },
            ];
            expect(generateLineName({ attributes, maxLength: 20 })).toBe("Very long name th...");
        });

        it("should return empty string for empty attributes", () => {
            expect(generateLineName({ attributes: [] })).toBe("");
        });
    });

    describe("generatePositionName", () => {
        it("should combine all parts correctly", () => {
            const name = generatePositionName({
                productName: "Футболка",
                lineName: "Muse 220",
                printName: "Овен",
                colorName: "Черный",
                sizeName: "XL"
            });
            expect(name).toBe("Футболка Muse 220 Овен Черный XL");
        });

        it("should skip empty parts", () => {
            const name = generatePositionName({
                productName: "Футболка",
                lineName: "Muse 220",
                printName: "",
                colorName: "Черный",
                sizeName: "XL"
            });
            expect(name).toBe("Футболка Muse 220 Черный XL");
        });
    });

    describe("singularize", () => {
        it("should convert plural to singular for known words", () => {
            expect(singularize("Футболки")).toBe("Футболка");
            expect(singularize("Блокноты")).toBe("Блокнот");
            expect(singularize("Кружки")).toBe("Кружка");
        });

        it("should return original word if not in dictionary", () => {
            expect(singularize("Неизвестное")).toBe("Неизвестное");
        });
    });

    describe("generatePositionSKU", () => {
        it("should generate formatted SKU", () => {
            const sku = generatePositionSKU({
                categoryCode: "ft",
                lineCode: "muse220",
                printCode: "oven",
                colorCode: "blk",
                sizeCode: "xl"
            });
            expect(sku).toBe("FT-MUSE220-OVEN-BLK-XL");
        });
    });

    describe("transliterate", () => {
        it("should transliterate cyrillic correctly", () => {
            expect(transliterate("Майка")).toBe("MAYKA");
            expect(transliterate("Белый")).toBe("BELYY");
        });

        it("should remove special characters", () => {
            expect(transliterate("Brand & Co")).toBe("BRANDCO");
        });
    });

    describe("generateShortCode", () => {
        it("should generate code for single word", () => {
            expect(generateShortCode("Футболка")).toBe("FUTBOLKA");
            expect(generateShortCode("Футболка", 4)).toBe("FUTB");
        });

        it("should combine multi-word titles", () => {
            // "Stanley Stella" -> STST
            expect(generateShortCode("Stanley Stella", 4)).toBe("STST");
        });

        it("should take initials for many words", () => {
            // "The Quick Brown Fox" -> TQBF
            expect(generateShortCode("The Quick Brown Fox", 4)).toBe("TQBF");
        });
    });
});
