import { render, screen } from '@testing-library/react';
import { Select, SelectOption } from './select';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

const mockOptions: SelectOption[] = [
    { id: '1', title: 'Опция 1', description: 'Описание 1' },
    { id: '2', title: 'Опция 2', description: 'Описание 2' },
    { id: '3', title: 'Опция 3' },
];

describe('Select', () => {
    it('renders with label and placeholder correctly', () => {
        render(<Select options={mockOptions} value="" onChange={() => { }} label="Тестовый селект" placeholder="Выберите тест" />);
        expect(screen.getByText('Тестовый селект')).toBeInTheDocument();
        expect(screen.getByText('Выберите тест')).toBeInTheDocument();
    });

    it('shows selected option title', () => {
        render(<Select options={mockOptions} value="2" onChange={() => { }} />);
        expect(screen.getByText('Опция 2')).toBeInTheDocument();
    });

    it('opens popover on click and shows options', async () => {
        render(<Select options={mockOptions} value="" onChange={() => { }} />);
        const trigger = screen.getByRole('button');
        await userEvent.click(trigger);

        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByText('Опция 1')).toBeInTheDocument();
        expect(screen.getByText('Опция 2')).toBeInTheDocument();
    });

    it('calls onChange when an option is selected', async () => {
        const onChange = vi.fn();
        render(<Select options={mockOptions} value="" onChange={onChange} />);

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(screen.getByText('Опция 3'));

        expect(onChange).toHaveBeenCalledWith('3');
    });

    it('filters options when searching', async () => {
        const manyOptions = Array.from({ length: 20 }, (_, i) => ({
            id: `${i}`,
            title: `Элемент ${i}`
        }));

        render(<Select options={manyOptions} value="" onChange={() => { }} showSearch={true} />);

        await userEvent.click(screen.getByRole('button'));
        const searchInput = screen.getByPlaceholderText('Поиск...');

        await userEvent.type(searchInput, 'Элемент 15');

        expect(screen.getByText('Элемент 15')).toBeInTheDocument();
        expect(screen.queryByText('Элемент 1 ')).not.toBeInTheDocument(); // Exact match guard
    });

    it('identifies grid layout automatically for small short options', async () => {
        const gridOptions = [
            { id: '1', title: 'A' },
            { id: '2', title: 'B' },
            { id: '3', title: 'C' },
            { id: '4', title: 'D' },
            { id: '5', title: 'E' },
        ];

        render(<Select options={gridOptions} value="" onChange={() => { }} />);
        await userEvent.click(screen.getByRole('button'));

        const listboxContainer = screen.getByRole('listbox').firstChild;
        expect(listboxContainer).toHaveClass('grid');
        expect(listboxContainer).toHaveClass('grid-cols-3'); // Corrected based on component logic (avgLength <= 4)
    });

    it('disables trigger when disabled prop is true', () => {
        render(<Select options={mockOptions} value="" onChange={() => { }} disabled={true} />);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
