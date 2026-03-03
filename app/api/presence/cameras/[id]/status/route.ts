import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cameras } from '@/lib/schema/presence'
import { eq } from 'drizzle-orm'
import { logError } from '@/lib/error-logger'

const SERVICE_API_KEY = process.env.PRESENCE_SERVICE_API_KEY || 'presence-secret-key'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const { status, error_message } = body

        await db.update(cameras)
            .set({
                status: status as any,
                errorMessage: error_message || null,
                lastOnlineAt: status === 'online' ? new Date() : undefined,
                updatedAt: new Date()
            })
            .where(eq(cameras.id, params.id))

        return NextResponse.json({ success: true })

    } catch (error) {
        logError({ error: error as Error, path: '/api/presence/cameras/[id]/status', method: 'PATCH' })
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
