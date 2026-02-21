/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WikiClient } from './wiki-client';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    getWikiPageDetail: vi.fn(),
    createWikiFolder: vi.fn(),
    createWikiPage: vi.fn(),
    updateWikiPage: vi.fn(),
    deleteWikiPage: vi.fn(),
    getWikiFolders: vi.fn(),
    getWikiPages: vi.fn(),
}));

import { getWikiPageDetail } from './actions';

const mockFolders = [
    { id: 'f1', name: 'Продажи', parentId: null },
    { id: 'f2', name: 'Скрипты', parentId: 'f1' },
];

const mockPages = [
    { id: 'p1', title: 'Как создать заказ', content: 'Инструкция для новичков', folderId: null, updatedAt: new Date(), author: { name: 'Админ' } },
];

import { SheetStackProvider } from '@/components/ui/sheet-stack-context';

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <SheetStackProvider>
            {ui}
        </SheetStackProvider>
    );
};

describe('WikiClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders sidebar with folders and pages', () => {
        renderWithProviders(<WikiClient initialFolders={mockFolders} initialPages={mockPages} userRole="Продавец" />);

        expect(screen.getByText('Продажи')).toBeInTheDocument();
        expect(screen.getByText('Как создать заказ', { selector: 'span' })).toBeInTheDocument();
    });

    it('shows empty state when no page is selected', () => {
        renderWithProviders(<WikiClient initialFolders={mockFolders} initialPages={mockPages} userRole="Продавец" />);
        expect(screen.getByText('Знания — это сила')).toBeInTheDocument();
    });

    it('loads and displays page content on selection', async () => {
        vi.mocked(getWikiPageDetail).mockResolvedValue({
            success: true,
            data: mockPages[0] as any
        });

        renderWithProviders(<WikiClient initialFolders={mockFolders} initialPages={mockPages} userRole="Продавец" />);

        const pageLink = screen.getByText('Как создать заказ', { selector: 'span' });
        fireEvent.click(pageLink);

        await waitFor(() => {
            expect(getWikiPageDetail).toHaveBeenCalledWith('p1');
            expect(screen.getByText('Инструкция для новичков')).toBeInTheDocument();
        });
    });

    it('hides edit buttons for restricted roles', async () => {
        vi.mocked(getWikiPageDetail).mockResolvedValue({ success: true, data: mockPages[0] as any });

        renderWithProviders(<WikiClient initialFolders={mockFolders} initialPages={mockPages} userRole="Пользователь" />);

        fireEvent.click(screen.getByText('Как создать заказ', { selector: 'span' }));
        await waitFor(() => expect(screen.getByText('Инструкция для новичков')).toBeInTheDocument());

        expect(screen.queryByLabelText('Редактировать статью')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Удалить статью')).not.toBeInTheDocument();
    });

    it('shows edit buttons for Administrators', async () => {
        vi.mocked(getWikiPageDetail).mockResolvedValue({ success: true, data: mockPages[0] as any });

        renderWithProviders(<WikiClient initialFolders={mockFolders} initialPages={mockPages} userRole="Администратор" />);

        fireEvent.click(screen.getByText('Как создать заказ', { selector: 'span' }));
        await waitFor(() => expect(screen.getByText('Инструкция для новичков')).toBeInTheDocument());

        expect(screen.getByLabelText('Редактировать статью')).toBeInTheDocument();
        expect(screen.getByLabelText('Удалить статью')).toBeInTheDocument();
    });
});
