"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CreditCard, Calendar, Store } from 'lucide-react'

export default function NezioPage() {
    const { state, dispatch } = useApp()
    const [form, setForm] = useState({
        description: '',
        establishment: '',
        date: new Date().toISOString().split('T')[0],
        totalValue: '',
        installments: '1'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const total = parseFloat(form.totalValue)
        const count = parseInt(form.installments)
        const valParcela = total / count

        // Last Installment Date (approx)
        const date = new Date(form.date)
        date.setMonth(date.getMonth() + count)

        const purchase = {
            id: Math.random().toString(36).substr(2, 9),
            date: form.date,
            description: form.description,
            establishment: form.establishment,
            amount: valParcela, // value per installment
            totalAmount: total,
            totalInstallments: count,
            installmentIndex: 0, // not used directly, calculated dynamically
            status: 'pending', // 'paid' if completed
            lastInstallmentDate: date.toISOString().split('T')[0]
        }

        // @ts-ignore - Bypass type mismatch for quick proto if strict types complain about exact NezioInstallment shape
        dispatch({ type: 'ADD_NEZIO', payload: purchase })
        setForm({ ...form, description: '', totalValue: '', installments: '1', establishment: '' })
    }

    const getStatus = (purchase: any) => {
        const start = new Date(purchase.date)
        const now = new Date()

        // Months passed since purchase
        const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())

        // Ensure within bounds
        let paidCount = monthDiff
        if (paidCount < 0) paidCount = 0
        if (paidCount > purchase.totalInstallments) paidCount = purchase.totalInstallments

        const remaining = purchase.totalInstallments - paidCount

        return { paidCount, remaining }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CreditCard className="text-yellow-500" /> Cartão Nézio
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit">
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Estabelecimento"
                                value={form.establishment}
                                onChange={e => setForm({ ...form, establishment: e.target.value })}
                                placeholder="Loja X"
                                required
                            />
                            <Input
                                label="Descrição / Motivo"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Compra de Roupas"
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Valor Total (R$)"
                                    type="number"
                                    step="0.01"
                                    value={form.totalValue}
                                    onChange={e => setForm({ ...form, totalValue: e.target.value })}
                                    placeholder="1000.00"
                                    required
                                />
                                <Input
                                    label="Qtd Parcelas"
                                    type="number"
                                    value={form.installments}
                                    onChange={e => setForm({ ...form, installments: e.target.value })}
                                    placeholder="10"
                                    required
                                />
                            </div>
                            <Input
                                label="Data da Compra"
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />

                            {form.totalValue && form.installments && (
                                <div className="p-3 bg-white/5 rounded text-sm text-center">
                                    Valor da Parcela: <span className="font-bold text-yellow-500">R$ {(parseFloat(form.totalValue) / parseInt(form.installments)).toFixed(2)}</span>
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 border-yellow-500/20 text-black">
                                Registrar Compra
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardTitle>Fatura e Parcelamentos</CardTitle>
                    <CardContent className="mt-4">
                        <div className="space-y-3">
                            {state.nezioInstallments.map((p: any) => {
                                const { paidCount, remaining } = getStatus(p)
                                const isPaid = remaining === 0

                                return (
                                    <div key={p.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-white text-lg">{p.establishment}</h4>
                                                <p className="text-sm text-slate-400">{p.description}</p>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {isPaid ? 'QUITADO' : 'PENDENTE'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm mt-3">
                                            <div className="flex items-center gap-1 text-slate-300">
                                                <Calendar size={14} />
                                                {new Date(p.date).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="text-slate-300">
                                                Total: <span className="text-white">R$ {p.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs mb-1 text-slate-400">
                                                <span>Progresso ({paidCount}/{p.totalInstallments})</span>
                                                <span className="text-yellow-500 font-bold">R$ {p.amount.toFixed(2)} / mês</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-yellow-500 h-full transition-all duration-500"
                                                    style={{ width: `${(paidCount / p.totalInstallments) * 100}%` }}
                                                />
                                            </div>
                                            <div className="mt-2 text-xs text-right text-slate-500">
                                                Faltam {remaining} parcelas
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
