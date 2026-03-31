// app/(main)/dashboard/production/calculators/dtf/hooks/use-dtf-reducer.ts

import { useReducer, useCallback } from 'react'
import { 
  MeterPriceTierData, 
  PlacementData, 
  ConsumablesConfigData, 
  CalculatorParams, 
  PrintGroupInput, 
  CalculationResult,
  PRINT_GROUP_COLORS
} from '../../types'
import { DEFAULT_DTF_PARAMS } from '../../dtf-types'

export interface DtfState {
  // Data from DB/Server
  meterPricing: MeterPriceTierData[]
  placements: PlacementData[]
  consumablesConfig: ConsumablesConfigData | null
  
  // UI / Status
  isSettingsOpen: boolean
  isHistoryOpen: boolean
  isCalculating: boolean
  isSaving: boolean
  calculationError: string | null
  savedCalculationNumber?: string
  
  // Input Data
  params: CalculatorParams
  printGroups: PrintGroupInput[]
  
  // Result
  result: CalculationResult | null
}

export type DtfAction =
  | { type: 'SET_METER_PRICING'; payload: MeterPriceTierData[] }
  | { type: 'SET_PLACEMENTS'; payload: PlacementData[] }
  | { type: 'SET_CONSUMABLES'; payload: ConsumablesConfigData | null }
  | { type: 'UPDATE_PARAMS'; payload: Partial<CalculatorParams> }
  | { type: 'SET_GROUPS'; payload: PrintGroupInput[] }
  | { type: 'SET_RESULT'; payload: CalculationResult | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVED_NUMBER'; payload: string | undefined }
  | { type: 'SET_UI_FLAG'; payload: { key: 'isSettingsOpen' | 'isHistoryOpen' | 'isCalculating' | 'isSaving'; value: boolean } }
  | { type: 'LOAD_CALCULATION'; payload: { params: CalculatorParams; groups: PrintGroupInput[]; number: string } }

function dtfReducer(state: DtfState, action: DtfAction): DtfState {
  switch (action.type) {
    case 'SET_METER_PRICING':
      return { ...state, meterPricing: action.payload }
    case 'SET_PLACEMENTS':
      return { ...state, placements: action.payload }
    case 'SET_CONSUMABLES':
      return { ...state, consumablesConfig: action.payload }
    case 'UPDATE_PARAMS':
      return { 
        ...state, 
        params: { ...state.params, ...action.payload },
        result: null,
        savedCalculationNumber: undefined
      }
    case 'SET_GROUPS':
      return { 
        ...state, 
        printGroups: action.payload,
        result: null,
        savedCalculationNumber: undefined
      }
    case 'SET_RESULT':
      return { ...state, result: action.payload }
    case 'SET_ERROR':
      return { ...state, calculationError: action.payload }
    case 'SET_SAVED_NUMBER':
      return { ...state, savedCalculationNumber: action.payload }
    case 'SET_UI_FLAG':
      return { ...state, [action.payload.key]: action.payload.value }
    case 'LOAD_CALCULATION':
      return {
        ...state,
        params: action.payload.params,
        printGroups: action.payload.groups,
        savedCalculationNumber: action.payload.number,
        result: null
      }
    default:
      return state
  }
}

export function useDtfState(initial: Partial<DtfState>) {
  const [state, dispatch] = useReducer(dtfReducer, {
    meterPricing: initial.meterPricing || [],
    placements: initial.placements || [],
    consumablesConfig: initial.consumablesConfig || null,
    isSettingsOpen: false,
    isHistoryOpen: false,
    isCalculating: false,
    isSaving: false,
    calculationError: null,
    savedCalculationNumber: undefined,
    params: initial.params || { applicationType: 'dtf', ...DEFAULT_DTF_PARAMS },
    printGroups: initial.printGroups || [
      {
        id: crypto.randomUUID(),
        name: '',
        widthMm: 0,
        heightMm: 0,
        quantity: 1,
        placementId: null,
        color: PRINT_GROUP_COLORS[0]
      }
    ],
    result: null,
    ...initial
  })

  const setUiFlag = useCallback((key: 'isSettingsOpen' | 'isHistoryOpen' | 'isCalculating' | 'isSaving', value: boolean) => {
    dispatch({ type: 'SET_UI_FLAG', payload: { key, value } })
  }, [])

  return { state, dispatch, setUiFlag }
}
