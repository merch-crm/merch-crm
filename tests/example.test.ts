import { describe, it, expect } from 'vitest';

describe('Базовый тест', () => {
    it('должен выполнять простую арифметику', () => {
        expect(1 + 1).toBe(2);
    });
});
