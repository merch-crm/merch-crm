import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KBClient } from './kb-client';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SheetStackProvider } from '@/components/ui/sheet-stack-context';
import { getKBPageDetail } from './actions';

// Mocks
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

vi.mock('./actions', () => ({
    getKBPageDetail: vi.fn(),
    createKBFolder: vi.fn(),
    createKBPage: vi.fn(),
    updateKBPage: vi.fn(),
    deleteKBPage: vi.fn(),
    getKBFolders: vi.fn(),
    getKBPages: vi.fn(),
}));

const mockFolders = [
    { id: 'f1', name: 'Продажи', parentId: null },
    { id: 'f2', name: 'Скрипты', parentId: 'f1' },
];

const mockPages = [
    {
        id: 'p1',
        title: 'Как создать заказ',
        content: 'Инструкция для новичков',
        folderId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'admin-id',
        author: { name: 'Админ' },
        folder: null
    },
];

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <SheetStackProvider>
            {ui}
        </SheetStackProvider>
    );
};

describe('KBClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders sidebar with folders and pages', () => {
        renderWithProviders(<KBClient initialFolders={mockFolders} initialPages={mockPages} userRole="Продавец" />);

        expect(screen.getByText('Продажи')).toBeInTheDocument();
        expect(screen.getByText('Как создать заказ', { selector: 'span' })).toBeInTheDocument();
    });

    it('shows empty state when no page is selected', () => {
        renderWithProviders(<KBClient initialFolders={mockFolders} initialPages={mockPages} userRole="Продавец" />);
        expect(screen.getByText('Знания — это сила')).toBeInTheDocument();
    });

    it('loads and displays page content on selection', async () => {
        vi.mocked(getKBPageDetail).mockResolvedValue({
            success: true,
            data: mockPages[0] as unknown as Extract<Awaited<ReturnType<typeof getKBPageDetail>>, { success: true }>['data']
        });

        renderWithProviders(<KBClient initialFolders={mockFolders} initialPages={mockPages} userRole="Продавец" />);

        const pageLink = screen.getByText('Как создать заказ', { selector: 'span' });
        fireEvent.click(pageLink);

        await waitFor(() => {
            expect(getKBPageDetail).toHaveBeenCalledWith('p1');
            expect(screen.getByText('Инструкция для новичков')).toBeInTheDocument();
        });
    });

    it('hides edit buttons for restricted roles', async () => {
        vi.mocked(getKBPageDetail).mockResolvedValue({
            success: true,
            data: mockPages[0] as unknown as Extract<Awaited<ReturnType<typeof getKBPageDetail>>, { success: true }>['data']
        });

        renderWithProviders(<KBClient initialFolders={mockFolders} initialPages={mockPages} userRole="Пользователь" />);

        fireEvent.click(screen.getByText('Как создать заказ', { selector: 'span' }));
        await waitFor(() => expect(screen.getByText('Инструкция для новичков')).toBeInTheDocument());

        expect(screen.queryByLabelText('Редактировать статью')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Удалить статью')).not.toBeInTheDocument();
    });

    it('shows edit buttons for Administrators', async () => {
        vi.mocked(getKBPageDetail).mockResolvedValue({
            success: true,
            data: mockPages[0] as unknown as Extract<Awaited<ReturnType<typeof getKBPageDetail>>, { success: true }>['data']
        });

        renderWithProviders(<KBClient initialFolders={mockFolders} initialPages={mockPages} userRole="Администратор" />);

        fireEvent.click(screen.getByText('Как создать заказ', { selector: 'span' }));
        await waitFor(() => expect(screen.getByText('Инструкция для новичков')).toBeInTheDocument());

        expect(screen.getByLabelText('Редактировать статью')).toBeInTheDocument();
        expect(screen.getByLabelText('Удалить статью')).toBeInTheDocument();
    });
});
