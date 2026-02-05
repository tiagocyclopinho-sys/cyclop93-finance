"use client"
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import { Transaction, RoneConsumption, RoneWaterBill, NezioInstallment, Debt, Investment } from './types'

interface AppState {
    version: string
    transactions: Transaction[]
    roneConsumptions: RoneConsumption[]
    roneWaterBills: RoneWaterBill[]
    nezioInstallments: NezioInstallment[]
    debts: Debt[]
    investments: Investment[]
    initialBalance: number
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
    | { type: 'SET_INITIAL_BALANCE'; payload: number }
    | { type: 'LOAD_DATA'; payload: AppState }

const CURRENT_VERSION = '2.1' // Updated: Pure initial balance, no adjustment transaction

const initialState: AppState = {
    version: CURRENT_VERSION,
    transactions: [],
    roneConsumptions: [],
    roneWaterBills: [],
    nezioInstallments: [
        {
            id: 'netshoes-sample',
            date: '2026-01-15',
            description: 'Tênis de Corrida',
            establishment: 'Netshoes',
            amount: 145.43,
            totalAmount: 436.29,
            installmentIndex: 1,
            totalInstallments: 3,
            status: 'pending',
            lastInstallmentDate: '2026-04-20'
        }
    ],
    debts: [],
    investments: [],
    initialBalance: 1454.31
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
            return { ...state, roneWaterBills: [...state.roneWaterBills, action.payload] }
        case 'ADD_NEZIO':
            return { ...state, nezioInstallments: [...state.nezioInstallments, action.payload] }
        case 'ADD_DEBT':
            return { ...state, debts: [...state.debts, action.payload] }
        case 'UPDATE_DEBT':
            return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) }
        case 'ADD_INVESTMENT':
            return { ...state, investments: [...state.investments, action.payload] }
        case 'SET_INITIAL_BALANCE':
            return { ...state, initialBalance: action.payload }
        case 'LOAD_DATA':
            // If version mismatch, force update to initial state for new requested data
            if (!action.payload.version || action.payload.version !== CURRENT_VERSION) {
                return initialState
            }

            return {
                ...state,
                ...action.payload,
                version: CURRENT_VERSION
            }
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
                if (parsed) {
                    dispatch({ type: 'LOAD_DATA', payload: parsed })
                }
            } catch (e) {
                console.error("Failed to load data", e)
            }
        }
    }, [])

    // Ensure the data is saved immediately if we forced a merge
    useEffect(() => {
        localStorage.setItem('cyclop-data', JSON.stringify(state))
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
