import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Xiaomi MiHome integration is no longer supported' },
        { status: 410 }
    )
}
