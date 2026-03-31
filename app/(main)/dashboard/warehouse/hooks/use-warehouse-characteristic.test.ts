import { describe, it, expect } from 'vitest';
import { getColorHex, transliterateToSku, sortAttributeValues } from '../utils/characteristic-helpers';
import { InventoryAttribute } from '../types';

describe('Warehouse Characteristic Helpers', () => {
    describe('getColorHex', () => {
        it('returns hex color if meta has hex', () => {
            expect(getColorHex({ hex: '#ff0000' })).toBe('#ff0000');
        });

        it('returns default color if meta is null', () => {
            expect(getColorHex(null)).toBe('#000000');
        });

        it('returns default color if meta has no hex', () => {
            expect(getColorHex({ someOtherProp: true })).toBe('#000000');
            expect(getColorHex('just a string')).toBe('#000000');
        });
    });

    describe('transliterateToSku', () => {
        it('transliterates correctly and returns up to 3 chars', () => {
            expect(transliterateToSku('цве')).toBe('tsv'); // 3 chars
            expect(transliterateToSku('Штаны')).toBe('sht'); // 'ш' => 'sh', 'т' => 't', truncated to 3
        });

        it('handles spaces and ignores non-alphanumeric chars', () => {
            expect(transliterateToSku('Осень   2')).toBe('ose');
            expect(transliterateToSku('!%#Привет')).toBe('pri');
        });
    });

    describe('sortAttributeValues', () => {
        const createMockAttribute = (value: string, name: string): InventoryAttribute => ({
            id: value,
            type: 'dummy',
            value: value,
            name: name
        });

        it('sorts pure numeric types correctly (e.g. density, quantity)', () => {
            const values = [
                createMockAttribute('100', '100'),
                createMockAttribute('20', '20'),
                createMockAttribute('3000', '3000'),
            ];

            const sorted = sortAttributeValues(values, 'density');
            expect(sorted.map(v => v.value)).toEqual(['20', '100', '3000']);
        });

        it('sorts numeric types with trailing strings', () => {
            const values = [
                createMockAttribute('100g', '100 г'),
                createMockAttribute('20kg', '20 кг'),
                createMockAttribute('300g', '300 г'),
                createMockAttribute('1000', '1000') // implicitly grams or generic
            ];

            const sorted = sortAttributeValues(values, 'weight');
            expect(sorted.map(v => v.value)).toEqual(['100g', '300g', '1000', '20kg']); // 100g < 300g < 1000(1kg) < 20kg
        });

        it('sorts units and clothing sizes correctly', () => {
            const sizeValues = [
                createMockAttribute('M', 'M size'),
                createMockAttribute('L_OS', 'L oversize'),
                createMockAttribute('S', 'S size'),
                createMockAttribute('L', 'L size'),
                createMockAttribute('46', 'EU 46')
            ];

            const sortedSizes = sortAttributeValues(sizeValues, 'size');
            expect(sortedSizes.map(v => v.value)).toEqual(['S', 'M', 'L', 'L_OS', '46']);
        });

        it('sorts general text types alphabetically', () => {
            const textValues = [
                createMockAttribute('code-c', 'Яблоко'),
                createMockAttribute('code-a', 'Апельсин'),
                createMockAttribute('code-b', 'банан') // test case insensitive sort
            ];

            const sortedText = sortAttributeValues(textValues, 'text');
            expect(sortedText.map(v => v.name)).toEqual(['Апельсин', 'банан', 'Яблоко']);
        });
    });
});
