import { render, screen } from '@testing-library/react';
import { SubmitButton } from './submit-button';
import { describe, it, expect, vi } from 'vitest';

// Mock useFormStatus from react-dom
vi.mock('react-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-dom')>();
    return {
        ...actual,
        useFormStatus: vi.fn(() => ({ pending: false })),
    };
});

import { useFormStatus } from 'react-dom';

describe('SubmitButton', () => {
    it('renders with children correctly', () => {
        render(<SubmitButton>Сохранить</SubmitButton>);
        expect(screen.getByText('Сохранить')).toBeInTheDocument();
    });

    it('renders with text prop correctly', () => {
        render(<SubmitButton text="Отправить" />);
        expect(screen.getByText('Отправить')).toBeInTheDocument();
    });

    it('shows loading state when isLoading prop is true', () => {
        render(<SubmitButton isLoading={true}>Сохранить</SubmitButton>);
        expect(screen.getByRole('button')).toBeDisabled();
        // Check for loader icon (lucide-react Loader2 has class animate-spin in our implementation)
        const loader = screen.getByRole('button').querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
    });

    it('shows loadingText when in loading state', () => {
        render(<SubmitButton isLoading={true} text="Сохранить" loadingText="Загрузка..." />);
        expect(screen.getByText('Загрузка...')).toBeInTheDocument();
        expect(screen.queryByText('Сохранить')).not.toBeInTheDocument();
    });

    it('shows pending state from useFormStatus', () => {
        vi.mocked(useFormStatus).mockReturnValue({ pending: true } as any);
        render(<SubmitButton>Сохранить</SubmitButton>);
        expect(screen.getByRole('button')).toBeDisabled();
        const loader = screen.getByRole('button').querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<SubmitButton disabled={true}>Сохранить</SubmitButton>);
        expect(screen.getByRole('button')).toBeDisabled();
    });
});
