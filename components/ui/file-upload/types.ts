export interface UploadedFile {
    id: string;
    file: File;
    progress: number;
    status: "pending" | "uploading" | "success" | "error";
    error?: string;
    preview?: string;
}

export interface FileUploadProps {
    value?: File[];
    onChange?: (files: File[]) => void;
    onUpload?: (file: File) => Promise<void>;
    accept?: string;
    maxFiles?: number;
    maxSize?: number; // в байтах
    multiple?: boolean;
    disabled?: boolean;
    label?: string;
    description?: string;
    className?: string;
}

export interface FileItemProps {
    uploadedFile: UploadedFile;
    onRemove: () => void;
}

export interface ImageUploadProps {
    value?: string;
    onChange?: (file: File | null) => void;
    onUpload?: (file: File) => Promise<string>;
    accept?: string;
    maxSize?: number;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export interface ImageGalleryUploadProps {
    value?: string[];
    onChange?: (files: File[]) => void;
    onUpload?: (file: File) => Promise<string>;
    maxFiles?: number;
    maxSize?: number;
    disabled?: boolean;
    className?: string;
}

export interface GalleryItem {
    id: string;
    url: string;
    file?: File;
}
