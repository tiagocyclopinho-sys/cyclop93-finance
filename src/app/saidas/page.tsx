"use client"
import React, { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Plus, Trash2, ArrowDownRight, CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { cn } from '@/lib/utils'

export default function ExpensesPage() {
    const { state, dispatch } = useApp()

    // New Expense State
    const [desc, setDesc] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [category, setCategory] = useState('')
    const [type, setType] = useState('variable') // fixed or variable
    const [status, setStatus] = useState<any>('paid')

    // Filter State
    const [filters, setFilters] = useState<any>({
        startDate: '',
        endDate: '',
        category: '',
        status: '',
        sortBy: 'date-desc'
    })

    const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Outros']

    const handleAdd = () => {
        if (!desc || !amount) return
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                id: crypto.randomUUID(),
                date: date,
                description: desc,
                amount: parseFloat(amount),
                type: 'expense',
                category: category || 'Outros',
                status: status, // pending, paid, overdue
                isFixed: type === 'fixed'
            }
        })
        setDesc('')
        setAmount('')
        setCategory('')
    }

    const handlePay = (t: any) => {
        // Logic to mark as paid? Need UPDATE_TRANSACTION action
        // For now, simpler: delete and re-add? No, that changes ID.
        // HACK: I'll remove and add again with 'paid' status for this prototype to be fast.
        dispatch({ type: 'DELETE_TRANSACTION', payload: t.id })
        dispatch({ type: 'ADD_TRANSACTION', payload: { ...t, status: 'paid' } })
    }

    const handleDelete = (id: string) => {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id })
    }

    // Filter Logic
    const filteredData = useMemo(() => {
        let data = state.transactions.filter(t => t.type === 'expense')

        if (filters.startDate) data = data.filter(t => t.date >= filters.startDate)
        if (filters.endDate) data = data.filter(t => t.date <= filters.endDate)
        if (filters.category) data = data.filter(t => t.category === filters.category)
        if (filters.status) data = data.filter(t => t.status === filters.status)

        data.sort((a, b) => {
            const dateA = new Date(a.date).getTime()
            const dateB = new Date(b.date).getTime()
            const amountA = a.amount
            const amountB = b.amount

            switch (filters.sortBy) {
                case 'date-asc': return dateA - dateB
                case 'amount-desc': return amountB - amountA
                case 'amount-asc': return amountA - amountB
                case 'date-desc': default: return dateB - dateA
            }
        })

        return data
    }, [state.transactions, filters])

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Saídas</h2>
                    <p className="text-muted-foreground">Controle de despesas, fixas e variáveis.</p>
                </div>

                {/* Date Filter in Header */}
                <div className="flex items-center gap-2 bg-card p-1.5 rounded-lg border shadow-sm">
                    <Calendar size={16} className="text-muted-foreground ml-2" />
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            className="bg-transparent border-none text-xs focus:ring-0 p-1"
                            value={filters.startDate}
                            onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                            type="date"
                            className="bg-transparent border-none text-xs focus:ring-0 p-1"
                            value={filters.endDate}
                            onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nova Despesa</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-6 items-end">
                        <Input
                            label="Descrição"
                            placeholder="Ex: Aluguel"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="md:col-span-2"
                        />
                        <Select
                            label="Categoria"
                            options={[
                                { label: 'Selecione...', value: '' },
                                ...categories.map(c => ({ label: c, value: c }))
                            ]}
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        />
                        <Select
                            label="Tipo"
                            options={[{ label: 'Variável', value: 'variable' }, { label: 'Fixa', value: 'fixed' }]}
                            value={type}
                            onChange={e => setType(e.target.value)}
                        />
                        <Select
                            label="Status"
                            options={[
                                { label: 'Paga', value: 'paid' },
                                { label: 'Agendada/Pendente', value: 'pending' },
                                { label: 'Atrasada', value: 'overdue' }
                            ]}
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                        />
                        <Input
                            type="date"
                            label="Data"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <Input
                                label="Valor (R$)"
                                type="number"
                                placeholder="0,00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAdd} className="md:col-span-6 w-full">
                            <Plus size={16} className="mr-2" />
                            Registrar Saída
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Filter Bar (Collapsible, no date) */}
            <FilterBar
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
                showStatus={true}
                showDate={false}
            />

            <div className="space-y-4">
                {filteredData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Nenhuma despesa encontrada com os filtros atuais.</div>
                ) : (
                    filteredData.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border",
                                    t.status === 'paid' ? "bg-zinc-800 border-zinc-700 text-zinc-400" :
                                        t.status === 'overdue' ? "bg-red-900/20 border-red-900 text-red-500" :
                                            "bg-yellow-900/20 border-yellow-900 text-yellow-500"
                                )}>
                                    <ArrowDownRight size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold">{t.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                        <span>•</span>
                                        <span className="bg-zinc-800 px-2 py-0.5 rounded-full">{t.category}</span>
                                        {t.isFixed && <span className="text-blue-400 font-medium">FIXA</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-lg font-bold text-red-500">- R$ {t.amount.toFixed(2)}</span>
                                    <div className="text-xs flex justify-end">
                                        {t.status === 'paid' && <span className="flex items-center text-green-500"><CheckCircle2 size={12} className="mr-1" /> Paga</span>}
                                        {t.status === 'pending' && <span className="flex items-center text-yellow-500"><Clock size={12} className="mr-1" /> Agendada</span>}
                                        {t.status === 'overdue' && <span className="flex items-center text-red-500"><AlertCircle size={12} className="mr-1" /> Atrasada</span>}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {t.status === 'pending' && (
                                        <Button size="sm" variant="outline" className="h-8" onClick={() => handlePay(t)}>
                                            Pagar
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(t.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-red-600"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
