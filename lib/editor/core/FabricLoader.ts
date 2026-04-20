/**
 * FabricLoader - helper for lazy loading the heavy Fabric.js library
 */

let fabricInstance: typeof import("fabric") | null = null;

/**
 * Dynamically imports Fabric.js and returns the library instance.
 * Ensures the library is only loaded once.
 */
export async function loadFabric(): Promise<typeof import("fabric")> {
    if (fabricInstance) return fabricInstance;

    try {
        // Dynamic import triggers separate chunk creation in Next.js/Webpack
        const fabric = await import("fabric");
        fabricInstance = fabric;
        return fabric;
    } catch (error) {
        console.error("Failed to load Fabric.js:", error);
        throw new Error("Could not load graphics editor library");
    }
}

/**
 * Synchronous check for fabric instance (use only if you are sure it is loaded)
 */
export function getFabric(): typeof import("fabric") {
    if (!fabricInstance) {
        throw new Error("Fabric.js is not loaded yet. Call loadFabric() first.");
    }
    return fabricInstance;
}
