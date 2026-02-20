'use client'

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function ProductionError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Production] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки производства"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
