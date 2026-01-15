import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, orders, auditLogs } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // Fetch client with manager info
        const client = await db.query.clients.findFirst({
            where: eq(clients.id, id),
            with: {
                manager: {
                    columns: {
                        name: true,
                    },
                },
            },
        });

        if (!client) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        // Fetch client's orders
        const clientOrders = await db.query.orders.findMany({
            where: eq(orders.clientId, id),
            orderBy: (orders, { desc }) => [desc(orders.createdAt)],
            limit: 10,
            columns: {
                id: true,
                createdAt: true,
                status: true,
                totalAmount: true,
            },
        });

        // Calculate totals
        const totalOrders = clientOrders.length;
        const totalSpent = clientOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        // Format orders for response
        const formattedOrders = clientOrders.map(order => ({
            id: order.id,
            orderNumber: order.id.slice(0, 8).toUpperCase(),
            createdAt: order.createdAt,
            status: order.status,
            totalPrice: Number(order.totalAmount || 0),
        }));

        // Fetch audit logs for this client
        const activity = await db.query.auditLogs.findMany({
            where: and(
                eq(auditLogs.entityId, id),
                eq(auditLogs.entityType, "client")
            ),
            orderBy: [desc(auditLogs.createdAt)],
            limit: 20,
            with: {
                user: {
                    columns: {
                        name: true,
                    }
                }
            }
        });

        return NextResponse.json({
            ...client,
            totalOrders,
            totalSpent,
            orders: formattedOrders,
            activity,
        });
    } catch (error) {
        console.error("Error fetching client profile:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

