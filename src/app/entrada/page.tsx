"use client"
import React, { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Plus, Trash2, ArrowUpRight, Calendar, Pencil } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { cn, formatDate, getTodayISO } from '@/lib/utils'

export default function IncomePage() {
    const { state, dispatch } = useApp()
    const [editingId, setEditingId] = useState<string | null>(null)

    // New Income State
    const [desc, setDesc] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(getTodayISO())
    const [category, setCategory] = useState('')

    // Filter State
    const [filters, setFilters] = useState<any>(() => {
        const now = new Date();
        const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        return {
            startDate: start,
            endDate: '',
            category: '',
            sortBy: 'date-desc'
        }
    })

    const categories = ['Salário', 'Ajuda de Custo', 'Aluguel', 'Freelance', 'Vendas', 'Outros']

    const handleAdd = () => {
        if (!desc || !amount) return

        const payload = {
            id: editingId || crypto.randomUUID(),
            date: date,
            description: desc,
            amount: parseFloat(amount),
            type: 'income' as const,
            category: category || 'Outros',
            status: 'paid' as const
        }

        if (editingId) {
            dispatch({ type: 'UPDATE_TRANSACTION', payload })
            setEditingId(null)
        } else {
            dispatch({ type: 'ADD_TRANSACTION', payload })
        }

        setDesc('')
        setAmount('')
        setCategory('')
        setDate(getTodayISO())
    }

    const handleEdit = (t: any) => {
        setEditingId(t.id)
        setDesc(t.description)
        setAmount(t.amount.toString())
        setDate(t.date)
        setCategory(t.category || '')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = (id: string) => {
        if (confirm('Excluir esta entrada?')) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id })
        }
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

            <Card className={cn(editingId && "border-primary ring-1 ring-primary/20 shadow-lg transition-all")}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{editingId ? 'Editar Receita' : 'Nova Receita'}</CardTitle>
                    {editingId && (
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setDesc(''); setAmount(''); setCategory(''); }}>
                            Cancelar
                        </Button>
                    )}
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
                            <Button onClick={handleAdd} className={cn("mt-auto mb-2", editingId ? "bg-primary" : "bg-green-600 hover:bg-green-700")}>
                                {editingId ? 'Salvar' : <Plus />}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <FilterBar
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
                showStatus={false}
                showDate={false}
            />

            <div className="space-y-4">
                {filteredData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground font-medium">Nenhuma receita encontrada.</div>
                ) : (
                    filteredData.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-white/5 shadow-sm group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/10">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{t.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <Calendar size={12} />
                                        <span>{formatDate(t.date)}</span>
                                        <span>•</span>
                                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg">{t.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-black text-green-500 tracking-tight">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(t)}
                                        className="h-8 w-8 text-zinc-400 hover:text-white"
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(t.id)}
                                        className="h-8 w-8 text-zinc-500 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
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
