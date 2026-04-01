import crypto from 'crypto'
import { AppError } from './errors'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16

function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET

    if (!key && process.env.NODE_ENV === 'production') {
        throw new AppError('Критическая ошибка безопасности: ENCRYPTION_KEY не установлен в окружении', 'SECURITY_ERROR', 500)
    }

    // Приводим к 32 байтам для AES-256
    return crypto.createHash('sha256').update(key || 'dev-fallback-key-only-for-local').digest()
}

export function encrypt(text: string): string {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Формат: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
    const key = getEncryptionKey()

    const parts = encryptedText.split(':')
    if (parts.length !== 3) {
        // Поддержка старого формата или ошибка
        throw new Error('Invalid encrypted text format')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
}
