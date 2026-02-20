/**
 * Sanitizes a string for use as a filename or directory name.
 * Safe for both client and server.
 */
export function sanitizeFileName(name: string): string {
    return (name || "")
        .replace(/[^a-zA-Z0-9а-яА-ЯёЁ0-9 \-\.]/g, "_")
        .trim();
}

/**
 * Returns the storage path for an item.
 */
export function getStoragePathForItem(itemId: string): string {
    return `items/${itemId}`;
}
