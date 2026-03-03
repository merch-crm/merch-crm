import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { logError } from '@/lib/error-logger'

const SERVICE_API_KEY = process.env.PRESENCE_SERVICE_API_KEY || 'presence-secret-key'

export async function GET(request: NextRequest) {
    try {
        // Проверка авторизации: сессия ИЛИ API ключ
        const session = await getSession()
        const authHeader = request.headers.get('Authorization')
        const isServiceAuth = authHeader === `Bearer ${SERVICE_API_KEY}`

        if (!session && !isServiceAuth) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const allCameras = await db.query.cameras.findMany({
            limit: 1000,
            where: (cameras, { eq }) => eq(cameras.isEnabled, true),
            with: {
                xiaomiAccount: {
                    columns: {
                        email: true,
                        nickname: true
                    }
                }
            },
            orderBy: (cameras, { asc }) => [asc(cameras.name)]
        })

        // Проверяем статус каждой камеры через go2rtc
        const go2rtcUrl = process.env.GO2RTC_URL || 'http://localhost:1984'

        const camerasWithStatus = await Promise.all(
            allCameras.map(async (camera) => {
                let isStreaming = false

                // В go2rtc стрим всегда имеет префикс xiaomi_
                const streamName = `xiaomi_${camera.deviceId}`

                try {
                    const response = await fetch(`${go2rtcUrl}/api/streams`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(3000)
                    })
                    if (response.ok) {
                        const streams = await response.json()
                        // Проверяем наличие продьюсеров (активного потока)
                        isStreaming = !!(streams[streamName]?.producers?.length > 0)
                    }
                } catch {
                    // Таймаут или ошибка - камера оффлайн или go2rtc недоступен
                }

                return {
                    ...camera,
                    isStreaming
                }
            })
        )

        return NextResponse.json({
            success: true,
            data: camerasWithStatus
        })

    } catch (error) {
        logError({ error: error as Error, path: '/api/presence/cameras/status', method: 'GET' })
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
