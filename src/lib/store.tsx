"use client"
import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { Transaction, RoneConsumption, RoneWaterBill, NezioInstallment, Debt, Investment } from './types'
import { supabase } from './supabase'

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

const CURRENT_VERSION = '6.1'

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
    | { type: 'ADD_NEZIO'; payload: NezioInstallment }
    | { type: 'UPDATE_NEZIO'; payload: NezioInstallment }
    | { type: 'DELETE_NEZIO'; payload: string }
    | { type: 'ADD_INVESTMENT'; payload: Investment }
    | { type: 'UPDATE_INVESTMENT'; payload: Investment }
    | { type: 'DELETE_INVESTMENT'; payload: string }
    | { type: 'ADD_DEBT'; payload: Debt }
    | { type: 'UPDATE_DEBT'; payload: Debt }
    | { type: 'DELETE_DEBT'; payload: string }
    | { type: 'SET_INITIAL_BALANCE'; payload: number }
    | { type: 'LOAD_DATA'; payload: Partial<AppState> }

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'ADD_TRANSACTION': {
            const newState = { ...state, transactions: [...state.transactions, action.payload] }
            supabase.from('transactions').upsert({
                id: action.payload.id,
                date: action.payload.date,
                amount: action.payload.amount,
                description: action.payload.description,
                category: action.payload.category,
                type: action.payload.type,
                status: action.payload.status,
                is_fixed: action.payload.isFixed
            }).then();
            return newState
        }
        case 'UPDATE_TRANSACTION': {
            const newState = { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) }
            supabase.from('transactions').upsert({
                id: action.payload.id,
                date: action.payload.date,
                amount: action.payload.amount,
                description: action.payload.description,
                category: action.payload.category,
                type: action.payload.type,
                status: action.payload.status,
                is_fixed: action.payload.isFixed
            }).then();
            return newState
        }
        case 'DELETE_TRANSACTION': {
            const newState = { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }
            supabase.from('transactions').delete().eq('id', action.payload).then();
            return newState
        }
        case 'ADD_NEZIO': {
            const newState = { ...state, nezioInstallments: [...state.nezioInstallments, action.payload] }
            supabase.from('nezio_installments').upsert({
                id: action.payload.id,
                date: action.payload.date,
                amount: action.payload.amount,
                total_amount: action.payload.totalAmount,
                installment_index: action.payload.installmentIndex,
                total_installments: action.payload.totalInstallments,
                description: action.payload.description,
                establishment: action.payload.establishment,
                status: action.payload.status,
                last_installment_date: action.payload.lastInstallmentDate
            }).then();
            return newState
        }
        case 'UPDATE_NEZIO': {
            const newState = { ...state, nezioInstallments: state.nezioInstallments.map(n => n.id === action.payload.id ? action.payload : n) }
            supabase.from('nezio_installments').upsert({
                id: action.payload.id,
                date: action.payload.date,
                amount: action.payload.amount,
                total_amount: action.payload.totalAmount,
                installment_index: action.payload.installmentIndex,
                total_installments: action.payload.totalInstallments,
                description: action.payload.description,
                establishment: action.payload.establishment,
                status: action.payload.status,
                last_installment_date: action.payload.lastInstallmentDate
            }).then();
            return newState
        }
        case 'DELETE_NEZIO': {
            const newState = { ...state, nezioInstallments: state.nezioInstallments.filter(n => n.id !== action.payload) }
            supabase.from('nezio_installments').delete().eq('id', action.payload).then();
            return newState
        }
        case 'ADD_INVESTMENT': {
            const newState = { ...state, investments: [...state.investments, action.payload] }
            supabase.from('investments').upsert({
                id: action.payload.id,
                date: action.payload.date,
                type: action.payload.type,
                institution: action.payload.institution,
                amount: action.payload.amount,
                current_value: action.payload.currentValue
            }).then();
            return newState
        }
        case 'UPDATE_INVESTMENT': {
            const newState = { ...state, investments: state.investments.map(i => i.id === action.payload.id ? action.payload : i) }
            supabase.from('investments').upsert({
                id: action.payload.id,
                date: action.payload.date,
                type: action.payload.type,
                institution: action.payload.institution,
                amount: action.payload.amount,
                current_value: action.payload.currentValue
            }).then();
            return newState
        }
        case 'DELETE_INVESTMENT': {
            const newState = { ...state, investments: state.investments.filter(i => i.id !== action.payload) }
            supabase.from('investments').delete().eq('id', action.payload).then();
            return newState
        }
        case 'ADD_DEBT': {
            const newState = { ...state, debts: [...state.debts, action.payload] }
            supabase.from('debts').upsert({
                id: action.payload.id,
                name: action.payload.name,
                installment_value: action.payload.installmentValue,
                installments: action.payload.installments,
                total_value: action.payload.totalValue,
                first_payment_date: action.payload.firstPaymentDate,
                status: action.payload.status
            }).then();
            return newState
        }
        case 'UPDATE_DEBT': {
            const newState = { ...state, debts: state.debts.map(d => d.id === action.payload.id ? action.payload : d) }
            supabase.from('debts').upsert({
                id: action.payload.id,
                name: action.payload.name,
                installment_value: action.payload.installmentValue,
                installments: action.payload.installments,
                total_value: action.payload.totalValue,
                first_payment_date: action.payload.firstPaymentDate,
                status: action.payload.status
            }).then();
            return newState
        }
        case 'DELETE_DEBT': {
            const newState = { ...state, debts: state.debts.filter(d => d.id !== action.payload) }
            supabase.from('debts').delete().eq('id', action.payload).then();
            return newState
        }
        case 'SET_INITIAL_BALANCE':
            return { ...state, initialBalance: action.payload }
        case 'LOAD_DATA':
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
    const isLoaded = useRef(false)

    // Load from Supabase on Initial Mount
    useEffect(() => {
        async function loadSupabaseData() {
            if (isLoaded.current) return;

            try {
                const [
                    { data: trans },
                    { data: nezio },
                    { data: invs },
                    { data: debts }
                ] = await Promise.all([
                    supabase.from('transactions').select('*'),
                    supabase.from('nezio_installments').select('*'),
                    supabase.from('investments').select('*'),
                    supabase.from('debts').select('*')
                ]);

                dispatch({
                    type: 'LOAD_DATA',
                    payload: {
                        transactions: (trans || []).map((t: any) => ({
                            id: t.id,
                            date: t.date,
                            amount: Number(t.amount),
                            description: t.description,
                            category: t.category,
                            type: t.type,
                            status: t.status,
                            isFixed: t.is_fixed
                        })),
                        nezioInstallments: (nezio || []).map((n: any) => ({
                            id: n.id,
                            date: n.date,
                            amount: Number(n.amount),
                            totalAmount: Number(n.total_amount),
                            installmentIndex: n.installment_index,
                            totalInstallments: n.total_installments,
                            description: n.description,
                            establishment: n.establishment,
                            status: n.status,
                            lastInstallmentDate: n.last_installment_date
                        })),
                        investments: (invs || []).map((i: any) => ({
                            id: i.id,
                            date: i.date,
                            type: i.type,
                            institution: i.institution,
                            amount: Number(i.amount),
                            currentValue: Number(i.current_value)
                        })),
                        debts: (debts || []).map((d: any) => ({
                            id: d.id,
                            name: d.name,
                            installmentValue: Number(d.installment_value),
                            installments: d.installments,
                            totalValue: Number(d.total_value),
                            firstPaymentDate: d.first_payment_date,
                            status: d.status
                        }))
                    }
                });
                isLoaded.current = true;
            } catch (error) {
                console.error("Error loading data from Supabase:", error);
            }
        }

        loadSupabaseData();
    }, []);

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
