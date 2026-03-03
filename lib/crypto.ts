import crypto from "crypto";

const ENCRYPTION_KEY = process.env.XIAOMI_ENCRYPTION_KEY || "";
const ENCRYPTION_IV_LENGTH = 16;

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) throw new Error("XIAOMI_ENCRYPTION_KEY не настроен");
    if (ENCRYPTION_KEY.length !== 64) throw new Error("XIAOMI_ENCRYPTION_KEY должен быть 32-битным hex-ключом (64 символа)");

    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
    if (!ENCRYPTION_KEY) throw new Error("XIAOMI_ENCRYPTION_KEY не настроен");
    if (ENCRYPTION_KEY.length !== 64) throw new Error("XIAOMI_ENCRYPTION_KEY должен быть 32-битным hex-ключом (64 символа)");

    const parts = text.split(":");
    if (parts.length < 2) throw new Error("Некорректный формат зашифрованной строки");

    const iv = Buffer.from(parts.shift()!, "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
