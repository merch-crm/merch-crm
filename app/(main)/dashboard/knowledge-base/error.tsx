'use client'

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function KnowledgeBaseError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[KnowledgeBase] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки базы знаний"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
