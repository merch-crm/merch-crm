import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanbanBoard } from './kanban-board';
import { updateTask } from './actions';
import { playSound } from '@/lib/sounds';
import { SheetStackProvider } from '@/components/ui/sheet-stack-context';
import { createMockTask } from '@/tests/helpers/mocks';

vi.mock('./actions', () => ({ updateTask: vi.fn() }));
vi.mock('@/lib/sounds', () => ({ playSound: vi.fn() }));
vi.mock('./task-details-dialog', () => ({
    TaskDetailsDialog: ({ task, onClose }: { task: { title: string }; onClose: () => void }) => (
        <div data-testid="task-dialog">
            {task.title}
            <button onClick={onClose}>Close</button>
        </div>
    )
}));

// Mocks
// ... (keep existing mocks)

const mockTasks = [
    createMockTask({
        id: 'task1',
        title: 'Тестовая задача 1',
        status: 'new',
        priority: 'high',
        type: 'other',
        assignedToUser: { name: 'Иван' },
        dueDate: new Date().toISOString(),
        createdAt: new Date(),
    }),
    createMockTask({
        id: 'task2',
        title: 'Задача в работе',
        status: 'in_progress',
        priority: 'normal',
        assignedToDepartment: { name: 'Дизайн' },
        createdAt: new Date(),
    })
];

describe('KanbanBoard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders columns and tasks correctly', () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} currentUserId="user1" />
            </SheetStackProvider>
        );

        expect(screen.getByText('Новые')).toBeInTheDocument();
        expect(screen.getByText('В работе')).toBeInTheDocument();

        expect(screen.getByText('Тестовая задача 1')).toBeInTheDocument();
        expect(screen.getByText('Задача в работе')).toBeInTheDocument();
    });

    it('opens task details dialog when a task card is clicked', async () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} currentUserId="user1" />
            </SheetStackProvider>
        );

        fireEvent.click(screen.getByText('Тестовая задача 1'));
        await waitFor(() => {
            expect(screen.getByTestId('task-dialog')).toBeInTheDocument();
        });
        expect(screen.getAllByText('Тестовая задача 1').length).toBeGreaterThanOrEqual(2);
    });

    it('handles drag and drop correctly', async () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} currentUserId="user1" />
            </SheetStackProvider>
        );

        const taskCard = screen.getByText('Тестовая задача 1').closest('div[draggable="true"]')!;
        const inProgressColumn = screen.getByTestId('column-in_progress');

        // Mock dataTransfer
        const dataTransfer = {
            setData: vi.fn(),
            getData: (key: string) => (key === 'taskId' ? 'task1' : ''),
            effectAllowed: '',
            dropEffect: ''
        };

        // Firing events
        fireEvent.dragStart(taskCard, { dataTransfer });
        expect(dataTransfer.setData).toHaveBeenCalledWith('taskId', 'task1');

        fireEvent.dragOver(inProgressColumn, { dataTransfer });
        fireEvent.drop(inProgressColumn, { dataTransfer });

        await waitFor(() => {
            expect(updateTask).toHaveBeenCalledWith('task1', { status: 'in_progress' });
        });
    });

    it('plays sound when dropping a task to "done"', async () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} currentUserId="user1" />
            </SheetStackProvider>
        );

        const taskCard = screen.getByText('Тестовая задача 1').closest('div[draggable="true"]')!;
        const doneColumn = screen.getByTestId('column-done');

        const dataTransfer = {
            setData: vi.fn(),
            getData: (key: string) => (key === 'taskId' ? 'task1' : ''),
            effectAllowed: '',
            dropEffect: ''
        };

        fireEvent.dragStart(taskCard, { dataTransfer });
        fireEvent.drop(doneColumn, { dataTransfer });

        expect(playSound).toHaveBeenCalledWith('task_completed');
        expect(updateTask).toHaveBeenCalledWith('task1', { status: 'done' });
    });

    it('shows priority pill and type badge', () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} currentUserId="user1" />
            </SheetStackProvider>
        );

        expect(screen.getAllByText(/other/i).length).toBeGreaterThanOrEqual(1);
        // Priority line check - use regex or exact localized text
        const indicator = screen.getByTitle(/высокий/i);
        expect(indicator).toHaveClass('bg-rose-500');
    });
});
