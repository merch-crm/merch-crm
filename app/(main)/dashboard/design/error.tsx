'use client'

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function DesignError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Design] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки макетов"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
