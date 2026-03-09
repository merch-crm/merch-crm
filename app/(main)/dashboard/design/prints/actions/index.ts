"use server";

export * from"./collection-actions";
export * from"./design-actions";
export * from"./version-actions";
export * from"./file-actions";

// Алиасы для обратной совместимости
export {
 createDesignVersion as createVersion,
 updateDesignVersion as updateVersion,
 deleteDesignVersion as deleteVersion
} from"./version-actions";

export {
 deleteDesignFile as deleteFile
} from"./file-actions";
