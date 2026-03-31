'use client'

import { memo } from 'react'
import { DtgOrderCard } from './dtg-order-card'
import { type DtgPrintInput } from '../../types'

interface DtgOrderListProps {
  orders: DtgPrintInput[]
  onUpdate: (orderId: string, updates: Partial<DtgPrintInput>) => void
  onDelete: (orderId: string) => void
  onDuplicate: (orderId: string) => void
}

export const DtgOrderList = memo(function DtgOrderList({
  orders,
  onUpdate,
  onDelete,
  onDuplicate
}: DtgOrderListProps) {
  if ((orders || []).length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {(orders || []).map((order, index) => (
        <DtgOrderCard
          key={order.id}
          order={order}
          index={index}
          onUpdate={(updates) => onUpdate(order.id, updates)}
          onDelete={() => onDelete(order.id)}
          onDuplicate={() => onDuplicate(order.id)}
        />
      ))}
    </div>
  )
})
