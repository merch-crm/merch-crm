import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const SERVICE_API_KEY = process.env.PRESENCE_SERVICE_API_KEY || 'presence-secret-key'
const PYTHON_SERVICE_URL = process.env.PRESENCE_SERVICE_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { image } = await request.json()
        if (!image) {
            return NextResponse.json({ success: false, error: 'Image is required' }, { status: 400 })
        }

        // Проксируем запрос к Python сервису для получения эмбеддинга
        const response = await fetch(`${PYTHON_SERVICE_URL}/encode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_API_KEY}`
            },
            body: JSON.stringify({ image }),
            signal: AbortSignal.timeout(10000)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Python service error:', errorText)
            return NextResponse.json({
                success: false,
                error: 'Python service failed to process face'
            }, { status: response.status })
        }

        const data = await response.json()

        return NextResponse.json({
            success: true,
            encoding: data.encoding,
            quality: data.quality || 1.0
        })

    } catch (error) {
        console.error('Encode-face API error:', error)
        return NextResponse.json({
            success: false,
            error: 'Internal server error during face encoding'
        }, { status: 500 })
    }
}
