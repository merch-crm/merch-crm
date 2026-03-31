'use client'

import { memo } from 'react'
import { ResponsiveModal } from '@/components/ui/responsive-modal'
import { CalculationsHistory } from './calculations-history'
import { type ApplicationType } from '../types'
import { type CalculationHistoryItem } from '../actions/history-actions'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  applicationType?: ApplicationType
  onSelect?: (calculation: CalculationHistoryItem) => void
}

export const HistoryModal = memo(function HistoryModal({
  isOpen,
  onClose,
  applicationType,
  onSelect
}: HistoryModalProps) {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="История расчётов"
    >
      <CalculationsHistory
        applicationType={applicationType}
        onSelect={(calc) => {
          onSelect?.(calc)
          onClose()
        }}
        isModal
      />
    </ResponsiveModal>
  )
})
