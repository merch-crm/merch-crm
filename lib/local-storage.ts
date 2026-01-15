import fs from "fs";
import path from "path";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

// Root directory for local storage on production server
const LOCAL_STORAGE_ROOT = path.join(process.cwd(), "local-storage");

// Ensure root directory exists
export async function ensureLocalStorageRoot() {
    if (!fs.existsSync(LOCAL_STORAGE_ROOT)) {
        await mkdir(LOCAL_STORAGE_ROOT, { recursive: true });
    }
}

interface LocalFile {
    name: string;
    path: string;
    size: number;
    isDirectory: boolean;
    lastModified: Date;
}

/**
 * List files and folders in a given prefix (directory)
 */
export async function listLocalFiles(prefix: string = ""): Promise<{ folders: string[]; files: LocalFile[] }> {
    await ensureLocalStorageRoot();

    const fullPath = path.join(LOCAL_STORAGE_ROOT, prefix);

    // Security check: ensure we're not escaping the root
    if (!fullPath.startsWith(LOCAL_STORAGE_ROOT)) {
        throw new Error("Invalid path: attempting to escape root directory");
    }

    try {
        if (!fs.existsSync(fullPath)) {
            return { folders: [], files: [] };
        }

        const entries = await readdir(fullPath);
        const folders: string[] = [];
        const files: LocalFile[] = [];

        for (const entry of entries) {
            const entryPath = path.join(fullPath, entry);
            const stats = await stat(entryPath);
            const relativePath = path.relative(LOCAL_STORAGE_ROOT, entryPath);

            if (stats.isDirectory()) {
                folders.push(relativePath + "/");
            } else {
                files.push({
                    name: entry,
                    path: relativePath,
                    size: stats.size,
                    isDirectory: false,
                    lastModified: stats.mtime
                });
            }
        }

        return { folders, files };
    } catch (error) {
        console.error("Error listing local files:", error);
        return { folders: [], files: [] };
    }
}

/**
 * Create a new folder
 */
export async function createLocalFolder(folderPath: string): Promise<{ success: boolean; error?: string }> {
    await ensureLocalStorageRoot();

    const fullPath = path.join(LOCAL_STORAGE_ROOT, folderPath);

    // Security check
    if (!fullPath.startsWith(LOCAL_STORAGE_ROOT)) {
        return { success: false, error: "Invalid path" };
    }

    try {
        await mkdir(fullPath, { recursive: true });
        return { success: true };
    } catch (error) {
        console.error("Error creating folder:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Delete a file
 */
export async function deleteLocalFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    await ensureLocalStorageRoot();

    const fullPath = path.join(LOCAL_STORAGE_ROOT, filePath);

    // Security check
    if (!fullPath.startsWith(LOCAL_STORAGE_ROOT)) {
        return { success: false, error: "Invalid path" };
    }

    try {
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
            // Check if directory is empty
            const entries = await readdir(fullPath);
            if (entries.length > 0) {
                return { success: false, error: "Папка не пуста. Удалите сначала содержимое." };
            }
            await rmdir(fullPath);
        } else {
            await unlink(fullPath);
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting file:", error);
        return { success: false, error: String(error) };
    }
}

/**
 * Get storage statistics
 */
export async function getLocalStorageStats(): Promise<{ size: number; fileCount: number; folderCount: number }> {
    await ensureLocalStorageRoot();

    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;

    async function scanDirectory(dirPath: string) {
        try {
            const entries = await readdir(dirPath);

            for (const entry of entries) {
                const entryPath = path.join(dirPath, entry);
                const stats = await stat(entryPath);

                if (stats.isDirectory()) {
                    folderCount++;
                    await scanDirectory(entryPath);
                } else {
                    fileCount++;
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            console.error("Error scanning directory:", error);
        }
    }

    await scanDirectory(LOCAL_STORAGE_ROOT);

    return { size: totalSize, fileCount, folderCount };
}

/**
 * Upload/save a file to local storage
 */
export async function saveLocalFile(
    filePath: string,
    buffer: Buffer
): Promise<{ success: boolean; path?: string; error?: string }> {
    await ensureLocalStorageRoot();

    const fullPath = path.join(LOCAL_STORAGE_ROOT, filePath);

    // Security check
    if (!fullPath.startsWith(LOCAL_STORAGE_ROOT)) {
        return { success: false, error: "Invalid path" };
    }

    try {
        // Ensure parent directory exists
        const dir = path.dirname(fullPath);
        await mkdir(dir, { recursive: true });

        // Write file
        await promisify(fs.writeFile)(fullPath, buffer);

        return { success: true, path: filePath };
    } catch (error) {
        console.error("Error saving file:", error);
        return { success: false, error: String(error) };
    }
}

export { LOCAL_STORAGE_ROOT };
