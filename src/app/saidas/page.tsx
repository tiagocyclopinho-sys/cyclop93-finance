"use client"
import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useApp } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Plus, Trash2, ArrowDownRight, CheckCircle2, Clock, AlertCircle, Calendar, Pencil } from 'lucide-react'
import { FilterBar } from '@/components/ui/FilterBar'
import { cn, formatDate, getTodayISO } from '@/lib/utils'

export default function ExpensesPage() {
    const { state, dispatch } = useApp()
    const [editingId, setEditingId] = useState<string | null>(null)

    // New Expense State
    const [desc, setDesc] = useState('')
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(getTodayISO())
    const [category, setCategory] = useState('')
    const [type, setType] = useState('variable') // fixed or variable
    const [status, setStatus] = useState<any>('paid')

    // Filter State
    const [filters, setFilters] = useState<any>(() => {
        const now = new Date();
        const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
        return {
            startDate: start,
            endDate: '',
            category: '',
            status: '',
            sortBy: 'date-desc'
        }
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
        setDate(getTodayISO())
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
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-green-500/5 border-green-500/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Total Pago</p>
                        <p className="text-2xl font-black text-green-500">
                            R$ {state.transactions
                                .filter(t => t.type === 'expense' && t.status === 'paid')
                                .reduce((acc, t) => acc + t.amount, 0)
                                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-yellow-500/5 border-yellow-500/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Total Pendente</p>
                        <p className="text-2xl font-black text-yellow-500">
                            R$ {state.transactions
                                .filter(t => t.type === 'expense' && t.status === 'pending')
                                .reduce((acc, t) => acc + t.amount, 0)
                                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </CardContent>
                </Card>
                <Link href="/nezio" className="block text-right">
                    <Card className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                        <CardContent className="p-4">
                            <p className="text-[10px] text-blue-400 font-bold uppercase mb-1 tracking-widest">Nézio (Saldo Devedor)</p>
                            <p className="text-2xl font-black text-white">
                                R$ {state.nezioInstallments
                                    .filter(t => t.status === 'pending')
                                    .reduce((acc, t) => acc + t.amount, 0)
                                    .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
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
                                        <span>{formatDate(t.date)}</span>
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

                                <div className="flex gap-2">
                                    {t.status === 'pending' && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-green-500 hover:bg-green-500/10"
                                            onClick={() => handlePay(t)}
                                            title="Marcar como Pago"
                                        >
                                            <CheckCircle2 size={16} />
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
