/**
 * Utility for exporting data to CSV with proper escaping and support for nested objects/arrays.
 */
export function exportToCSV<T>(
    data: T[],
    filename: string,
    columns?: { header: string; key: keyof T | ((item: T) => string | number | boolean | null | undefined | Date) }[]
) {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    const safeData = data as T[];

    let headers: string[] = [];
    let rows: string[][] = [];

    if (columns) {
        // Use provided column definitions
        headers = columns.map(col => col.header);
        rows = safeData.map(item =>
            columns.map(col => {
                const value = typeof col.key === "function" ? col.key(item) : item[col.key];
                return formatCSVValue(value);
            })
        );
    } else {
        // Auto-generate columns from the first object
        const firstItem = (safeData[0] || {}) as Record<string, unknown>;
        headers = Object.keys(firstItem).filter(key => typeof firstItem[key] !== "object" || firstItem[key] === null);
        rows = safeData.map(item =>
            headers.map(header => formatCSVValue((item as Record<string, unknown>)[header]))
        );
    }

    const csvContent = [
        headers.join(","),
        ...(rows || []).map(row => row.join(","))
    ].join("\n");

    // Add BOM for Excel Russian character support
    const blob = new Blob(["\uFEFF", csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatCSVValue(value: unknown): string {
    if (value === null || value === undefined) return "";

    let stringValue = "";
    if (value instanceof Date) {
        stringValue = value.toLocaleString('ru-RU');
    } else {
        stringValue = String(value);
    }

    // Escape quotes and wrap in quotes if contains comma, newline or quotes
    if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n") || stringValue.includes("\r")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}
