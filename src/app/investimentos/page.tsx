"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { PieChart, TrendingUp, Wallet } from 'lucide-react'

export default function InvestimentosPage() {
    const { state, dispatch } = useApp()
    const [form, setForm] = useState({
        type: 'CDB',
        institution: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.amount) return

        dispatch({
            type: 'ADD_INVESTMENT',
            payload: {
                id: Math.random().toString(36),
                ...form,
                amount: parseFloat(form.amount),
                type: form.type as any
            }
        })
        setForm({ ...form, amount: '', institution: '' })
    }

    const totalInvested = state.investments.reduce((acc, curr) => acc + curr.amount, 0)

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <PieChart className="text-purple-500" /> Investimentos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Summary Card */}
                <Card className="md:col-span-3 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/20">
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-purple-300 mb-1">Total Investido</p>
                            <h3 className="text-4xl font-bold text-white">R$ {totalInvested.toFixed(2)}</h3>
                        </div>
                        <Wallet className="w-12 h-12 text-purple-500" />
                    </CardContent>
                </Card>

                <Card className="h-fit">
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Select
                                label="Tipo de Aplicação"
                                options={[
                                    { label: 'CDB', value: 'CDB' },
                                    { label: 'Ação', value: 'Ação' },
                                    { label: 'FIIs', value: 'FIIs' },
                                    { label: 'Bitcoin (BTC)', value: 'BTC' },
                                    { label: 'Outro', value: 'Outro' }
                                ]}
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                            />
                            <Input
                                label="Instituição / Corretora"
                                value={form.institution}
                                onChange={e => setForm({ ...form, institution: e.target.value })}
                                placeholder="Ex: NuInvest"
                                required
                            />
                            <Input
                                label="Valor Aplicado (R$)"
                                type="number"
                                step="0.01"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                placeholder="0,00"
                                required
                            />
                            <Input
                                label="Data da Aplicação"
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />

                            <Button type="submit" className="w-full mt-4 bg-purple-600 hover:bg-purple-700 border-purple-500/20">
                                Registrar Aplicação
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardTitle>Carteira de Ativos</CardTitle>
                    <CardContent className="mt-4">
                        <div className="space-y-3">
                            {state.investments.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-purple-500/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                                            {inv.type}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{inv.institution}</p>
                                            <p className="text-xs text-slate-400">{new Date(inv.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">R$ {inv.amount.toFixed(2)}</p>
                                        <p className="text-xs text-green-400 flex items-center gap-1 justify-end">
                                            <TrendingUp size={12} /> Ativo
                                        </p>
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
