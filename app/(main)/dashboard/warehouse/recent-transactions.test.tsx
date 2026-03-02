import { render, screen, fireEvent } from '@testing-library/react';
import { RecentTransactionsClient } from './recent-transactions';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/image
vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => (
        <div data-testid="next-image-mock" data-src={src} data-alt={alt} />
    ),
}));

// Mock next/navigation (required by Pagination component)
vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/dashboard/warehouse',
    useSearchParams: () => new URLSearchParams(),
}));

// Mock date-fns to get deterministic output
vi.mock('date-fns', async (importOriginal) => {
    const actual = await importOriginal<typeof import('date-fns')>();
    return {
        ...actual,
        format: () => '15 фев 10:30',
    };
});

const BASE_DATE = new Date('2026-02-15T10:30:00.000Z');

const mockInTransaction = {
    id: 'tx-1',
    type: 'in' as const,
    changeAmount: 50,
    createdAt: BASE_DATE,
    item: { id: 'item-1', name: 'Футболка белая', unit: 'pcs' },
    storageLocation: { id: 'loc-1', name: 'Центральный склад' },
    fromStorageLocation: null,
    creator: { id: 'user-1', name: 'Иван Петров', avatar: null },
};

const mockTransferTransaction = {
    id: 'tx-2',
    type: 'transfer' as const,
    changeAmount: 20,
    createdAt: BASE_DATE,
    item: { id: 'item-2', name: 'Худи синее', unit: 'pcs' },
    storageLocation: { id: 'loc-2', name: 'Склад 2' },
    fromStorageLocation: { id: 'loc-1', name: 'Центральный склад' },
    creator: { id: 'user-2', name: 'Анна Смирнова', avatar: 'https://example.com/avatar.jpg' },
};

const mockTransferWithoutCreator = {
    ...mockTransferTransaction,
    id: 'tx-3',
    creator: null,
};

describe('RecentTransactionsClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when transactions list is empty', () => {
        const { container } = render(<RecentTransactionsClient transactions={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when all transactions are filtered out (wrong type)', () => {
        const usageTransaction = { ...mockInTransaction, id: 'tx-u', type: 'usage' as never };
        const { container } = render(<RecentTransactionsClient transactions={[usageTransaction]} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders incoming transaction with correct item name and location', () => {
        render(<RecentTransactionsClient transactions={[mockInTransaction]} />);
        expect(screen.getByText('Футболка белая')).toBeInTheDocument();
        expect(screen.getByText('Центральный склад')).toBeInTheDocument();
        expect(screen.getByText('Поставка на')).toBeInTheDocument();
    });

    it('shows correct amount for incoming transaction', () => {
        render(<RecentTransactionsClient transactions={[mockInTransaction]} />);
        expect(screen.getByText(/\+50/)).toBeInTheDocument();
    });

    it('renders transfer transaction with from/to locations', () => {
        render(<RecentTransactionsClient transactions={[mockTransferTransaction]} />);
        expect(screen.getByText('Худи синее')).toBeInTheDocument();
        expect(screen.getByText('Склад 2')).toBeInTheDocument();
        expect(screen.getAllByText('Центральный склад').length).toBeGreaterThan(0);
        expect(screen.getByText('Из')).toBeInTheDocument();
        expect(screen.getByText('в')).toBeInTheDocument();
    });

    it('shows creator initials when no avatar', () => {
        render(<RecentTransactionsClient transactions={[mockInTransaction]} />);
        // Иван Петров → "ИВ"
        expect(screen.getByText('ИВ')).toBeInTheDocument();
    });

    it('shows creator avatar image when avatar URL provided', () => {
        render(<RecentTransactionsClient transactions={[mockTransferTransaction]} />);
        const avatar = screen.getByTestId('next-image-mock');
        expect(avatar).toHaveAttribute('data-src', 'https://example.com/avatar.jpg');
        expect(avatar).toHaveAttribute('data-alt', 'аватар');
    });

    it('renders without creator section when creator is null', () => {
        render(<RecentTransactionsClient transactions={[mockTransferWithoutCreator]} />);
        expect(screen.queryByText('АН')).not.toBeInTheDocument();
    });

    it('renders multiple transactions', () => {
        render(<RecentTransactionsClient transactions={[mockInTransaction, mockTransferTransaction]} />);
        expect(screen.getByText('Футболка белая')).toBeInTheDocument();
        expect(screen.getByText('Худи синее')).toBeInTheDocument();
    });

    it('shows fallback item name when item is null', () => {
        const txWithoutItem = { ...mockInTransaction, id: 'tx-ni', item: null };
        render(<RecentTransactionsClient transactions={[txWithoutItem]} />);
        expect(screen.getByText('Неизвестный товар')).toBeInTheDocument();
    });

    it('shows fallback location when storageLocation is null', () => {
        const txWithoutLocation = { ...mockInTransaction, id: 'tx-nl', storageLocation: null };
        render(<RecentTransactionsClient transactions={[txWithoutLocation]} />);
        expect(screen.getByText('Склад')).toBeInTheDocument();
    });

    it('does not show pagination when 5 or fewer transactions', () => {
        render(<RecentTransactionsClient transactions={[mockInTransaction, mockTransferTransaction]} />);
        // Pagination only appears when totalPages > 1
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('shows pagination when more than 5 transactions', () => {
        const many = Array.from({ length: 7 }, (_, i) => ({
            ...mockInTransaction,
            id: `tx-${i}`,
            item: { id: `item-${i}`, name: `Товар ${i}`, unit: 'pcs' },
        }));
        render(<RecentTransactionsClient transactions={many} />);
        // First page shows only 5 items, item 5 and 6 should be on page 2
        expect(screen.getByText('Товар 0')).toBeInTheDocument();
        expect(screen.getByText('Товар 4')).toBeInTheDocument();
        expect(screen.queryByText('Товар 5')).not.toBeInTheDocument();
    });

    it('navigates to next page when pagination is used', () => {
        const many = Array.from({ length: 7 }, (_, i) => ({
            ...mockInTransaction,
            id: `tx-${i}`,
            item: { id: `item-${i}`, name: `Товар ${i}`, unit: 'pcs' },
        }));
        render(<RecentTransactionsClient transactions={many} />);

        // Find a button that contains "2" (the page 2 button)
        const buttons = screen.getAllByRole('button');
        const page2Button = buttons.find(btn => btn.textContent?.trim() === '2');
        if (!page2Button) throw new Error('Page 2 button not found');
        fireEvent.click(page2Button);
        expect(screen.getByText('Товар 5')).toBeInTheDocument();
    });
});
