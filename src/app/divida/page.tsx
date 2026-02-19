"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { AlertTriangle, Handshake, CheckCircle, Calendar, Trash2, X, Pencil } from 'lucide-react'
import { cn, formatDate, getTodayISO } from '@/lib/utils'

export default function DividaPage() {
    const { state, dispatch } = useApp()
    const [isRenegotiating, setIsRenegotiating] = useState<string | null>(null)
    const [form, setForm] = useState({
        name: '',
        installmentValue: '',
        installments: '1',
        firstPaymentDate: getTodayISO()
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const parcVal = parseFloat(form.installmentValue)
        const qtd = parseInt(form.installments)
        const total = parcVal * qtd

        // 1. Create the debt entry (or update)
        const newDebt = {
            id: isRenegotiating || Math.random().toString(36).substr(2, 9),
            name: form.name,
            installmentValue: parcVal,
            installments: qtd,
            totalValue: total,
            firstPaymentDate: form.firstPaymentDate,
            status: isRenegotiating ? 'negociacao' : 'aguardando'
        }

        if (isRenegotiating) {
            dispatch({ type: 'UPDATE_DEBT', payload: newDebt as any })

            // 2. Automatically schedule installments as transactions
            const startDate = new Date(form.firstPaymentDate)
            for (let i = 0; i < qtd; i++) {
                const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, startDate.getDate())
                dispatch({
                    type: 'ADD_TRANSACTION',
                    payload: {
                        id: crypto.randomUUID(),
                        date: dueDate.toISOString().slice(0, 10),
                        description: `Acordo ${form.name} (${i + 1}/${qtd})`,
                        amount: parcVal,
                        type: 'expense',
                        category: 'Dívida',
                        status: 'pending',
                        isFixed: false
                    }
                })
            }
            setIsRenegotiating(null)
        } else {
            dispatch({ type: 'ADD_DEBT', payload: newDebt as any })
        }

        setForm({ name: '', installmentValue: '', installments: '1', firstPaymentDate: getTodayISO() })
    }

    const startRenegotiation = (debt: any) => {
        setIsRenegotiating(debt.id)
        setForm({
            name: debt.name,
            installmentValue: debt.installmentValue.toString(),
            installments: debt.installments.toString(),
            firstPaymentDate: getTodayISO()
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = (id: string) => {
        if (confirm('Excluir esta dívida da base?')) {
            dispatch({ type: 'DELETE_DEBT', payload: id })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <AlertTriangle className="text-orange-500 h-8 w-8" /> Gestão de Dívidas
                </h2>
                {isRenegotiating && (
                    <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsRenegotiating(null)}>
                        <X size={20} className="mr-2" /> Cancelar Renegociação
                    </Button>
                )}
            </div>

            <Card className={cn("transition-all", isRenegotiating ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-500/5 shadow-2xl" : "border-white/5")}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {isRenegotiating ? <Handshake className="text-orange-500" /> : <AlertTriangle className="text-orange-400" />}
                        {isRenegotiating ? `Renegociar: ${form.name}` : 'Registrar Nova Dívida'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="md:col-span-1">
                                <Input
                                    label="Credor / Instituição"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: Banco X, Vizinho..."
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Valor da Parcela (R$)"
                                    type="number"
                                    step="0.01"
                                    value={form.installmentValue}
                                    onChange={e => setForm({ ...form, installmentValue: e.target.value })}
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Quantidade de Parcelas"
                                    type="number"
                                    value={form.installments}
                                    onChange={e => setForm({ ...form, installments: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Data da Primeira Parcela"
                                    type="date"
                                    value={form.firstPaymentDate}
                                    onChange={e => setForm({ ...form, firstPaymentDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-zinc-900 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Total Geral (Calculado)</p>
                                <p className="text-3xl font-black text-white">R$ {(parseFloat(form.installmentValue || '0') * parseInt(form.installments || '0')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <Button type="submit" className={cn("w-full md:w-auto h-12 px-8 text-lg font-bold transition-all", isRenegotiating ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-white text-black hover:bg-zinc-200")}>
                                {isRenegotiating ? 'Confirmar Acordo e Lançar Parcelas' : 'Registrar para Futura Renegociação'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <h3 className="text-xl font-bold text-white mt-10 mb-4 flex items-center gap-2">
                <CheckCircle className="text-zinc-500" size={20} /> Dívidas em Aberto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.debts.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                        Nenhuma dívida arquivada. Que bom!
                    </div>
                )}
                {state.debts.map(debt => (
                    <Card key={debt.id} className="relative overflow-hidden group hover:border-orange-500/30 transition-all bg-card/60 backdrop-blur-sm">
                        <div className={cn(
                            "absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-lg shadow-sm",
                            debt.status === 'negociacao' ? 'bg-green-500 text-black' : 'bg-orange-500 text-black'
                        )}>
                            {debt.status === 'negociacao' ? 'ACORDADO' : 'PENDENTE'}
                        </div>

                        <CardContent className="pt-8 pb-6">
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{debt.name}</h3>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-6">
                                <Calendar size={12} />
                                <span>{debt.installments} parcelas de R$ {debt.installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Vence {formatDate(debt.firstPaymentDate)})</span>
                            </div>

                            <div className="flex items-end justify-between border-t border-white/5 pt-5">
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter">TOTAL DA DÍVIDA</p>
                                    <p className="text-2xl font-black text-white">R$ {debt.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => startRenegotiation(debt)}
                                        className="h-9 w-9 text-orange-400 hover:text-orange-500 hover:bg-orange-500/10"
                                    >
                                        <Pencil size={18} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(debt.id)}
                                        className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
