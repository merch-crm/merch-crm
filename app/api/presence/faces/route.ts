import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { employeeFaces } from '@/lib/schema/presence'
import { eq } from 'drizzle-orm'
import { logError } from '@/lib/error-logger'

const SERVICE_API_KEY = process.env.PRESENCE_SERVICE_API_KEY || 'presence-secret-key'

export async function GET(request: NextRequest) {
    try {
        // Проверка API ключа
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || authHeader !== `Bearer ${SERVICE_API_KEY}`) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const faces = await db.query.employeeFaces.findMany({
            where: eq(employeeFaces.isActive, true)
        })

        return NextResponse.json({
            success: true,
            data: faces
        })

    } catch (error) {
        logError({ error: error as Error, path: '/api/presence/faces', method: 'GET' })
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
