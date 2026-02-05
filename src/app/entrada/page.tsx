"use client"
import React, { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Plus, Trash2, ArrowUpRight, Calendar } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { cn } from '@/lib/utils'

export default function IncomePage() {
    const { state, dispatch } = useApp()

    // New Income State
    const [desc, setDesc] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
    const [category, setCategory] = useState('')

    // Filter State
    const [filters, setFilters] = useState<any>({
        startDate: '',
        endDate: '',
        category: '',
        sortBy: 'date-desc'
    })

    const categories = ['Salário', 'Ajuda de Custo', 'Aluguel', 'Freelance', 'Vendas', 'Outros']

    const handleAdd = () => {
        if (!desc || !amount) return
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                id: crypto.randomUUID(),
                date: date,
                description: desc,
                amount: parseFloat(amount),
                type: 'income',
                category: category || 'Outros',
                status: 'paid' // Incomes usually are paid immediately unless planned?
            }
        })
        setDesc('')
        setAmount('')
        setCategory('')
    }

    const handleDelete = (id: string) => {
        dispatch({ type: 'DELETE_TRANSACTION', payload: id })
    }

    // Filter Logic
    const filteredData = useMemo(() => {
        let data = state.transactions.filter(t => t.type === 'income')

        if (filters.startDate) data = data.filter(t => t.date >= filters.startDate)
        if (filters.endDate) data = data.filter(t => t.date <= filters.endDate)
        if (filters.category) data = data.filter(t => t.category === filters.category)

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
                    <h2 className="text-3xl font-bold tracking-tight">Entradas</h2>
                    <p className="text-muted-foreground">Gerencie suas receitas e ganhos.</p>
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
                    <CardTitle>Nova Receita</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4 items-end">
                        <Input
                            label="Descrição"
                            placeholder="Ex: Salário Mensal"
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="md:col-span-1"
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
                            <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 mt-auto mb-2">
                                <Plus />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filter Bar (Collapsible, no date) */}
            <FilterBar
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
                showStatus={false}
                showDate={false}
            />

            <div className="space-y-4">
                {filteredData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">Nenhuma receita encontrada com os filtros atuais.</div>
                ) : (
                    filteredData.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold">{t.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                        <span>•</span>
                                        <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">{t.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-lg font-bold text-green-500">+ R$ {t.amount.toFixed(2)}</span>
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
                    ))
                )}
            </div>
        </div>
    )
}
