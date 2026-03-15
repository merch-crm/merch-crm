// app/(main)/dashboard/production/calculators/embroidery/hooks/use-embroidery-state.ts

import { useReducer, useCallback } from 'react'
import {
  type EmbroideryDesign,
  type EmbroideryPrintInput,
  type EmbroideryCalculationResult,
} from '../../embroidery-types'

import type { SelectedMaterial } from "@/app/(main)/dashboard/production/components/warehouse-materials-list";

export interface EmbroideryState {
  // Data
  designs: EmbroideryDesign[]
  orders: EmbroideryPrintInput[]
  materials: SelectedMaterial[]
  result: EmbroideryCalculationResult | null
  calculationError: string | null

  // UI
  isCalculating: boolean
  isSaving: boolean
  isCopying: boolean
  showHistory: boolean
  savedCalculationInfo: { id: string; number: string } | null
}

export type EmbroideryAction =
  | { type: 'ADD_DESIGN'; payload: EmbroideryDesign }
  | { type: 'UPDATE_DESIGN'; payload: { id: string; updates: Partial<EmbroideryDesign> } }
  | { type: 'DELETE_DESIGN'; payload: string }
  | { type: 'SET_ORDERS'; payload: EmbroideryPrintInput[] }
  | { type: 'ADD_ORDER'; payload: EmbroideryPrintInput }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<EmbroideryPrintInput> } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'DUPLICATE_ORDER'; payload: EmbroideryPrintInput }
  | { type: 'SET_RESULT'; payload: EmbroideryCalculationResult | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVED_INFO'; payload: { id: string; number: string } | null }
  | { type: 'SET_MATERIALS'; payload: SelectedMaterial[] }
  | { type: 'SET_UI'; payload: { key: 'isCalculating' | 'isSaving' | 'isCopying' | 'showHistory'; value: boolean } }

function embroideryReducer(state: EmbroideryState, action: EmbroideryAction): EmbroideryState {
  switch (action.type) {
    case 'ADD_DESIGN':
      return { ...state, designs: [...state.designs, action.payload], result: null, savedCalculationInfo: null }
    case 'UPDATE_DESIGN':
      return {
        ...state,
        designs: state.designs.map(d =>
          d.id === action.payload.id ? { ...d, ...action.payload.updates } : d
        ),
        result: null,
        savedCalculationInfo: null
      }
    case 'DELETE_DESIGN': {
      const designId = action.payload
      return {
        ...state,
        designs: state.designs.filter(d => d.id !== designId),
        orders: state.orders
          .map(order => ({
            ...order,
            positions: order.positions.filter(pos => pos.designId !== designId)
          }))
          .filter(order => order.positions.length > 0),
        result: null,
        savedCalculationInfo: null
      }
    }
    case 'SET_ORDERS':
      return { ...state, orders: action.payload, result: null, savedCalculationInfo: null }
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload], result: null, savedCalculationInfo: null }
    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: (state.orders || []).map(o =>
          o.id === action.payload.id ? { ...o, ...action.payload.updates } : o
        ),
        result: null,
        savedCalculationInfo: null
      }
    case 'DELETE_ORDER':
      return {
        ...state,
        orders: (state.orders || []).filter(o => o.id !== action.payload),
        result: null,
        savedCalculationInfo: null
      }
    case 'DUPLICATE_ORDER':
      return { ...state, orders: [...state.orders, action.payload], result: null, savedCalculationInfo: null }
    case 'SET_RESULT':
      return { ...state, result: action.payload }
    case 'SET_ERROR':
      return { ...state, calculationError: action.payload }
    case 'SET_SAVED_INFO':
      return { ...state, savedCalculationInfo: action.payload }
    case 'SET_MATERIALS':
      return { ...state, materials: action.payload, result: null, savedCalculationInfo: null }
    case 'SET_UI':
      return { ...state, [action.payload.key]: action.payload.value }
    default:
      return state
  }
}

export function useEmbroideryState() {
  const [state, dispatch] = useReducer(embroideryReducer, {
    designs: [],
    orders: [],
    materials: [],
    result: null,
    calculationError: null,
    isCalculating: false,
    isSaving: false,
    isCopying: false,
    showHistory: false,
    savedCalculationInfo: null,
  })

  const setUi = useCallback(
    (key: 'isCalculating' | 'isSaving' | 'isCopying' | 'showHistory', value: boolean) => {
      dispatch({ type: 'SET_UI', payload: { key, value } })
    },
    []
  )

  return { state, dispatch, setUi }
}
