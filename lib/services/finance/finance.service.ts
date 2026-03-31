import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema/orders";
import { eq } from "drizzle-orm";
import { logError } from "@/lib/error-logger";

/**
 * Service for financial operations, including cost calculations.
 */
export class FinanceService {
  /**
   * Calculates the full estimated cost for a given order.
   * Returns the computed total without persisting to non-existent columns.
   *
   * @param orderId - The unique identifier of the order.
   * @audit FINANCE_CALCULATION
   */
  static async calculateOrderCost(orderId: string): Promise<number> {
    try {
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, orderId),
        limit: 1000,
        with: {
          inventory: true,
          applicationType: true,
        },
      });

      let totalOrderCost = 0;

      // 2. Calculate cost for each item
      for (const item of items) {
        let itemCost = 0;

        // Blank cost (from inventory items)
        const blankCost = Number(item.inventory?.costPrice || 0);
        itemCost += blankCost * item.quantity;

        // Application cost (from application types)
        if (item.applicationType) {
          const app = item.applicationType;
          const setupCost = (app.setupCost || 0) / 100;
          const unitCost = (app.baseCost || 0) / 100 + (app.costPerUnit || 0) / 100;
          // amortizationCost not yet in schema — skip
          const applicationCost = setupCost + unitCost * item.quantity;
          itemCost += applicationCost;
        }

        totalOrderCost += itemCost;
      }

      return totalOrderCost;
    } catch (error) {
      await logError({
        error,
        path: "FinanceService.calculateOrderCost",
        method: "POST",
        details: { orderId }
      });
      throw error;
    }
  }

  /**
   * Calculates the margin for a specific order based on totalAmount.
   * NOTE: totalCost column does not yet exist on orders table — margin is estimated from item calculation.
   */
  static async getOrderMargin(orderId: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      columns: {
        totalAmount: true,
      }
    });

    if (!order) return null;

    const totalAmount = Number(order.totalAmount);
    const totalCost = await this.calculateOrderCost(orderId);
    const margin = totalAmount - totalCost;
    const marginPercentage = totalAmount > 0 ? (margin / totalAmount) * 100 : 0;

    return {
      totalAmount,
      totalCost,
      margin,
      marginPercentage,
    };
  }
}
