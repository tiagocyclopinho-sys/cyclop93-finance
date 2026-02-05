"use client"
import { useApp } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Activity, CreditCard, Droplets, Calendar } from 'lucide-react'
import { useMemo } from 'react'
import clsx from 'clsx'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Dashboard() {
  const { state } = useApp()

  const totals = useMemo(() => {
    return state.transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount
      if (t.type === 'expense') acc.expense += t.amount
      return acc
    }, { income: 0, expense: 0 })
  }, [state.transactions])

  const balance = totals.income - totals.expense

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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Saldo Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className={clsx("text-2xl font-bold", balance >= 0 ? "text-white" : "text-red-500")}>R$ {balance.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Entradas (Mês)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">R$ {totals.income.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              +12 transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Saídas (Mês)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">R$ {totals.expense.toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              -4% em relação ao planejado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Investimentos</CardTitle>
            <Activity className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">R$ {state.investments.reduce((a, b) => a + b.amount, 0).toFixed(2)}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Patrimônio acumulado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Charts & Lists */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

        {/* Recents Transaction List */}
        <div className="col-span-4 lg:col-span-4 grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
              <CardDescription>
                Histórico recente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.transactions
                  .filter(t => !t.status || t.status === 'paid') // Show paid/completed items here mainly
                  .slice(-5).reverse().map(t => (
                    <div key={t.id} className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "flex h-8 w-8 items-center justify-center rounded-full border",
                          t.type === 'income' ? "border-green-900 bg-green-900/20" : "border-red-900 bg-red-900/20"
                        )}>
                          {t.type === 'income'
                            ? <ArrowUpRight className="h-4 w-4 text-green-500" />
                            : <ArrowDownRight className="h-4 w-4 text-red-500" />
                          }
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none text-white truncate max-w-[120px]" title={t.description}>{t.description}</p>
                          <p className="text-xs text-zinc-500">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                        </div>
                      </div>
                      <div className={clsx("font-medium text-sm", t.type === 'income' ? "text-green-500" : "text-white")}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </div>
                    </div>
                  ))}
                {state.transactions.length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-sm">Nenhuma movimentação.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-yellow-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendamentos
              </CardTitle>
              <CardDescription>
                Próximas contas a vencer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.transactions
                  .filter(t => t.status === 'pending')
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-zinc-200">{t.description}</span>
                        <span className="text-xs text-yellow-500 font-mono">{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                      <span className="font-bold text-sm text-white">R$ {t.amount.toFixed(2)}</span>
                    </div>
                  ))
                }
                {state.transactions.filter(t => t.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-zinc-500 text-sm">Nenhum agendamento futuro.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Status */}
        <Card className="col-span-3 lg:col-span-3">
          <CardHeader>
            <CardTitle>Status Financeiro</CardTitle>
            <CardDescription>Visão rápida dos seus compromissos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <CreditCard className="text-yellow-500 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-white">Cartão Nézio</p>
                  <p className="text-xs text-zinc-500">Próximo Vencimento: 10/Fev</p>
                </div>
              </div>
              <span className="text-white font-bold">R$ 450,00</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <Droplets className="text-blue-500 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-white">Rone (Água)</p>
                  <p className="text-xs text-zinc-500">Pendente de cálculo</p>
                </div>
              </div>
              <Link href="/rone" className="text-xs text-red-500 hover:underline">Calcular agora</Link>
            </div>

            <div className="pt-4">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-3">Distribuição de Gastos</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Fixas</span>
                  <span>65%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 w-[65%]" />
                </div>

                <div className="flex justify-between text-xs text-zinc-400 mt-2">
                  <span>Variáveis</span>
                  <span>35%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 w-[35%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
