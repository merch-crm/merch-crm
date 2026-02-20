"use client";

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function ClientsError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Clients] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки клиентов"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
