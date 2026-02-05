"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { AlertTriangle, Handshake, CheckCircle } from 'lucide-react'

export default function DividaPage() {
    const { state, dispatch } = useApp()
    const [form, setForm] = useState({
        name: '',
        totalValue: '',
        installments: '1',
        installmentValue: '',
        status: 'aguardando'
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Auto calc total if installment value provided, or vice versa? 
        // User said "Valor Parcela, Qtd Parcela, Total (automático)"
        const parcVal = parseFloat(form.installmentValue)
        const qtd = parseInt(form.installments)
        const total = parcVal * qtd // Auto Calc

        dispatch({
            type: 'ADD_DEBT',
            payload: {
                id: Math.random().toString(36),
                name: form.name,
                installmentValue: parcVal,
                installments: qtd,
                totalValue: total,
                status: form.status as any
            }
        })
        setForm({ name: '', totalValue: '', installments: '1', installmentValue: '', status: 'aguardando' })
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="text-orange-500" /> Gestão de Dívidas
            </h2>

            <Card>
                <CardContent>
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-6">
                        <p className="text-sm text-orange-200">
                            Use esta área para arquivar dívidas antigas até ter oportunidade de renegociar.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <Input
                            label="Nome da Dívida"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Valor Parcela Orig."
                            type="number"
                            value={form.installmentValue}
                            onChange={e => setForm({ ...form, installmentValue: e.target.value })}
                            required
                        />
                        <Input
                            label="Qtd Parcelas"
                            type="number"
                            value={form.installments}
                            onChange={e => setForm({ ...form, installments: e.target.value })}
                            required
                        />
                        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 h-[46px]">
                            Arquivar Dívida
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.debts.map(debt => (
                    <Card key={debt.id} className="relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-2 text-xs font-bold ${debt.status === 'negociacao' ? 'bg-blue-500 text-white' : 'bg-orange-500/20 text-orange-500'}`}>
                            {debt.status === 'negociacao' ? 'EM NEGOCIAÇÃO' : 'AGUARDANDO'}
                        </div>
                        <CardContent className="pt-8">
                            <h3 className="text-xl font-bold text-white mb-1">{debt.name}</h3>
                            <p className="text-slate-400 text-sm mb-4">Original: {debt.installments}x de R$ {debt.installmentValue}</p>

                            <div className="flex items-end justify-between border-t border-white/5 pt-4">
                                <div>
                                    <p className="text-xs text-slate-500">Valor Total Original</p>
                                    <p className="text-2xl font-bold text-orange-500">R$ {debt.totalValue.toFixed(2)}</p>
                                </div>
                                <Button variant="secondary" className="gap-2 text-xs h-8">
                                    <Handshake size={14} /> Renegociar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
