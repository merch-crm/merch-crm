import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientFilterPanel, ClientUiState } from './client-filter-panel' // Need to export ClientUiState from component if not already
import { ClientFilters } from "../actions";
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'

// ... (mocks ok)

describe('ClientFilterPanel', () => {
    const defaultFilters: ClientFilters = {
        page: 1,
        limit: 50,
        search: '',
        sortBy: 'alphabet',
        period: 'all',
        orderCount: 'any',
        region: 'all',
        status: 'all',
        showArchived: false,
    }

    const defaultUiState: ClientUiState = {
        showFilters: false,
        showHistory: false,
        showManagerSelect: false,
        showDeleteConfirm: false,
        isBulkUpdating: false,
        searchHistory: [],
    }

    let setFiltersMock: Mock<(filters: ClientFilters | ((prev: ClientFilters) => ClientFilters)) => void>
    let setUiStateMock: Mock<(uiState: ClientUiState | ((prev: ClientUiState) => ClientUiState)) => void>
    let onAddToHistoryMock: Mock<(query: string) => void>

    beforeEach(() => {
        setFiltersMock = vi.fn()
        setUiStateMock = vi.fn()
        onAddToHistoryMock = vi.fn()
    })

    const renderPanel = (overrides: {
        filters?: Partial<ClientFilters>;
        uiState?: Partial<ClientUiState>;
        setFilters?: typeof setFiltersMock;
        setUiState?: typeof setUiStateMock;
        regions?: string[];
        onAddToHistory?: typeof onAddToHistoryMock;
    } = {}) => {
        return render(
            <ClientFilterPanel
                filters={{ ...defaultFilters, ...overrides.filters }}
                setFilters={(overrides.setFilters ?? setFiltersMock) as any}
                uiState={{ ...defaultUiState, ...overrides.uiState }}
                setUiState={(overrides.setUiState ?? setUiStateMock) as any}
                regions={overrides.regions ?? []}
                onAddToHistory={(overrides.onAddToHistory ?? onAddToHistoryMock) as any}
            />
        )
    }

    // ─── Поиск ─────────────────────────────────────────────

    it('поиск клиента: ввод текста вызывает setFilters на каждую букву', async () => {
        const user = userEvent.setup()
        renderPanel()

        const input = screen.getByPlaceholderText('Поиск клиентов...')
        await user.type(input, 'Иванов')

        expect(setFiltersMock).toHaveBeenCalledTimes(6)
    })

    it('поиск клиента: Enter добавляет запрос в историю', async () => {
        const user = userEvent.setup()
        renderPanel({ filters: { search: 'Тест' } })

        const input = screen.getByPlaceholderText('Поиск клиентов...')
        await user.type(input, '{Enter}')

        expect(onAddToHistoryMock).toHaveBeenCalledWith('Тест')
    })

    it('поиск клиента: фокус на поле открывает историю', async () => {
        const user = userEvent.setup()
        renderPanel()

        const input = screen.getByPlaceholderText('Поиск клиентов...')
        await user.click(input)

        expect(setUiStateMock).toHaveBeenCalled()
    })

    // ─── Кнопка «Фильтры» ─────────────────────────────────

    it('кнопка «Фильтры» переключает панель', async () => {
        const user = userEvent.setup()
        renderPanel()

        const btn = screen.getByRole('button', { name: /фильтры/i })
        await user.click(btn)

        expect(setUiStateMock).toHaveBeenCalled()
    })

    // ─── Фильтры (selects) ────────────────────────────────

    it('выбор фильтра «Статус» вызывает setFilters', async () => {
        const user = userEvent.setup()
        renderPanel({ uiState: { showFilters: true } })

        const selects = screen.getAllByTestId('select')
        // Порядок: Период, Кол-во заказов, Регион, Статус
        const statusSelect = selects[3]

        await user.selectOptions(statusSelect, 'lost')

        expect(setFiltersMock).toHaveBeenCalled()
    })

    it('выбор фильтра «Период» вызывает setFilters', async () => {
        const user = userEvent.setup()
        renderPanel({ uiState: { showFilters: true } })

        const selects = screen.getAllByTestId('select')
        const periodSelect = selects[0]

        await user.selectOptions(periodSelect, 'month')

        expect(setFiltersMock).toHaveBeenCalled()
    })

    it('выбор фильтра «Регион» с доступными городами', async () => {
        const user = userEvent.setup()
        renderPanel({
            uiState: { showFilters: true },
            regions: ['Москва', 'Санкт-Петербург'],
        })

        const selects = screen.getAllByTestId('select')
        const regionSelect = selects[2]

        // Проверяем что города отрендерились
        const options = within(regionSelect).getAllByRole('option')
        expect(options.length).toBe(3) // «Все города» + 2 региона

        await user.selectOptions(regionSelect, 'Москва')
        expect(setFiltersMock).toHaveBeenCalled()
    })

    // ─── Сброс фильтров ──────────────────────────────────

    it('кнопка «Сбросить фильтры» вызывает setFilters с начальными значениями', async () => {
        const user = userEvent.setup()
        renderPanel({
            uiState: { showFilters: true },
            filters: { period: 'month', status: 'lost' },
        })

        const resetBtn = screen.getByRole('button', { name: /сбросить фильтры/i })
        await user.click(resetBtn)

        expect(setFiltersMock).toHaveBeenCalledWith({
            search: '',
            sortBy: 'alphabet',
            period: 'all',
            orderCount: 'any',
            region: 'all',
            status: 'all',
            showArchived: false,
        })
    })

    // ─── Чипы активных фильтров ──────────────────────────

    it('активный фильтр «Период» показывает чип с кнопкой удаления', async () => {
        const user = userEvent.setup()
        renderPanel({ filters: { period: 'month' } })

        const chip = screen.getByText(/период/i)
        expect(chip).toBeInTheDocument()

        // Нажимаем X на чипе
        const chipContainer = chip.closest('div')!
        const removeBtn = within(chipContainer).getByRole('button')
        await user.click(removeBtn)

        expect(setFiltersMock).toHaveBeenCalled()
    })

    it('чип «Архив» отображается при showArchived: true', () => {
        renderPanel({ filters: { showArchived: true } })

        expect(screen.getByText('Архив')).toBeInTheDocument()
    })

    // ─── Переключатель «Показать архив» ──────────────────

    it('переключатель «Показать архив» вызывает setFilters', async () => {
        const user = userEvent.setup()
        renderPanel({ uiState: { showFilters: true } })

        const toggle = screen.getByText('Показать архив')
        await user.click(toggle)

        expect(setFiltersMock).toHaveBeenCalled()
    })

    // ─── История поиска ──────────────────────────────────

    it('история поиска: клик по элементу истории заполняет поиск', async () => {
        const user = userEvent.setup()
        renderPanel({
            uiState: { showHistory: true, searchHistory: ['Петров', 'Сидоров'] },
        })

        const historyItem = screen.getByText('Петров')
        await user.click(historyItem)

        expect(setFiltersMock).toHaveBeenCalled()
        expect(setUiStateMock).toHaveBeenCalled()
    })

    it('история поиска: кнопка «Очистить» очищает историю', async () => {
        const user = userEvent.setup()
        renderPanel({
            uiState: { showHistory: true, searchHistory: ['Петров'] },
        })

        const clearBtn = screen.getByRole('button', { name: /очистить/i })
        await user.click(clearBtn)

        expect(setUiStateMock).toHaveBeenCalled()
    })
})
