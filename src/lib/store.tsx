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

const CURRENT_VERSION = '6.0' // Versão zerada conforme solicitado

const initialState: AppState = {
    version: CURRENT_VERSION,
    transactions: [],
    roneConsumptions: [],
    roneWaterBills: [],
    nezioInstallments: [],
    debts: [],
    investments: [],
    initialBalance: 0
}

type Action =
    | { type: 'ADD_TRANSACTION'; payload: Transaction }
    | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
    | { type: 'DELETE_TRANSACTION'; payload: string }
    | { type: 'ADD_RONE_CONSUMPTION'; payload: RoneConsumption }
    | { type: 'DELETE_RONE_CONSUMPTION'; payload: string }
    | { type: 'ADD_RONE_WATER_BILL'; payload: RoneWaterBill }
    | { type: 'ADD_NEZIO'; payload: NezioInstallment }
    | { type: 'UPDATE_NEZIO'; payload: NezioInstallment }
    | { type: 'DELETE_NEZIO'; payload: string }
    | { type: 'ADD_DEBT'; payload: Debt }
    | { type: 'UPDATE_DEBT'; payload: Debt }
    | { type: 'DELETE_DEBT'; payload: string }
    | { type: 'ADD_INVESTMENT'; payload: Investment }
    | { type: 'UPDATE_INVESTMENT'; payload: Investment }
    | { type: 'UPDATE_RONE_CONSUMPTION'; payload: RoneConsumption }
    | { type: 'DELETE_INVESTMENT'; payload: string }
    | { type: 'SET_INITIAL_BALANCE'; payload: number }
    | { type: 'LOAD_DATA'; payload: AppState }

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [...state.transactions, action.payload] }
        case 'UPDATE_TRANSACTION':
            return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) }
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
        case 'UPDATE_NEZIO':
            return { ...state, nezioInstallments: state.nezioInstallments.map(n => n.id === action.payload.id ? action.payload : n) }
        case 'DELETE_NEZIO':
            return { ...state, nezioInstallments: state.nezioInstallments.filter(n => n.id !== action.payload) }
        case 'ADD_DEBT':
            return { ...state, debts: [...state.debts, action.payload] }
        case 'UPDATE_DEBT':
            return { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) }
        case 'DELETE_DEBT':
            return { ...state, debts: state.debts.filter(d => d.id !== action.payload) }
        case 'UPDATE_RONE_CONSUMPTION':
            return { ...state, roneConsumptions: state.roneConsumptions.map(c => c.id === action.payload.id ? action.payload : c) }
        case 'ADD_INVESTMENT':
            return { ...state, investments: [...state.investments, action.payload] }
        case 'UPDATE_INVESTMENT':
            return { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) }
        case 'DELETE_INVESTMENT':
            return { ...state, investments: state.investments.filter(i => i.id !== action.payload) }
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
