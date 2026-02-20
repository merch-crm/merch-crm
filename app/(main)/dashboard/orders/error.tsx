"use client";

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function OrdersError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Orders] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки заказов"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
