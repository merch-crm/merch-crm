import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { xiaomiAccounts } from '@/lib/schema'
import { logError } from '@/lib/error-logger'
import { logAction } from '@/lib/audit'
import { encrypt } from '@/lib/crypto'

const XIAOMI_TOKEN_URL = 'https://account.xiaomi.com/oauth2/token'
const XIAOMI_USER_URL = 'https://open.account.xiaomi.com/user/profile'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        // Обработка ошибки от Xiaomi
        if (error) {
            return NextResponse.redirect(
                new URL(`/staff/cameras?error=${encodeURIComponent(error)}`, request.url)
            )
        }

        if (!code || !state) {
            return NextResponse.redirect(
                new URL('/staff/cameras?error=missing_params', request.url)
            )
        }

        // Декодируем state
        let stateData: { userId: string; timestamp: number }
        try {
            stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        } catch {
            return NextResponse.redirect(
                new URL('/staff/cameras?error=invalid_state', request.url)
            )
        }

        // Проверка времени (state действителен 10 минут)
        if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
            return NextResponse.redirect(
                new URL('/staff/cameras?error=expired_state', request.url)
            )
        }

        // Обмен кода на токен
        const tokenResponse = await fetch(XIAOMI_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.XIAOMI_CLIENT_ID!,
                client_secret: process.env.XIAOMI_CLIENT_SECRET!,
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.XIAOMI_REDIRECT_URI || `${process.env.APP_URL}/api/presence/xiaomi/callback`
            })
        })

        if (!tokenResponse.ok) {
            return NextResponse.redirect(
                new URL('/staff/cameras?error=token_exchange_failed', request.url)
            )
        }

        const tokenData = await tokenResponse.json()

        // Получаем информацию о пользователе
        const userResponse = await fetch(XIAOMI_USER_URL, {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        })

        let userData = { userId: '', email: '', nickname: '' }
        if (userResponse.ok) {
            const userJson = await userResponse.json()
            userData = {
                userId: userJson.userId || userJson.unionId || '',
                email: userJson.email || '',
                nickname: userJson.miliaoNick || userJson.nickname || ''
            }
        }

        // Шифруем токен
        const encryptedToken = encrypt(tokenData.access_token)

        // Сохраняем аккаунт
        const [account] = await db.insert(xiaomiAccounts).values({
            xiaomiUserId: userData.userId || `xiaomi_${Date.now()}`,
            email: userData.email,
            nickname: userData.nickname,
            encryptedToken,
            region: 'cn',
            isActive: true,
            createdById: stateData.userId
        }).onConflictDoUpdate({
            target: xiaomiAccounts.xiaomiUserId,
            set: {
                encryptedToken,
                isActive: true,
                updatedAt: new Date(),
            }
        }).returning()

        // Логируем действие
        await logAction('Добавлен аккаунт Xiaomi (OAuth)', 'xiaomi_account', account.id, {
            email: userData.email
        })

        return NextResponse.redirect(
            new URL(`/staff/cameras?success=account_added&id=${account.id}`, request.url)
        )

    } catch (error) {
        logError({ error: error as Error, path: '/api/presence/xiaomi/callback', method: 'GET' })
        return NextResponse.redirect(
            new URL('/staff/cameras?error=internal_error', request.url)
        )
    }
}
