"use client"
import React, { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Plus, Trash2, ArrowDownRight, CheckCircle2, Clock, AlertCircle, Calendar, Pencil } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { cn } from '@/lib/utils'

export default function ExpensesPage() {
    const { state, dispatch } = useApp()
    const [editingId, setEditingId] = useState<string | null>(null)

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

        const payload = {
            id: editingId || crypto.randomUUID(),
            date: date,
            description: desc,
            amount: parseFloat(amount),
            type: 'expense' as const,
            category: category || 'Outros',
            status: status,
            isFixed: type === 'fixed'
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
        setDate(new Date().toISOString().slice(0, 10))
    }

    const handleEdit = (t: any) => {
        setEditingId(t.id)
        setDesc(t.description)
        setAmount(t.amount.toString())
        setDate(t.date)
        setCategory(t.category || '')
        setType(t.isFixed ? 'fixed' : 'variable')
        setStatus(t.status)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handlePay = (t: any) => {
        dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...t, status: 'paid' } })
    }

    const handleDelete = (id: string) => {
        if (confirm('Excluir esta despesa?')) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id })
        }
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
                    <h2 className="text-3xl font-bold tracking-tight text-white">Saídas</h2>
                    <p className="text-muted-foreground">Controle de despesas, fixas e variáveis.</p>
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

            <Card className={cn(editingId && "border-red-500/50 ring-1 ring-red-500/20 shadow-lg transition-all")}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</CardTitle>
                    {editingId && (
                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setDesc(''); setAmount(''); setCategory(''); }}>
                            Cancelar
                        </Button>
                    )}
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
                        <Button onClick={handleAdd} className={cn("md:col-span-6 w-full font-bold", editingId ? "bg-primary" : "bg-red-600 hover:bg-red-700")}>
                            {editingId ? 'Salvar Alterações' : <> <Plus size={16} className="mr-2" /> Registrar Saída </>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <FilterBar
                categories={categories}
                filters={filters}
                onFilterChange={setFilters}
                showStatus={true}
                showDate={false}
            />

            <div className="space-y-4">
                {filteredData.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground font-medium">Nenhuma despesa encontrada.</div>
                ) : (
                    filteredData.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-card rounded-xl border border-white/5 shadow-sm group hover:border-red-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center border",
                                    t.status === 'paid' ? "bg-zinc-800 border-zinc-700 text-zinc-400" :
                                        t.status === 'overdue' ? "bg-red-900/20 border-red-900 text-red-500" :
                                            "bg-yellow-900/20 border-yellow-900 text-yellow-500"
                                )}>
                                    <ArrowDownRight size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{t.description}</p>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        <Calendar size={12} />
                                        <span>{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                        <span>•</span>
                                        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-lg">{t.category}</span>
                                        {t.isFixed && <span className="text-blue-400 font-bold text-[10px] tracking-tighter uppercase">FIXA</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="text-lg font-black text-red-500 tracking-tight">- R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <div className="text-[10px] flex justify-end font-bold uppercase tracking-wider mt-0.5">
                                        {t.status === 'paid' && <span className="flex items-center text-green-500"><CheckCircle2 size={10} className="mr-1" /> Paga</span>}
                                        {t.status === 'pending' && <span className="flex items-center text-yellow-500"><Clock size={10} className="mr-1" /> Agendada</span>}
                                        {t.status === 'overdue' && <span className="flex items-center text-red-500"><AlertCircle size={10} className="mr-1" /> Atrasada</span>}
                                    </div>
                                </div>

                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {t.status === 'pending' && (
                                        <Button size="sm" variant="outline" className="h-8 text-xs px-2" onClick={() => handlePay(t)}>
                                            Pagar
                                        </Button>
                                    )}
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
