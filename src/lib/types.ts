export type TransactionType = 'income' | 'expense'

export type TransactionStatus = 'pending' | 'paid' | 'overdue'

export interface Transaction {
    id: string
    date: string
    amount: number
    description: string
    category?: string
    type: TransactionType
    status?: TransactionStatus // for expenses
    isFixed?: boolean
}

export interface RoneConsumption {
    id: string
    date: string
    description: string
    amount: number
}

export interface RoneWaterBill {
    id: string
    date: string // month reference usually
    amount: number
    status: 'pending' | 'calculated' | 'paid'
}

export interface NezioInstallment {
    id: string
    date: string
    amount: number // installment value
    totalAmount: number
    installmentIndex: number
    totalInstallments: number
    description: string
    establishment: string
    status: TransactionStatus
    lastInstallmentDate: string
}

export interface Debt {
    id: string
    name: string
    installmentValue: number
    installments: number
    totalValue: number // calc
    firstPaymentDate: string // added for convenience
    correctedTotal?: number
    status: 'agora' | 'aguardando' | 'negociacao' | 'pago'
    negotiation?: {
        agreedValue: number
        installments: number
        firstPaymentDate: string
    }
}

export interface Investment {
    id: string
    date: string
    type: 'CDB' | 'Ação' | 'BTC' | 'FIIs' | 'Outro'
    institution: string
    amount: number
    currentValue?: number
}
