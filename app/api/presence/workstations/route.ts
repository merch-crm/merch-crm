import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json(
        { success: false, error: 'Workstation monitoring is no longer supported' },
        { status: 410 }
    )
}

export async function POST() {
    return NextResponse.json(
        { success: false, error: 'Workstation monitoring is no longer supported' },
        { status: 410 }
    )
}
