import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { logError } from '@/lib/error-logger'

// Xiaomi OAuth endpoints
const XIAOMI_AUTH_URL = 'https://account.xiaomi.com/oauth2/authorize'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Только админ может добавлять аккаунты
        await requireAdmin(session)

        const clientId = process.env.XIAOMI_CLIENT_ID
        const redirectUri = process.env.XIAOMI_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/presence/xiaomi/callback`

        if (!clientId) {
            return NextResponse.json({
                success: false,
                error: 'Xiaomi OAuth not configured (XIAOMI_CLIENT_ID is missing)'
            }, { status: 500 })
        }

        // Генерируем state для безопасности
        const state = Buffer.from(JSON.stringify({
            userId: session.id,
            timestamp: Date.now()
        })).toString('base64')

        const authUrl = new URL(XIAOMI_AUTH_URL)
        authUrl.searchParams.set('client_id', clientId)
        authUrl.searchParams.set('redirect_uri', redirectUri)
        authUrl.searchParams.set('response_type', 'code')
        authUrl.searchParams.set('scope', 'xiaoai_user_profile smartcamera')
        authUrl.searchParams.set('state', state)

        return NextResponse.json({
            success: true,
            data: {
                auth_url: authUrl.toString()
            }
        })

    } catch (error) {
        logError({ error: error as Error, path: '/api/presence/xiaomi/auth', method: 'GET' })
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
