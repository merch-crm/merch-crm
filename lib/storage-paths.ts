import path from 'path';

const UPLOADS_BASE = process.env.UPLOADS_PATH || './uploads';

export const storagePaths = {
    /**
     * Путь к папке заказа: /uploads/orders/{год}/{месяц}/{orderId}/
     */
    getOrderPath: (orderId: string, date: Date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return path.join(UPLOADS_BASE, 'orders', String(year), month, orderId);
    },

    /**
     * Имя файла заказа
     * @param orderNumber - номер заказа (например, ORD-12345)
     * @param type - тип файла: original, mockup, print
     * @param index - индекс файла (для нескольких файлов одного типа)
     * @param ext - расширение файла
     */
    getOrderFileName: (
        orderNumber: string,
        type: 'original' | 'mockup' | 'print',
        index: number,
        ext: string
    ) => {
        const cleanNumber = orderNumber.replace(/[^a-zA-Z0-9-]/g, '');
        return `${cleanNumber}-${type}-${index}.${ext}`;
    },

    /**
     * Путь к папке коллекции: /uploads/collections/{collectionSlug}/
     */
    getCollectionPath: (collectionSlug: string) => {
        return path.join(UPLOADS_BASE, 'collections', collectionSlug);
    },

    /**
     * Путь к системным шрифтам: /uploads/system/fonts/
     */
    getFontsPath: () => {
        return path.join(UPLOADS_BASE, 'system', 'fonts');
    },

    /**
     * Путь к брендингу клиента: /uploads/clients/{clientId}/branding/
     */
    getClientBrandingPath: (clientId: string) => {
        return path.join(UPLOADS_BASE, 'clients', clientId, 'branding');
    },

    /**
     * Путь к макапам версий: /uploads/mockup-versions/{orderId}/
     */
    getMockupVersionsPath: (orderId: string) => {
        return path.join(UPLOADS_BASE, 'mockup-versions', orderId);
    },

    /**
     * Базовый путь uploads
     */
    getBasePath: () => UPLOADS_BASE,
};

/**
 * Допустимые расширения для разных типов файлов
 */
export const allowedExtensions = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    print: ['psd', 'tiff', 'tif', 'ai', 'eps', 'pdf', 'png'],
    font: ['ttf', 'otf', 'woff', 'woff2'],
    document: ['pdf', 'doc', 'docx'],
};

/**
 * Максимальные размеры файлов (в байтах)
 */
export const maxFileSizes = {
    image: 50 * 1024 * 1024, // 50MB
    print: 500 * 1024 * 1024, // 500MB
    font: 10 * 1024 * 1024, // 10MB
    document: 50 * 1024 * 1024, // 50MB
};

/**
 * Проверка расширения файла
 */
export const isAllowedExtension = (
    filename: string,
    type: keyof typeof allowedExtensions
): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return allowedExtensions[type].includes(ext);
};

/**
 * Получение расширения из имени файла
 */
export const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};
