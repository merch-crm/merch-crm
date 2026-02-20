import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateOrderPageClient } from './page-client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks
const mockPush = vi.fn();
const mockRefresh = vi.fn();
const mockBack = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
        back: mockBack,
    }),
    usePathname: () => '/dashboard/orders/new',
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../actions', () => ({
    createOrder: vi.fn(),
    searchClients: vi.fn(),
}));

vi.mock('../../finance/actions', () => ({
    validatePromocode: vi.fn(),
}));

vi.mock('@/components/branding-provider', () => ({
    useBranding: () => ({ currencySymbol: '₽' }),
}));

vi.mock('@/components/ui/toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/sounds', () => ({
    playSound: vi.fn(),
}));

// Mock Select to simplify
vi.mock('@/components/ui/select', () => ({
    Select: ({ options, onChange, value }: { options: Array<{ id: string; title: string }>; onChange: (val: { target: { value: string } }) => void; value: string }) => (
        <select data-testid="select" value={value} onChange={onChange as any}>
            <option value="">Select...</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>
    )
}));

import { searchClients, createOrder } from "../actions/core.actions";;
import { validatePromocode } from '../../finance/actions';

const mockInventory = [
    { id: 'item1', name: 'Футболка', quantity: 100, unit: 'pcs', sellingPrice: 500, price: 500 },
    { id: 'item2', name: 'Худи', quantity: 50, unit: 'pcs', sellingPrice: 1500, price: 1500 },
];

const mockClients = [
    { id: 'client1', name: 'Иван Иванов', firstName: 'Иван', lastName: 'Иванов', clientType: 'b2c' },
];

describe('CreateOrderPageClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.setConfig({ testTimeout: 30000 });
    });

    it('flows through all steps to create an order', async () => {
        vi.mocked(searchClients).mockResolvedValue({ success: true, data: mockClients as unknown as any[] });
        vi.mocked(createOrder).mockResolvedValue({ success: true });

        render(<CreateOrderPageClient initialInventory={mockInventory} />);

        // --- Step 0: Client Selection ---
        const searchInput = screen.getByPlaceholderText(/Поиск по имени/);
        fireEvent.change(searchInput, { target: { value: 'Иван' } });

        const clientResults = await screen.findAllByText('Иван Иванов', {}, { timeout: 10000 });
        fireEvent.click(clientResults[0]);

        await waitFor(() => expect(screen.queryByText('Изменить')).toBeInTheDocument(), { timeout: 5000 });
        fireEvent.click(screen.getByText('Далее'));

        // --- Step 1: Item Selection ---
        await screen.findByText('Выберите товары из каталога', {}, { timeout: 10000 });
        const addItemBtn = screen.getByText('Футболка').closest('button')!;
        fireEvent.click(addItemBtn);

        // Wait for it to be added to selected items (there will be at least 2 "Футболка" now)
        await waitFor(() => expect(screen.getAllByText('Футболка').length).toBeGreaterThanOrEqual(2), { timeout: 5000 });
        fireEvent.click(screen.getByText('Далее'));

        // --- Step 2: Details ---
        await screen.findByText('Детали заказа', {}, { timeout: 10000 });

        const selects = screen.getAllByTestId('select');
        fireEvent.change(selects[0], { target: { value: 'high' } });

        const deadlineInput = screen.getByLabelText('Дедлайн');
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        fireEvent.change(deadlineInput, { target: { value: nextWeekStr } });

        fireEvent.click(screen.getByText('Далее'));

        // --- Step 3: Review & Submit ---
        await screen.findByText('Подтверждение заказа', {}, { timeout: 10000 });

        const submitBtn = screen.getByText('Подтвердить и создать');
        fireEvent.click(submitBtn);

        await waitFor(() => expect(createOrder).toHaveBeenCalled(), { timeout: 10000 });
        expect(mockPush).toHaveBeenCalledWith('/dashboard/orders');
    }, 45000);

    it('shows validation error if no client selected', async () => {
        render(<CreateOrderPageClient initialInventory={mockInventory} />);
        fireEvent.click(screen.getByText('Далее'));
        expect(screen.getByText('Выберите клиента', { selector: 'span' })).toBeInTheDocument();
    });

    it('applies promocode correctly', async () => {
        vi.mocked(searchClients).mockResolvedValue({ success: true, data: mockClients as unknown as any[] });
        vi.mocked(validatePromocode).mockResolvedValue({
            success: true,
            data: { id: 'promo1', code: 'HELLO', discountType: 'percentage', value: '10', message: 'Скидка 10%', calculatedDiscount: 50 } as unknown as any
        });

        render(<CreateOrderPageClient initialInventory={mockInventory} />);

        fireEvent.change(screen.getByPlaceholderText(/Поиск по имени/), { target: { value: 'Иван' } });
        const results = await screen.findAllByText('Иван Иванов', {}, { timeout: 10000 });
        fireEvent.click(results[0]);
        await waitFor(() => expect(screen.queryByText('Изменить')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Далее'));

        const addItemBtn = screen.getByText('Футболка').closest('button')!;
        fireEvent.click(addItemBtn);
        await waitFor(() => expect(screen.getAllByText('Футболка').length).toBeGreaterThanOrEqual(2));
        fireEvent.click(screen.getByText('Далее'));

        const promoInput = screen.getByPlaceholderText('Введите промокод...');
        fireEvent.change(promoInput, { target: { value: 'HELLO' } });
        fireEvent.click(screen.getByText('Применить'));

        expect(await screen.findByText(/Промокод: HELLO/, {}, { timeout: 10000 })).toBeInTheDocument();

        fireEvent.click(screen.getByText('Далее'));
        expect(screen.getByText('450 ₽')).toBeInTheDocument();
    }, 45000);
});
