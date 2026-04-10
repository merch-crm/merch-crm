import { NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/api/auth";

/**
 * Public API: GET /api/v1/ping
 * Basic health check for the API.
 * Authorization: Optional X-API-Key header.
 */
export async function GET(request: Request) {
  try {
    const userId = await verifyApiKey(request);
    
    return NextResponse.json({
      success: true,
      message: "MerchCRM API v1 is active",
      timestamp: new Date().toISOString(),
      authorized: !!userId
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
  }
}
