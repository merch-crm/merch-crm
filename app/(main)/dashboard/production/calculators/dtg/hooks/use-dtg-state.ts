// app/(main)/dashboard/production/calculators/dtg/hooks/use-dtg-state.ts

import { useReducer, useCallback } from 'react'
import {
  type ConsumablesConfigData,
  type MeterPriceTierData,
  type PlacementData,
} from '../../types'
import { type DtgPrintInput } from '../../dtg-types'

export interface DtgState {
  // Server data
  meterPricing: MeterPriceTierData[]
  placements: PlacementData[]
  consumablesConfig: ConsumablesConfigData

  // Calculator input
  orders: DtgPrintInput[]

  // UI
  isHistoryOpen: boolean
  isSettingsOpen: boolean
  isSaving: boolean
  savedNumber?: string
}

export type DtgAction =
  | { type: 'SET_ORDERS'; payload: DtgPrintInput[] }
  | { type: 'ADD_ORDER'; payload: DtgPrintInput }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<DtgPrintInput> } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'DUPLICATE_ORDER'; payload: DtgPrintInput }
  | { type: 'CLEAR_ORDERS' }
  | { type: 'SET_METER_PRICING'; payload: MeterPriceTierData[] }
  | { type: 'SET_PLACEMENTS'; payload: PlacementData[] }
  | { type: 'SET_CONSUMABLES'; payload: ConsumablesConfigData }
  | { type: 'SET_SAVED_NUMBER'; payload: string | undefined }
  | { type: 'SET_UI'; payload: { key: 'isHistoryOpen' | 'isSettingsOpen' | 'isSaving'; value: boolean } }

function dtgReducer(state: DtgState, action: DtgAction): DtgState {
  switch (action.type) {
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, savedNumber: undefined }
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] }
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: (state.orders || []).map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload.updates } : o
        ),
        savedNumber: undefined
      }
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: (state.orders || []).filter(o => o.id !== action.payload),
        savedNumber: undefined
      }
    case 'DUPLICATE_ORDER':
      return { ...state, orders: [...state.orders, action.payload] }
    case 'CLEAR_ORDERS':
      return { ...state, orders: [], savedNumber: undefined }
    case 'SET_METER_PRICING':
      return { ...state, meterPricing: action.payload }
    case 'SET_PLACEMENTS':
      return { ...state, placements: action.payload }
    case 'SET_CONSUMABLES':
      return { ...state, consumablesConfig: action.payload }
    case 'SET_SAVED_NUMBER':
      return { ...state, savedNumber: action.payload }
    case 'SET_UI':
      return { ...state, [action.payload.key]: action.payload.value }
    default:
      return state
  }
}

export function useDtgState(initial: {
  meterPricing: MeterPriceTierData[]
  placements: PlacementData[]
  consumablesConfig: ConsumablesConfigData
}) {
  const [state, dispatch] = useReducer(dtgReducer, {
    meterPricing: initial.meterPricing,
    placements: initial.placements,
    consumablesConfig: initial.consumablesConfig,
    orders: [],
    isHistoryOpen: false,
    isSettingsOpen: false,
    isSaving: false,
    savedNumber: undefined,
  })

  const setUi = useCallback(
    (key: 'isHistoryOpen' | 'isSettingsOpen' | 'isSaving', value: boolean) => {
      dispatch({ type: 'SET_UI', payload: { key, value } })
    },
    []
  )

  return { state, dispatch, setUi }
}
