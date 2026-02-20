import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './pagination';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => '/test-path',
    useSearchParams: () => new URLSearchParams('page=1'),
}));

describe('Pagination', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders pagination info correctly', () => {
        render(<Pagination currentPage={1} totalItems={50} pageSize={10} />);
        expect(screen.getByText(/Показано/)).toBeInTheDocument();
        // Use getAllByText for '1' since it appears in info and in button
        const ones = screen.getAllByText('1');
        expect(ones.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('calls onPageChange when a number is clicked', () => {
        const onPageChange = vi.fn();
        render(<Pagination currentPage={1} totalItems={50} pageSize={10} onPageChange={onPageChange} />);

        fireEvent.click(screen.getByText('2'));
        expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('updates URL when onPageChange is NOT provided', () => {
        render(<Pagination currentPage={1} totalItems={50} pageSize={10} />);

        fireEvent.click(screen.getByText('3'));
        expect(mockPush).toHaveBeenCalledWith('/test-path?page=3');
    });

    it('disables "Prev" on first page and "Next" on last page', () => {
        const { rerender } = render(<Pagination currentPage={1} totalItems={20} pageSize={10} />);
        expect(screen.getByText('Пред')).toBeDisabled();
        expect(screen.getByText('След')).not.toBeDisabled();

        rerender(<Pagination currentPage={2} totalItems={20} pageSize={10} />);
        expect(screen.getByText('Пред')).not.toBeDisabled();
        expect(screen.getByText('След')).toBeDisabled();
    });

    it('shows ellipsis correctly for many pages', () => {
        render(<Pagination currentPage={5} totalItems={100} pageSize={10} />);

        expect(screen.getByText('1')).toBeInTheDocument();
        const ellipses = screen.getAllByText('...');
        expect(ellipses.length).toBe(2);
        expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('uses correct genitive word for items', () => {
        const itemNames: [string, string, string] = ['клиент', 'клиента', 'клиентов'];

        const { rerender } = render(
            <Pagination currentPage={1} totalItems={1} pageSize={10} itemNames={itemNames} />
        );
        expect(screen.getByText(/клиента/)).toBeInTheDocument();

        rerender(
            <Pagination currentPage={1} totalItems={5} pageSize={10} itemNames={itemNames} />
        );
        expect(screen.getByText(/клиентов/)).toBeInTheDocument();
    });
});
