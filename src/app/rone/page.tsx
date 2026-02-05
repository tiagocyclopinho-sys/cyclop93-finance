"use client"
import React, { useState, useMemo } from 'react'
import { useApp } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Droplets, Plus, Trash2, Calendar, Coffee, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RonePage() {
    const { state, dispatch } = useApp()
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

    // States for new consumption
    const [consDesc, setConsDesc] = useState('')
    const [consAmount, setConsAmount] = useState('')
    const [consDate, setConsDate] = useState(new Date().toISOString().slice(0, 10))

    // States for water bill
    const [waterAmount, setWaterAmount] = useState('')

    // Filter data by month
    const currentConsumptions = useMemo(() => {
        return state.roneConsumptions.filter(c => c.date.startsWith(selectedMonth))
    }, [state.roneConsumptions, selectedMonth])

    const waterBill = useMemo(() => {
        return state.roneWaterBills.find(w => w.date === selectedMonth)
    }, [state.roneWaterBills, selectedMonth])

    // Calculations
    const totalConsumption = currentConsumptions.reduce((acc, curr) => acc + curr.amount, 0)
    const totalWater = waterBill ? waterBill.amount : 0
    const myWaterShare = totalWater / 2
    const finalBalance = myWaterShare - totalConsumption
    // Logic: 
    // Water Share = 100 (I owe 100 for water)
    // Consumption = 40 (He owes me 40 for food he gave me? No, I consumed 40 at his place, so I owe him 40)
    // WAIT. "Consuma normalmente na lanchonete, mas que eu faça o pagamento da conta de água, ao final do mês, o que faltar eu passo de valor para ele."
    // I pay Full Water Bill to Utility Company? 
    // Or I pay him?
    // User said: "(água/2)-Rone é o valor a constar na saída"
    // Let's interpret: 
    // My Debt for Water = Water/2.
    // My Debt for Snacks = Total Consumption.
    // Total Debt to Rone = (Water/2) + Consumption?
    // Let's re-read carefully: "o combinado é que consuma normalmente na lanchonete, mas que EU faça o pagamento da conta de água" -> Tiago pays the water bill.
    // "ao final do mês, o que faltar eu passo de valor para ele."
    // Tiago pays Water (Credit: Tiago).
    // Water Bill Value = W.
    // Rone's share of Water = W/2. (Rone owes Tiago W/2).
    // Tiago consumed Snacks = S. (Tiago owes Rone S).
    // Net Balance = (Rone owes Tiago) - (Tiago owes Rone)
    // Net Balance = (W/2) - S.
    // If Positive: Rone owes Tiago.
    // If Negative: Tiago owes Rone.

    // User Prompt: "(água/2)-Rone é o valor a constar na saída"
    // If result is positive, it means "Saída" (Expense)? 
    // Usually Expense means Money leaving Tiago's pocket.
    // If (W/2) - S > 0, it means W/2 > S. Rone owes Tiago. That should be INCOME for Tiago, or reduction of expense.
    // If (W/2) - S < 0, it means S > W/2. Tiago owes Rone. That is EXPENSE (Saída).
    // Maybe User means: "The value to pay Rone is..."
    // If I pay the FULL water bill, then I already paid my part AND his part.
    // So I essentially "lent" him W/2.
    // He "lent" me S (snacks).
    // Settlement = (W/2) - S.
    // If Settlement > 0: He pays me.
    // If Settlement < 0: I pay him the difference.

    // Let's stick to the formula: Balance = (Water/2) - Consumption.

    const handleAddConsumption = () => {
        if (!consDesc || !consAmount) return
        dispatch({
            type: 'ADD_RONE_CONSUMPTION',
            payload: {
                id: crypto.randomUUID(),
                date: consDate,
                description: consDesc,
                amount: parseFloat(consAmount)
            }
        })
        setConsDesc('')
        setConsAmount('')
    }

    const handleSetWaterBill = () => {
        if (!waterAmount) return
        dispatch({
            type: 'ADD_RONE_WATER_BILL',
            payload: {
                id: crypto.randomUUID(),
                date: selectedMonth,
                amount: parseFloat(waterAmount),
                status: 'calculated'
            }
        })
    }

    const handleDeleteConsumption = (id: string) => {
        dispatch({ type: 'DELETE_RONE_CONSUMPTION', payload: id })
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestão Rone</h2>
                    <p className="text-muted-foreground">Controle de compensação: Água vs Consumo.</p>
                </div>

                <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-transparent border-none focus:outline-none text-sm font-medium"
                    />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Lançamento de Consumo */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coffee className="w-5 h-5 text-orange-500" />
                            Lançar Consumo
                        </CardTitle>
                        <CardDescription>O que você consumiu na lanchonete este mês.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <Input
                                label="Data"
                                type="date"
                                value={consDate}
                                onChange={e => setConsDate(e.target.value)}
                                className="md:w-40"
                            />
                            <Input
                                label="Descrição"
                                placeholder="Ex: X-Salada + Coca"
                                value={consDesc}
                                onChange={e => setConsDesc(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                label="Valor (R$)"
                                type="number"
                                placeholder="0,00"
                                value={consAmount}
                                onChange={e => setConsAmount(e.target.value)}
                                className="md:w-32"
                            />
                            <Button onClick={handleAddConsumption} className="bg-orange-600 hover:bg-orange-700">
                                <Plus className="w-4 h-4 mr-1" /> Adicionar
                            </Button>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Consumos Registrados</h4>
                            <div className="space-y-2">
                                {currentConsumptions.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                                        Nenhum consumo lançado neste mês.
                                    </div>
                                ) : (
                                    currentConsumptions.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-md border text-sm group">
                                            <div className="flex items-center gap-3">
                                                <span className="text-muted-foreground font-mono text-xs">{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                                                <span className="font-medium">{item.description}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold">R$ {item.amount.toFixed(2)}</span>
                                                <button
                                                    onClick={() => handleDeleteConsumption(item.id)}
                                                    className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resumo e Água */}
                <div className="space-y-6">
                    {/* Card Conta de Água */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-blue-500" />
                                Conta de Água
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {waterBill ? (
                                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                    <div>
                                        <p className="text-xs text-blue-400 font-bold uppercase">Valor Total</p>
                                        <p className="text-2xl font-bold text-blue-500">R$ {waterBill.amount.toFixed(2)}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => dispatch({ type: 'ADD_RONE_WATER_BILL', payload: { ...waterBill, amount: 0 } })} // Quick clear hack
                                        className="h-8 w-8 p-0"
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-2 items-end">
                                    <Input
                                        label="Valor da Conta"
                                        placeholder="0,00"
                                        type="number"
                                        value={waterAmount}
                                        onChange={e => setWaterAmount(e.target.value)}
                                    />
                                    <Button onClick={handleSetWaterBill} variant="secondary">OK</Button>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-3">
                                A conta de água é dividida por 2. Parte do Rone:
                                <span className="font-bold text-foreground"> R$ {(totalWater / 2).toFixed(2)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card Resultado */}
                    <Card className={cn("border-2", finalBalance > 0 ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5")}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calculator className="w-4 h-4" />
                                Acerto Final
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Crédito (Água/2):</span>
                                <span className="font-medium text-green-500">+ R$ {(totalWater / 2).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Débito (Consumo):</span>
                                <span className="font-medium text-red-500">- R$ {totalConsumption.toFixed(2)}</span>
                            </div>

                            <div className="border-t pt-3 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">Saldo:</span>
                                    <span className={cn("font-bold text-2xl", finalBalance >= 0 ? "text-green-600" : "text-red-600")}>
                                        {finalBalance >= 0 ? "Receber" : "Pagar"} R$ {Math.abs(finalBalance).toFixed(2)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground text-right mt-1">
                                    {finalBalance >= 0
                                        ? "O Rone te deve este valor."
                                        : "Você deve este valor ao Rone."}
                                </p>
                            </div>

                            <Button className={cn("w-full mt-4", finalBalance >= 0 ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}>
                                Registrar {finalBalance >= 0 ? "Recebimento" : "Pagamento"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
