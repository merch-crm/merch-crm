import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { cameras } from '@/lib/schema/presence'
import { logError } from '@/lib/error-logger'

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const allCameras = await db.query.cameras.findMany({
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

                // В go2rtc стрим обычно называется xiaomi_{deviceId}
                const streamName = `xiaomi_${camera.deviceId}`

                try {
                    const response = await fetch(`${go2rtcUrl}/api/streams`, {
                        method: 'GET',
                        signal: AbortSignal.timeout(3000)
                    })
                    if (response.ok) {
                        const streams = await response.json()
                        isStreaming = !!(streams[streamName]?.producers?.length > 0)
                    }
                } catch {
                    // Таймаут или ошибка - камера оффлайн
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
