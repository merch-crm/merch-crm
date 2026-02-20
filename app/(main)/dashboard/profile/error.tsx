'use client'

import { useEffect } from 'react'
import { ErrorView } from "@/components/ui/error-view"

export default function ProfileError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('[Profile] Error:', error.message)
    }, [error])

    return (
        <ErrorView
            title="Ошибка загрузки профиля"
            message={error.message || "Произошла непредвиденная ошибка"}
            onReset={() => reset()}
        />
    )
}
