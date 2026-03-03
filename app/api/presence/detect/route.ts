import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { presenceLogs, employeeFaces, cameras, workstations } from '@/lib/schema/presence'
import { eq, sql } from 'drizzle-orm'
import { logError } from '@/lib/error-logger'

// Секретный ключ для Python-сервиса
const SERVICE_API_KEY = process.env.PRESENCE_SERVICE_API_KEY || 'presence-secret-key'

export async function POST(request: NextRequest) {
    try {
        // Проверка API ключа
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || authHeader !== `Bearer ${SERVICE_API_KEY}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            camera_id,
            event_type,
            face_encoding,
            confidence,
            snapshot_url,
            timestamp,
            workstation_id,
            face_position
        } = body

        // Валидация
        if (!camera_id || !event_type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Проверяем что камера существует
        const camera = await db.query.cameras.findFirst({
            where: eq(cameras.id, camera_id)
        })

        if (!camera) {
            return NextResponse.json(
                { success: false, error: 'Camera not found' },
                { status: 404 }
            )
        }

        let userId: string | null = null
        let finalEventType = event_type

        // Если есть face_encoding, пытаемся распознать сотрудника
        // Приводим confidenceThreshold к числу, так как в схеме это decimal
        const threshold = camera.confidenceThreshold ? parseFloat(camera.confidenceThreshold as unknown as string) : 0.60

        if (face_encoding && event_type === 'detected') {
            const matchedFace = await findMatchingFace(face_encoding, threshold)
            if (matchedFace) {
                userId = matchedFace.userId
                finalEventType = 'recognized'
            } else {
                finalEventType = 'unknown'
            }
        }

        // Записываем событие
        const [log] = await db.insert(presenceLogs).values({
            userId,
            cameraId: camera_id,
            workstationId: workstation_id,
            eventType: finalEventType,
            confidence: confidence?.toString() || null,
            faceEncoding: face_encoding,
            facePosition: face_position,
            snapshotUrl: snapshot_url,
            timestamp: timestamp ? new Date(timestamp) : new Date()
        }).returning()

        // Обновляем статистику если распознан сотрудник
        if (userId) {
            await updateDailyStats(userId)

            // ОБНОВЛЕНИЕ: Обновляем последнее появление на рабочем месте
            if (workstation_id) {
                await updateWorkstationLastSeen(workstation_id, userId)
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                log_id: log.id,
                user_id: userId,
                event_type: finalEventType,
                recognized: !!userId
            }
        })

    } catch (error) {
        logError({ error: error as Error, path: '/api/presence/detect', method: 'POST' })
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Поиск совпадающего лица по embedding
async function findMatchingFace(encoding: number[], threshold: number) {
    try {
        // Получаем все активные лица
        const faces = await db.query.employeeFaces.findMany({
            where: eq(employeeFaces.isActive, true)
        })

        let bestMatch: { userId: string; distance: number } | null = null

        for (const face of faces) {
            if (!face.faceEncoding) continue

            const storedEncoding = face.faceEncoding as number[]
            const distance = cosineSimilarity(encoding, storedEncoding)

            if (distance >= threshold) {
                if (!bestMatch || distance > bestMatch.distance) {
                    bestMatch = { userId: face.userId, distance }
                }
            }
        }

        return bestMatch
    } catch (error) {
        console.error('Error finding matching face:', error)
        return null
    }
}

// Косинусное сходство для сравнения embeddings
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i]
        normA += a[i] * a[i]
        normB += b[i] * b[i]
    }

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
    return isNaN(similarity) ? 0 : similarity
}

// Обновление ежедневной статистики
async function updateDailyStats(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Используем upsert для создания/обновления записи
    await db.execute(sql`
    INSERT INTO daily_work_stats (id, user_id, date, first_seen_at, last_seen_at, total_sessions, updated_at)
    VALUES (gen_random_uuid(), ${userId}, ${today}, NOW(), NOW(), 1, NOW())
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
      last_seen_at = NOW(),
      total_sessions = daily_work_stats.total_sessions + 1,
      updated_at = NOW()
  `)
}

// ОБНОВЛЕНИЕ: Обновляем статус рабочего места
async function updateWorkstationLastSeen(workstationId: string, userId: string) {
    try {
        await db.update(workstations)
            .set({
                lastSeenUserId: userId,
                lastSeenAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(workstations.id, workstationId))
    } catch (error) {
        console.error('Error updating workstation last seen:', error)
    }
}
