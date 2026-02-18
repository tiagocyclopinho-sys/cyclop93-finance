"use client"
import { useApp } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Activity, CreditCard, Droplets, Calendar, PieChart, Filter, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useEffect, useState } from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Dashboard() {
  const { state, dispatch } = useApp()
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Filter transactions based on date range
  const filteredTransactions = useMemo(() => {
    if (!startDate && !endDate) return state.transactions

    return state.transactions.filter(t => {
      const txDate = new Date(t.date)
      const start = startDate ? new Date(startDate) : new Date('1900-01-01')
      const end = endDate ? new Date(endDate) : new Date('2100-12-31')
      return txDate >= start && txDate <= end
    })
  }, [state.transactions, startDate, endDate])

  const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount
      if (t.type === 'expense') acc.expense += t.amount
      return acc
    }, { income: 0, expense: 0 })
  }, [filteredTransactions])

  const balance = state.initialBalance + totals.income - totals.expense

  // Toggle date filter with Ctrl+Shift+F
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setShowDateFilter(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-zinc-400">Visão geral da sua saúde financeira.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/entrada">
            <Button className="bg-green-600 hover:bg-green-700">
              <TrendingUp className="mr-2 h-4 w-4" /> Nova Receita
            </Button>
          </Link>
          <Link href="/saidas">
            <Button>
              <TrendingDown className="mr-2 h-4 w-4" /> Nova Despesa
            </Button>
          </Link>
        </div>
      </div>

      {/* Toggle Filter Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={clsx("gap-2 transition-all", showDateFilter ? "bg-zinc-800 text-white" : "text-zinc-400 border-zinc-800")}
        >
          <Filter className="h-4 w-4" />
          {showDateFilter ? 'Ocultar Filtros' : 'Filtrar por Data'}
        </Button>
      </div>

      {/* Date Filter - Collapsible */}
      {showDateFilter && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-white">Filtro por Período</h3>
            <p className="text-xs text-zinc-500 ml-auto italic">Filtre suas receitas e despesas entre duas datas</p>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Data Inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Data Final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => {
            const agentBtn = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
            if (agentBtn) agentBtn.click();
            window.dispatchEvent(new CustomEvent('openAiAgent', {
              detail: { message: "Gostaria de sugestões de investimento para meu saldo disponível." }
            }));
          }}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Saldo Disponível</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={clsx("text-2xl font-bold", balance >= 0 ? "text-white" : "text-red-500")}>R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                <Activity size={10} className="text-primary" /> Sugestões AI disponíveis
              </p>
            </CardContent>
          </Card>
        </div>

        <Link href="/entrada" className="transition-transform hover:scale-[1.02]">
          <Card className="hover:bg-green-500/5 transition-colors border-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Entradas (Período)</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">R$ {totals.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {startDate || endDate ? 'Total filtrado' : 'Total acumulado'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/saidas" className="transition-transform hover:scale-[1.02]">
          <Card className="hover:bg-red-500/5 transition-colors border-red-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Saídas (Período)</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">R$ {totals.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {startDate || endDate ? 'Total filtrado' : 'Total acumulado'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/investimentos" className="transition-transform hover:scale-[1.02]">
          <Card className="hover:bg-blue-500/5 transition-colors border-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Investimentos</CardTitle>
              <PieChart className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">R$ {state.investments.reduce((a, b) => a + b.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <p className="text-xs text-zinc-500 mt-1">
                Patrimônio acumulado
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Area: Listas de Transações */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Últimas Transações (Now first as requested) */}
        <Card className="col-span-1 shadow-md border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Últimas Transações
            </CardTitle>
            <CardDescription>
              Histórico recente (filtrado).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions
                .filter(t => !t.status || t.status === 'paid')
                .slice(-6).reverse().map(t => (
                  <div key={t.id} className="flex items-center justify-between border-b border-zinc-800/50 pb-4 last:border-0 last:pb-0 group">
                    <div className="flex items-center gap-4">
                      <div className={clsx(
                        "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                        t.type === 'income' ? "border-green-900/30 bg-green-900/10 text-green-500" : "border-red-900/30 bg-red-900/10 text-red-500"
                      )}>
                        {t.type === 'income'
                          ? <ArrowUpRight className="h-5 w-5" />
                          : <ArrowDownRight className="h-5 w-5" />
                        }
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none text-white group-hover:text-primary transition-colors">{t.description}</p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}</p>
                      </div>
                    </div>
                    <div className={clsx("font-bold text-sm", t.type === 'income' ? "text-green-500" : "text-white")}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={t.type === 'income' ? '/entrada' : '/saidas'}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                          <Pencil size={14} />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Excluir esta transação?')) {
                            dispatch({ type: 'DELETE_TRANSACTION', payload: t.id });
                          }
                        }}
                        className="h-8 w-8 text-zinc-500 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              {filteredTransactions.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-sm border-2 border-dashed border-zinc-800 rounded-xl">Nenhuma movimentação no período.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card Agendamentos (Moved after transactions) */}
        <Card className="col-span-1 shadow-md border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-yellow-500 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Agendamentos
            </CardTitle>
            <CardDescription>
              Próximas contas a vencer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                ...state.transactions.filter(t => t.status === 'pending'),
                ...(() => {
                  const grouped: Record<string, { total: number, date: string }> = {};
                  state.nezioInstallments.forEach(p => {
                    const start = new Date(p.date);
                    for (let i = 0; i < p.totalInstallments; i++) {
                      const dueDate = new Date(start.getFullYear(), start.getMonth() + i, 20);
                      const key = dueDate.toISOString().slice(0, 10);
                      if (dueDate >= new Date()) {
                        if (!grouped[key]) grouped[key] = { total: 0, date: key };
                        grouped[key].total += p.amount;
                      }
                    }
                  });
                  return Object.values(grouped).map(g => ({
                    id: `nezio-fat-${g.date}`,
                    description: `Fatura Cartão Nézio`,
                    date: g.date,
                    amount: g.total,
                    status: 'pending' as const,
                    type: 'expense' as const
                  }));
                })()
              ]
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 6)
                .map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-zinc-200 truncate max-w-[180px]">{t.description}</span>
                      <span className="text-xs text-yellow-500/80 font-mono tracking-tighter">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="font-bold text-base text-white">R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))
              }
              {(state.transactions.filter(t => t.status === 'pending').length === 0 && state.nezioInstallments.length === 0) && (
                <div className="text-center py-12 text-zinc-500 text-sm border-2 border-dashed border-zinc-800 rounded-xl">Nenhum agendamento futuro.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
