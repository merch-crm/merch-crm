import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KanbanBoard } from './kanban/kanban-board';
import { changeTaskStatus as updateTask } from './actions/task-actions';
import { playSound } from '@/lib/sounds';
import { render, screen, fireEvent } from '@testing-library/react';
import { KanbanBoard } from './kanban/kanban-board';
import { createMockTask } from '@/tests/helpers/mocks';

vi.mock('./actions', () => ({ updateTask: vi.fn() }));
vi.mock('@/lib/sounds', () => ({ playSound: vi.fn() }));
vi.mock('./task-details-dialog', () => ({
    TaskDetailsDialog: ({ task, onClose }: { task: { title: string }; onClose: () => void }) => (
        <div data-testid="task-dialog">
            {task.title}
            <button type="button" onClick={onClose}>Close</button>
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
        assignees: [],
        deadline: new Date().toISOString(),
        createdAt: new Date(),
    }),
    createMockTask({
        id: 'task2',
        title: 'Задача в работе',
        status: 'in_progress',
        priority: 'normal',
        departmentId: 'dept2',
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
                <KanbanBoard tasks={mockTasks} onTaskClick={vi.fn()} onTasksChange={vi.fn()} />
            </SheetStackProvider>
        );

        expect(screen.getByText('Новая')).toBeInTheDocument();
        expect(screen.getByText('Проверка')).toBeInTheDocument(); // Changed from 'В работе'

        expect(screen.getByText('Тестовая задача 1')).toBeInTheDocument();
        expect(screen.getByText('Задача в работе')).toBeInTheDocument();

        const inProgressColumn = screen.getByTestId('column-in_progress');
        expect(inProgressColumn).toBeInTheDocument();
    });

    const onTaskClick = vi.fn();
    it('opens task details dialog when a task card is clicked', async () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} onTaskClick={onTaskClick} onTasksChange={vi.fn()} />
            </SheetStackProvider>
        );

        fireEvent.click(screen.getByText('Тестовая задача 1'));
        expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
    });



    it('shows priority badge', () => {
        render(
            <SheetStackProvider>
                <KanbanBoard tasks={mockTasks} onTaskClick={vi.fn()} onTasksChange={vi.fn()} />
            </SheetStackProvider>
        );

        const badge = screen.getByText(/высокий/i);
        expect(badge).toBeInTheDocument();
    });
});
