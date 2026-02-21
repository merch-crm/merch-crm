import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import fs from 'fs'

interface FailedTest {
    title: string
    file: string
    error: string
    suggestion: string
}

class FixPlanReporter implements Reporter {
    private failures: FailedTest[] = []

    onTestEnd(test: TestCase, result: TestResult) {
        if (result.status === 'failed') {
            this.failures.push({
                title: test.title,
                file: test.location.file,
                error: result.errors[0]?.message || 'Неизвестная ошибка',
                suggestion: this.getSuggestion(result.errors[0]?.message || ''),
            })
        }
    }

    private getSuggestion(error: string): string {
        if (error.includes('locator.click')) {
            return 'Элемент не найден или не кликабелен. Проверь селектор или добавь ожидание.'
        }
        if (error.includes('toBeVisible')) {
            return 'Элемент не отображается. Проверь условия рендеринга или роутинг.'
        }
        if (error.includes('toHaveURL')) {
            return 'Редирект не сработал. Проверь логику навигации или авторизацию.'
        }
        if (error.includes('toHaveScreenshot')) {
            return 'Визуальные различия. Обнови скриншот или исправь вёрстку.'
        }
        if (error.includes('timeout')) {
            return 'Таймаут. Страница грузится долго или элемент не появляется.'
        }
        return 'Требуется ручной анализ ошибки.'
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async onEnd(result: FullResult) {
        if (this.failures.length === 0) {
            console.log('\n✅ Все тесты прошли успешно!\n')
            return
        }

        const plan = this.generatePlan()

        // Сохраняем в файл
        fs.writeFileSync('test-fix-plan.md', plan)

        // Выводим в консоль
        console.log(plan)
    }

    private generatePlan(): string {
        const date = new Date().toLocaleDateString('ru-RU')

        let md = `# План исправлений после тестирования\n\n`
        md += `**Дата:** ${date}\n`
        md += `**Упавших тестов:** ${this.failures.length}\n\n`
        md += `---\n\n`

        this.failures.forEach((fail, index) => {
            md += `## ${index + 1}. ${fail.title}\n\n`
            md += `**Файл:** \`${fail.file}\`\n\n`
            md += `**Ошибка:**\n\`\`\`\n${fail.error.slice(0, 500)}\n\`\`\`\n\n`
            md += `**Рекомендация:** ${fail.suggestion}\n\n`
            md += `- [ ] Исправить\n- [ ] Проверить повторно\n\n`
            md += `---\n\n`
        })

        return md
    }
}

export default FixPlanReporter
