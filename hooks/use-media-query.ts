import * as React from "react"

export function useMediaQuery(query: string) {
    const [value, setValue] = React.useState<boolean | null>(null)

    React.useEffect(() => {
        const result = window.matchMedia(query)
        setValue(result.matches)

        function onChange(event: MediaQueryListEvent) {
            setValue(event.matches)
        }

        result.addEventListener("change", onChange)
        return () => result.removeEventListener("change", onChange)
    }, [query])

    return value
}
