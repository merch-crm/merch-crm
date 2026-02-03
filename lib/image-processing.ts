/**
 * Compresses an image file using canvas and returns a new File object.
 * Targets a specific max size (default 1MB) and handles aspect ratio.
 */
export async function compressImage(
    file: File,
    options: {
        maxWidth?: number,
        maxHeight?: number,
        maxSizeMB?: number,
        type?: string
    } = {}
): Promise<{ file: File; preview: string }> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        maxSizeMB = 0.7,
        type = "image/jpeg"
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate dimensions
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                const compress = () => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.1) {
                                    quality -= 0.1;
                                    compress();
                                } else {
                                    let extension = ".jpg";
                                    if (type === "image/webp") extension = ".webp";
                                    else if (type === "image/png") extension = ".png";

                                    const processedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + extension, { type });
                                    resolve({
                                        file: processedFile,
                                        preview: URL.createObjectURL(blob)
                                    });
                                }
                            } else {
                                reject(new Error("Canvas toBlob failed"));
                            }
                        },
                        type,
                        quality
                    );
                };
                compress();
            };
            img.onerror = () => reject(new Error("Image load failed"));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(file);
    });
}
