import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryClient } from './inventory-client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('./category-utils', () => ({
    getCategoryIcon: () => () => <div data-testid="category-icon" />,
    getGradientStyles: () => 'bg-blue-500',
}));

vi.mock('./edit-category-dialog', () => ({
    // Use an identifiable component name for the mock
    EditCategoryDialog: ({ isOpen, category }: { isOpen: boolean; category: { name: string } }) => {
        if (!isOpen) return null;
        return <div data-testid="edit-dialog">Editing {category?.name}</div>;
    },
}));

const mockCategories = [
    { id: '1', name: 'Одежда', totalQuantity: 100, color: 'blue', parentId: null, sortOrder: 1, itemCount: 10, icon: null, description: null },
    { id: '2', name: 'Футболки', totalQuantity: 60, parentId: '1', sortOrder: 1, itemCount: 5, icon: null, description: null, color: null },
    { id: '3', name: 'Худи', totalQuantity: 40, parentId: '1', sortOrder: 2, itemCount: 5, icon: null, description: null, color: null },
    { id: '4', name: 'Сувениры', totalQuantity: 20, parentId: null, sortOrder: 2, description: 'Разные сувениры', icon: null, color: null },
];

describe('InventoryClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders top-level categories correctly', () => {
        render(<InventoryClient categories={mockCategories} user={null} />);
        expect(screen.getByText('Одежда')).toBeInTheDocument();
        expect(screen.getByText('Сувениры')).toBeInTheDocument();
    });

    it('navigates to category detail on click', async () => {
        render(<InventoryClient categories={mockCategories} user={null} />);
        fireEvent.click(screen.getByText('Одежда'));
        expect(mockPush).toHaveBeenCalledWith('/dashboard/warehouse/1');
    });

    it('shows subcategories for a category', () => {
        render(<InventoryClient categories={mockCategories} user={null} />);
        expect(screen.getByText('Футболки')).toBeInTheDocument();
        expect(screen.getByText('Худи')).toBeInTheDocument();
    });

    it('opens edit dialog when clicking pencil icon', async () => {
        const { container } = render(<InventoryClient categories={mockCategories} user={null} />);

        // Find the pencil icon and its parent button
        const pencilIcon = container.querySelector('.lucide-pencil');
        if (!pencilIcon) throw new Error('Pencil icon not found');

        const editButton = pencilIcon.closest('button');
        if (!editButton) throw new Error('Edit button not found');

        fireEvent.click(editButton);

        // Wait for the dialog to appear in the DOM
        await waitFor(() => {
            expect(screen.getByTestId('edit-dialog')).toBeInTheDocument();
        }, { timeout: 5000 });

        expect(screen.getByText(/Editing Одежда/)).toBeInTheDocument();
    });

    it('shows description if no subcategories', () => {
        render(<InventoryClient categories={mockCategories} user={null} />);
        expect(screen.getByText('Разные сувениры')).toBeInTheDocument();
    });
});
