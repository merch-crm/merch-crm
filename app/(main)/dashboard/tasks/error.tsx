"use client";

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function TasksError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Tasks] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки задач"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
