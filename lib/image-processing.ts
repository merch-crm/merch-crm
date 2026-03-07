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
        type = "image/webp"
    } = options;

    let objectUrl = "";

    // HEIC decoding block
    if (file.name.toLowerCase().endsWith(".heic") || file.type === "image/heic") {
        console.log(`[ImageProcessing] HEIC detected: ${file.name}. Decoding...`);
        try {
            // Dynamic import
            const heicDecode = (await import("heic-decode")).default;
            const arrayBuffer = await file.arrayBuffer();

            const { width, height, data } = await heicDecode({ buffer: arrayBuffer });

            // Create an intermediate canvas to hold the full-size HEIC image
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = width;
            tempCanvas.height = height;
            const ctx = tempCanvas.getContext("2d");

            if (!ctx) throw new Error("Could not get temp canvas context for HEIC");

            const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
            ctx.putImageData(imageData, 0, 0);

            // Convert to a blob objectUrl directly
            const blobUrl = await new Promise<string>((res, rej) => {
                tempCanvas.toBlob((b) => {
                    if (b) res(URL.createObjectURL(b));
                    else rej(new Error("HEIC canvas toblob failed"));
                }, "image/jpeg", 0.9);
            });
            objectUrl = blobUrl;
            console.log(`[ImageProcessing] HEIC decoded successfully, temp size: ${width}x${height}`);
        } catch (err) {
            console.error("[ImageProcessing] HEIC decode failed:", err);
            // Fallback objectUrl creation
            objectUrl = URL.createObjectURL(file);
        }
    } else {
        objectUrl = URL.createObjectURL(file);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
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

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Image load failed for file: ${file.name} (${file.type}, ${file.size} bytes)`));
        };

        img.src = objectUrl;
    });
}
