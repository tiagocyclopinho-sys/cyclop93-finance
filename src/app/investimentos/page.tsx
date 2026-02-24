"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { PieChart, TrendingUp, Wallet, ArrowDownCircle, Trash2, Plus, ArrowUpRight, Pencil, X } from 'lucide-react'
import { cn, formatDate, getTodayISO } from '@/lib/utils'

export default function InvestimentosPage() {
    const { state, dispatch } = useApp()
    const [isRescuing, setIsRescuing] = useState<string | null>(null)
    const [rescueAmount, setRescueAmount] = useState('')

    const [form, setForm] = useState({
        type: 'CDB',
        institution: '',
        amount: '',
        date: getTodayISO()
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.amount) return

        const amountValue = parseFloat(form.amount)

        // 1. Add Investment
        dispatch({
            type: 'ADD_INVESTMENT',
            payload: {
                id: Math.random().toString(36).substr(2, 9),
                ...form,
                amount: amountValue,
                type: form.type as any
            }
        })

        // 2. Add Expense Transaction to discount from Saldo Atual
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                id: crypto.randomUUID(),
                date: form.date,
                description: `Aporte ${form.type} (${form.institution})`,
                amount: amountValue,
                type: 'expense',
                category: 'Investimentos',
                status: 'paid'
            }
        })

        setForm({ ...form, amount: '', institution: '', date: getTodayISO() })
    }

    const handleRescue = (inv: any) => {
        const amountToRescue = parseFloat(rescueAmount)
        if (isNaN(amountToRescue) || amountToRescue <= 0 || amountToRescue > inv.amount) {
            alert('Valor de resgate inválido ou superior ao saldo do ativo.')
            return
        }

        // 1. Create Income Transaction
        dispatch({
            type: 'ADD_TRANSACTION',
            payload: {
                id: crypto.randomUUID(),
                date: getTodayISO(),
                description: `Resgate ${inv.type} (${inv.institution})`,
                amount: amountToRescue,
                type: 'income',
                category: 'Investimentos',
                status: 'paid'
            }
        })

        // 2. Update or Remove Investment
        if (amountToRescue === inv.amount) {
            dispatch({ type: 'DELETE_INVESTMENT', payload: inv.id })
        } else {
            dispatch({
                type: 'UPDATE_INVESTMENT',
                payload: { ...inv, amount: inv.amount - amountToRescue }
            })
        }

        setIsRescuing(null)
        setRescueAmount('')
    }

    const handleDelete = (id: string) => {
        if (confirm('Deseja excluir este registro de investimento? (Não afetará seu saldo)')) {
            dispatch({ type: 'DELETE_INVESTMENT', payload: id })
        }
    }

    const totalInvested = state.investments.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <PieChart className="text-purple-500 h-8 w-8" /> Investimentos
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-3 bg-gradient-to-br from-purple-900/40 via-blue-900/10 to-transparent border-purple-500/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] -mr-32 -mt-32" />
                    <CardContent className="flex items-center justify-between p-8 relative z-10">
                        <div>
                            <p className="text-purple-300 font-bold uppercase tracking-widest text-xs mb-2">Patrimônio em Ativos</p>
                            <h3 className="text-5xl font-black text-white tracking-tighter">
                                R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex items-center gap-2 mt-4 text-green-400 text-sm font-bold bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
                                <TrendingUp size={16} /> +2.4% este mês (estimado)
                            </div>
                        </div>
                        <Wallet className="w-20 h-20 text-purple-500/30" />
                    </CardContent>
                </Card>

                <Card className="h-fit border-white/5">
                    <CardHeader>
                        <CardTitle>Nova Aplicação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Select
                                label="Tipo de Ativo"
                                options={[
                                    { label: 'CDB (Renda Fixa)', value: 'CDB' },
                                    { label: 'Ações (Renda Variável)', value: 'Ação' },
                                    { label: 'FIIs (Fundos Imob.)', value: 'FIIs' },
                                    { label: 'Cripto (Bitcoin/ETH)', value: 'BTC' },
                                    { label: 'Outros / Reserva', value: 'Outro' }
                                ]}
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            />
                            <Input
                                label="Instituição"
                                value={form.institution}
                                onChange={e => setForm({ ...form, institution: e.target.value })}
                                placeholder="Ex: NuInvest, Binance..."
                                required
                            />
                            <Input
                                label="Valor do Aporte (R$)"
                                type="number"
                                step="0.01"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder="0,00"
                                required
                            />
                            <Input
                                label="Data"
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />

                            <Button type="submit" className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2">
                                <Plus size={18} /> Registrar Aporte
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-white/5">
                    <CardHeader>
                        <CardTitle>Carteira de Ativos</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-2">
                        <div className="space-y-4">
                            {state.investments.length === 0 && (
                                <div className="text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                                    Nenhum investimento registrado. Use o formulário para começar.
                                </div>
                            )}
                            {state.investments.map(inv => (
                                <div key={inv.id} className="p-5 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all flex flex-col gap-4 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black text-xs">
                                                {inv.type}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-lg">{inv.institution}</p>
                                                <p className="text-xs text-zinc-500 font-medium">{formatDate(inv.date)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-white tracking-tighter">
                                                R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            {isRescuing !== inv.id ? (
                                                <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setIsRescuing(inv.id)}
                                                        className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                                        title="Resgatar / Vender / Retirar"
                                                    >
                                                        <ArrowDownCircle size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(inv.id)}
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                        title="Excluir Registro"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-end gap-2 mt-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            className="h-8 w-28 bg-zinc-800 border border-purple-500/30 rounded-lg text-xs font-bold text-white focus:ring-1 focus:ring-purple-500 px-2"
                                                            placeholder="Valor do Resgate"
                                                            value={rescueAmount}
                                                            onChange={(e) => setRescueAmount(e.target.value)}
                                                        />
                                                        <Button size="sm" onClick={() => handleRescue(inv)} className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase px-3">Confirmar</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setIsRescuing(null)} className="h-8 text-zinc-500 hover:text-white px-2"><X size={14} /></Button>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 font-medium italic">Valor será creditado no Saldo Atual</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-purple-500 h-full w-[100%] transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}


