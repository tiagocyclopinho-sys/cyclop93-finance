"use client"
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { Transaction, RoneConsumption, RoneWaterBill, NezioInstallment, Debt, Investment } from './types'

interface AppState {
    transactions: Transaction[]
    roneConsumptions: RoneConsumption[]
    roneWaterBills: RoneWaterBill[]
    nezioInstallments: NezioInstallment[]
    debts: Debt[]
    investments: Investment[]
}

type Action =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'DELETE_TRANSACTION'; payload: string }
    | { type: 'ADD_RONE_CONSUMPTION'; payload: RoneConsumption }
    | { type: 'DELETE_RONE_CONSUMPTION'; payload: string }
    | { type: 'ADD_RONE_WATER_BILL'; payload: RoneWaterBill }
    | { type: 'ADD_NEZIO'; payload: NezioInstallment }
    | { type: 'ADD_DEBT'; payload: Debt }
    | { type: 'UPDATE_DEBT'; payload: Debt }
    | { type: 'ADD_INVESTMENT'; payload: Investment }
    | { type: 'LOAD_DATA'; payload: AppState }

const initialState: AppState = {
    transactions: [],
    roneConsumptions: [],
    roneWaterBills: [],
    nezioInstallments: [],
    debts: [],
    investments: []
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [...state.transactions, action.payload] }
        case 'DELETE_TRANSACTION':
            return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }
        case 'ADD_RONE_CONSUMPTION':
            return { ...state, roneConsumptions: [...state.roneConsumptions, action.payload] }
        case 'DELETE_RONE_CONSUMPTION':
            return { ...state, roneConsumptions: state.roneConsumptions.filter(c => c.id !== action.payload) }
        case 'ADD_RONE_WATER_BILL':
            // Overwrites if same month exists? For simplicity, just append for now, UI handles logic
            return { ...state, roneWaterBills: [...state.roneWaterBills, action.payload] }
        case 'ADD_NEZIO':
            return { ...state, nezioInstallments: [...state.nezioInstallments, action.payload] }
        case 'ADD_DEBT':
            return { ...state, debts: [...state.debts, action.payload] }
        case 'UPDATE_DEBT':
            return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) }
        case 'ADD_INVESTMENT':
            return { ...state, investments: [...state.investments, action.payload] }
        case 'LOAD_DATA':
            return action.payload
        default:
            return state
    }
}

const AppContext = createContext<{
    state: AppState
    dispatch: React.Dispatch<Action>
} | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    // Load from LocalStorage
    useEffect(() => {
        const loaded = localStorage.getItem('cyclop-data')
        if (loaded) {
            try {
                const parsed = JSON.parse(loaded)
                if (parsed) dispatch({ type: 'LOAD_DATA', payload: parsed })
            } catch (e) {
                console.error("Failed to load data", e)
            }
        }
    }, [])

    // Save to LocalStorage
    useEffect(() => {
        if (state !== initialState) {
            localStorage.setItem('cyclop-data', JSON.stringify(state))
        }
    }, [state])

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) throw new Error('useApp must be used within AppProvider')
    return context
}
