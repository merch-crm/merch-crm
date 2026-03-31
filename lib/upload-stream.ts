/**
 * Модуль потоковой загрузки файлов
 * Поддерживает chunked upload для больших файлов (макеты, принты)
 */

import { createWriteStream, createReadStream, unlink } from "fs";
import { mkdir, stat } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { Readable } from "stream";

/** Директория для временных файлов */
const TEMP_DIR = join(process.cwd(), "local-storage", "temp");

/** Максимальный размер чанка (5MB) */
const MAX_CHUNK_SIZE = 5 * 1024 * 1024;

/** Время жизни незавершённой загрузки (2 часа) */
const UPLOAD_TTL_MS = 2 * 60 * 60 * 1000;

interface UploadSession {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  chunksReceived: number;
  totalChunks: number;
  tempPath: string;
  createdAt: Date;
  lastChunkAt: Date;
}

/** Хранилище активных сессий загрузки (в production рекомендуется Redis) */
const uploadSessions = new Map<string, UploadSession>();

/**
 * Инициализирует новую сессию загрузки
 */
export async function initUpload(params: {
  fileName: string;
  fileSize: number;
  mimeType: string;
}): Promise<{ uploadId: string; chunkSize: number; totalChunks: number }> {
  const { fileName, fileSize, mimeType } = params;

  // Создаём директорию если не существует
  await mkdir(TEMP_DIR, { recursive: true });

  const uploadId = randomUUID();
  const totalChunks = Math.ceil(fileSize / MAX_CHUNK_SIZE);
  const tempPath = join(TEMP_DIR, `${uploadId}.tmp`);

  const session: UploadSession = {
    id: uploadId,
    fileName,
    fileSize,
    mimeType,
    chunksReceived: 0,
    totalChunks,
    tempPath,
    createdAt: new Date(),
    lastChunkAt: new Date(),
  };

  uploadSessions.set(uploadId, session);

  // Очистка старых сессий
  cleanupStaleSessions();

  return {
    uploadId,
    chunkSize: MAX_CHUNK_SIZE,
    totalChunks,
  };
}

/**
 * Загружает один чанк файла
 */
export async function uploadChunk(params: {
  uploadId: string;
  chunkIndex: number;
  data: Buffer;
}): Promise<{ received: number; total: number; complete: boolean }> {
  const { uploadId, chunkIndex, data } = params;

  const session = uploadSessions.get(uploadId);
  if (!session) {
    throw new Error("Сессия загрузки не найдена или истекла");
  }

  // Проверяем наличие данных
  if (!data) {
    throw new Error("Чанк не может быть пустым");
  }
  
  // Проверяем размер чанка
  if (data.length > MAX_CHUNK_SIZE) {
    throw new Error(`Чанк превышает максимальный размер (${MAX_CHUNK_SIZE} байт)`);
  }

  // Проверяем порядок чанков (строгий порядок для простоты реализации на FS)
  if (chunkIndex !== session.chunksReceived) {
    throw new Error(`Ожидался чанк ${session.chunksReceived}, получен ${chunkIndex}`);
  }

  // Записываем чанк в файл (append mode)
  await new Promise<void>((resolve, reject) => {
    const writeStream = createWriteStream(session.tempPath, { flags: "a" });
    writeStream.write(data, (err) => {
      if (err) reject(err);
      else resolve();
    });
    writeStream.end();
  });

  // Обновляем сессию
  session.chunksReceived++;
  session.lastChunkAt = new Date();

  const complete = session.chunksReceived === session.totalChunks;

  return {
    received: session.chunksReceived,
    total: session.totalChunks,
    complete,
  };
}

/**
 * Завершает загрузку и возвращает путь к файлу
 */
export async function completeUpload(uploadId: string): Promise<{
  tempPath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}> {
  const session = uploadSessions.get(uploadId);
  if (!session) {
    throw new Error("Сессия загрузки не найдена");
  }

  if (session.chunksReceived !== session.totalChunks) {
    throw new Error(
      `Загрузка не завершена: ${session.chunksReceived}/${session.totalChunks} чанков`
    );
  }

  // Проверяем размер файла
  const stats = await stat(session.tempPath);
  if (stats.size !== session.fileSize) {
    throw new Error(
      `Размер файла не совпадает: ожидалось ${session.fileSize}, получено ${stats.size}`
    );
  }

  // Удаляем сессию (файл остаётся для дальнейшей обработки)
  uploadSessions.delete(uploadId);

  return {
    tempPath: session.tempPath,
    fileName: session.fileName,
    fileSize: session.fileSize,
    mimeType: session.mimeType,
  };
}

/**
 * Отменяет загрузку и удаляет временный файл
 */
export async function cancelUpload(uploadId: string): Promise<void> {
  const session = uploadSessions.get(uploadId);
  if (!session) return;

  // Удаляем временный файл
  try {
    await new Promise<void>((resolve) => unlink(session.tempPath, () => resolve()));
  } catch {
    // Файл может не существовать — игнорируем
  }

  uploadSessions.delete(uploadId);
}

/**
 * Получает статус загрузки
 */
export function getUploadStatus(uploadId: string): {
  exists: boolean;
  progress?: number;
  chunksReceived?: number;
  totalChunks?: number;
} {
  const session = uploadSessions.get(uploadId);
  if (!session) {
    return { exists: false };
  }

  return {
    exists: true,
    progress: Math.round((session.chunksReceived / session.totalChunks) * 100),
    chunksReceived: session.chunksReceived,
    totalChunks: session.totalChunks,
  };
}

/**
 * Создаёт читаемый поток из временного файла
 */
export function createUploadReadStream(tempPath: string): Readable {
  return createReadStream(tempPath);
}

/**
 * Удаляет временный файл после обработки
 */
export async function cleanupTempFile(tempPath: string): Promise<void> {
  try {
    await new Promise<void>((resolve) => unlink(tempPath, () => resolve()));
  } catch {
    // Игнорируем ошибки удаления
  }
}

/**
 * Очищает устаревшие сессии загрузки
 */
function cleanupStaleSessions(): void {
  const now = Date.now();

  for (const [uploadId, session] of uploadSessions) {
    const age = now - session.lastChunkAt.getTime();
    if (age > UPLOAD_TTL_MS) {
      void cancelUpload(uploadId);
    }
  }
}

// Периодическая очистка каждые 10 минут
if (typeof setInterval !== "undefined") {
  setInterval(cleanupStaleSessions, 10 * 60 * 1000);
}
