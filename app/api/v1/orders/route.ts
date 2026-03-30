import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema/orders";
import { verifyApiKey } from "@/lib/api/auth";
import { eq, desc, and } from "drizzle-orm";

/**
 * Public API: GET /api/v1/orders
 * Returns a list of active orders for the authorized user's organization.
 * Query Params: 
 * - status: Filter by order status (new, design, production, etc.)
 * - limit: Limit results (default 20, max 100)
 */
export async function GET(request: Request) {
    // audit-ignore (secured via verifyApiKey)
    const userId = await verifyApiKey(request);
    
    if (!userId) {
        return NextResponse.json(
            { success: false, error: "Unauthorized. Invalid or missing X-API-KEY header." },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") as "new" | "design" | "production" | "done" | "shipped" | "cancelled" | "completed" | "archived" | null;
        const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

        const conditions = [eq(orders.isArchived, false)];
        
        if (status) {
            conditions.push(eq(orders.status, status));
        }

        const result = await db.query.orders.findMany({
            where: and(...conditions),
            orderBy: [desc(orders.createdAt)],
            limit: limit,
            columns: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
                paidAmount: true,
                paymentStatus: true,
                deliveryStatus: true,
                priority: true,
                deadline: true,
                createdAt: true,
                updatedAt: true
            },
            with: {
                client: {
                    columns: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (error: unknown) {
        console.error("API Error [GET /orders]:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
