"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CreditCard, Calendar, Store, Pencil, Trash2 } from 'lucide-react'

export default function NezioPage() {
    const { state, dispatch } = useApp()
    const [editingId, setEditingId] = useState<string | null>(null)
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

        const dateObj = new Date(form.date)
        const lastDate = new Date(dateObj.getFullYear(), dateObj.getMonth() + count - 1, 20)

        const purchase = {
            id: editingId || Math.random().toString(36).substr(2, 9),
            date: form.date,
            description: form.description,
            establishment: form.establishment,
            amount: valParcela,
            totalAmount: total,
            totalInstallments: count,
            installmentIndex: 0,
            status: 'pending' as const,
            lastInstallmentDate: lastDate.toISOString().split('T')[0]
        }

        if (editingId) {
            dispatch({ type: 'UPDATE_NEZIO', payload: purchase })
            setEditingId(null)
        } else {
            dispatch({ type: 'ADD_NEZIO', payload: purchase })
        }

        setForm({ ...form, description: '', totalValue: '', installments: '1', establishment: '' })
    }

    const handleEdit = (p: any) => {
        setEditingId(p.id)
        setForm({
            description: p.description,
            establishment: p.establishment,
            date: p.date,
            totalValue: p.totalAmount.toString(),
            installments: p.totalInstallments.toString()
        })
    }

    const handleDelete = (id: string) => {
        if (confirm('Deseja realmente excluir este lançamento?')) {
            dispatch({ type: 'DELETE_NEZIO', payload: id })
        }
    }

    const getStatus = (purchase: any) => {
        const start = new Date(purchase.date)
        const now = new Date()
        const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
        let paidCount = monthDiff
        if (paidCount < 0) paidCount = 0
        if (paidCount > purchase.totalInstallments) paidCount = purchase.totalInstallments
        const remaining = purchase.totalInstallments - paidCount
        return { paidCount, remaining }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-yellow-500" /> Cartão Nézio
                </h2>
                {editingId && (
                    <Button variant="outline" size="sm" onClick={() => { setEditingId(null); setForm({ ...form, description: '', totalValue: '', installments: '1', establishment: '' }) }}>
                        Cancelar Edição
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit border-yellow-500/20">
                    <CardHeader>
                        <CardTitle>Resumo da Fatura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(() => {
                            const now = new Date();
                            const currentMonthKey = new Date(now.getFullYear(), now.getMonth(), 20).toISOString().slice(0, 10);
                            const nextMonthKey = new Date(now.getFullYear(), now.getMonth() + 1, 20).toISOString().slice(0, 10);

                            const getFaturaTotal = (dateStr: string) => {
                                let total = 0;
                                state.nezioInstallments.forEach(p => {
                                    const start = new Date(p.date);
                                    // Calculate if this purchase has an installment on this specific day 20
                                    const targetDate = new Date(dateStr);
                                    const diffMonths = (targetDate.getFullYear() - start.getFullYear()) * 12 + (targetDate.getMonth() - start.getMonth());
                                    if (diffMonths >= 0 && diffMonths < p.totalInstallments) {
                                        total += p.amount;
                                    }
                                });
                                return total;
                            };

                            const currentTotal = getFaturaTotal(currentMonthKey);
                            const nextTotal = getFaturaTotal(nextMonthKey);

                            const handleScheduleFatura = () => {
                                if (currentTotal <= 0) return;
                                dispatch({
                                    type: 'ADD_TRANSACTION',
                                    payload: {
                                        id: `nezio-pay-${currentMonthKey}`,
                                        description: `Pagamento Consolidado Cartão Nézio`,
                                        amount: currentTotal,
                                        date: currentMonthKey,
                                        type: 'expense',
                                        category: 'Cartão de Crédito',
                                        status: 'pending'
                                    }
                                });
                                alert('Pagamento consolidado agendado para o dia 20!');
                            };

                            return (
                                <>
                                    <div className="p-4 bg-zinc-900 border border-white/5 rounded-xl">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Vencimento 20/{now.getMonth() + 1}</p>
                                        <p className="text-2xl font-black text-white">R$ {currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <Button
                                        onClick={handleScheduleFatura}
                                        disabled={currentTotal <= 0}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-xs py-2 h-auto"
                                    >
                                        Agendar Pagamento Único (Dia 20)
                                    </Button>
                                    <div className="p-4 bg-zinc-900/50 border border-white/5 rounded-xl">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Vencimento Próximo Mês</p>
                                        <p className="text-xl font-bold text-zinc-400">R$ {nextTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 italic px-1">Lembre-se: O pagamento consolidado no dia 20 evita juros e multas.</p>
                                </>
                            );
                        })()}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1 h-fit border-white/10">
                    <CardHeader>
                        <CardTitle>{editingId ? 'Editar Compra' : 'Nova Compra'}</CardTitle>
                    </CardHeader>
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
                                <div className="p-3 bg-yellow-500/10 rounded-lg text-sm text-center border border-yellow-500/20">
                                    Valor da Parcela: <span className="font-bold text-yellow-500">R$ {(parseFloat(form.totalValue) / parseInt(form.installments)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}

                            <Button type="submit" className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                                {editingId ? 'Salvar Alterações' : 'Registrar Compra'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Fatura e Parcelamentos</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <div className="space-y-4">
                            {state.nezioInstallments.length === 0 && (
                                <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
                                    Nenhuma compra parcelada registrada.
                                </div>
                            )}
                            {state.nezioInstallments.map((p: any) => {
                                const { paidCount, remaining } = getStatus(p)
                                const isPaid = remaining === 0

                                return (
                                    <div key={p.id} className="p-5 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-white text-lg leading-tight">{p.establishment}</h4>
                                                <p className="text-sm text-slate-400">{p.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {isPaid ? 'QUITADO' : 'PENDENTE'}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(p)}
                                                        className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10"
                                                    >
                                                        <Pencil size={14} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(p.id)}
                                                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-xs text-zinc-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-yellow-500" />
                                                {new Date(p.date).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div>
                                                Total: <span className="text-white font-medium">R$ {p.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            <div className="ml-auto text-yellow-500 font-bold text-sm">
                                                R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / mês
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-[10px] mb-1.5 text-slate-500 uppercase font-bold tracking-wider">
                                                <span>Progresso ({paidCount}/{p.totalInstallments})</span>
                                                <span>{remaining} parcelas restantes</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-yellow-500 h-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000"
                                                    style={{ width: `${(paidCount / p.totalInstallments) * 100}%` }}
                                                />
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
