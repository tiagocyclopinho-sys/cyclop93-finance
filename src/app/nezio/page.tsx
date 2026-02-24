"use client"
import { useState } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CreditCard, Calendar, Store, Pencil, Trash2 } from 'lucide-react'
import { formatDate, getTodayISO, cn } from '@/lib/utils'

export default function NezioPage() {
    const { state, dispatch } = useApp()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        description: '',
        establishment: '',
        date: getTodayISO(),
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

    const [showArchived, setShowArchived] = useState(false)
    const [filterStart, setFilterStart] = useState('')
    const [filterEnd, setFilterEnd] = useState('')

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

    const filteredSpend = state.nezioInstallments.filter(p => {
        if (!filterStart && !filterEnd) return true
        const pDate = new Date(p.date)
        const start = filterStart ? new Date(filterStart) : new Date('1900-01-01')
        const end = filterEnd ? new Date(filterEnd) : new Date('2100-12-31')
        return pDate >= start && pDate <= end
    }).reduce((acc, p) => acc + p.totalAmount, 0)

    const activeInstallments = state.nezioInstallments.filter(p => getStatus(p).remaining > 0)
    const archivedInstallments = state.nezioInstallments.filter(p => getStatus(p).remaining === 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-yellow-500" /> Cartão Nézio
                </h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-zinc-900 border border-white/5 p-1 rounded-lg">
                        <input
                            type="date"
                            value={filterStart}
                            onChange={e => setFilterStart(e.target.value)}
                            className="bg-transparent text-[10px] text-zinc-300 outline-none p-1"
                        />
                        <span className="text-zinc-600 text-[10px]">até</span>
                        <input
                            type="date"
                            value={filterEnd}
                            onChange={e => setFilterEnd(e.target.value)}
                            className="bg-transparent text-[10px] text-zinc-300 outline-none p-1"
                        />
                        <div className="px-3 border-l border-white/10 ml-1">
                            <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-tighter">Gasto no Período</p>
                            <p className="text-xs font-black text-white">R$ {filteredSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    {editingId && (
                        <Button variant="outline" size="sm" onClick={() => { setEditingId(null); setForm({ ...form, description: '', totalValue: '', installments: '1', establishment: '', date: getTodayISO() }) }}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit border-yellow-500/20">
                    <CardHeader>
                        <CardTitle>Resumo da Fatura</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(() => {
                            const now = new Date();
                            const getFaturaTotal = (dateStr: string) => {
                                let total = 0;
                                state.nezioInstallments.forEach(p => {
                                    // Robust cut-off logic: purchases until day 20 fall in the current month's invoice
                                    const [pYear, pMonth, pDay] = p.date.split('-').map(Number);
                                    const [tYear, tMonth] = dateStr.split('-').map(Number);

                                    let firstInvYear = pYear;
                                    let firstInvMonth = pMonth;

                                    if (pDay > 20) {
                                        firstInvMonth++;
                                        if (firstInvMonth > 12) {
                                            firstInvMonth = 1;
                                            firstInvYear++;
                                        }
                                    }

                                    const diffMonths = (tYear - firstInvYear) * 12 + (tMonth - firstInvMonth);

                                    if (diffMonths >= 0 && diffMonths < p.totalInstallments) {
                                        total += p.amount;
                                    }
                                });
                                return total;
                            };

                            const getInvoiceKey = (year: number, month: number) => {
                                const m = String(month + 1).padStart(2, '0');
                                return `${year}-${m}-20`;
                            };

                            const currentMonthKey = getInvoiceKey(now.getFullYear(), now.getMonth());
                            const nextMonthKey = getInvoiceKey(
                                now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear(),
                                (now.getMonth() + 1) % 12
                            );

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
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1 text-primary">Vencimento {formatDate(currentMonthKey)}</p>
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
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Vencimento {formatDate(nextMonthKey)}</p>
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
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle>Faturas e Parcelamentos</CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowArchived(false)}
                                className={cn("text-[10px] font-bold px-3", !showArchived ? "bg-yellow-500/10 text-yellow-500" : "text-zinc-500")}
                            >
                                PENDENTES ({activeInstallments.length})
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowArchived(true)}
                                className={cn("text-[10px] font-bold px-3", showArchived ? "bg-green-500/10 text-green-500" : "text-zinc-500")}
                            >
                                QUITADOS ({archivedInstallments.length})
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <div className="space-y-4">
                            {(showArchived ? archivedInstallments : activeInstallments).length === 0 && (
                                <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
                                    {showArchived ? 'Nenhum item quitado.' : 'Nenhuma compra parcelada registrada.'}
                                </div>
                            )}
                            {(showArchived ? archivedInstallments : activeInstallments).map((p: any) => {
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
                                                {formatDate(p.date)}
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

