export {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    updateCollectionsOrder
} from "./collection-actions";

export {
    getDesignsByCollection,
    getDesignById,
    createDesign,
    updateDesign,
    deleteDesign,
    setDesignPreview,
    updateDesignsOrder,
    getPrintsStats
} from "./design-actions";

export {
    createDesignVersion,
    updateDesignVersion,
    deleteDesignVersion,
    updateVersionsOrder,
    // Алиасы для обратной совместимости
    createDesignVersion as createVersion,
    updateDesignVersion as updateVersion,
    deleteDesignVersion as deleteVersion
} from "./version-actions";

export {
    uploadFile,
    deleteDesignFile,
    getFilesByVersion,
    // Алиасы для обратной совместимости
    deleteDesignFile as deleteFile
} from "./file-actions";
