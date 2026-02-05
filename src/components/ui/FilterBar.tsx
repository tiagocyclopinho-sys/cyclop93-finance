"use client"
import React, { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

interface FilterBarProps {
    filters: any
    onFilterChange: (filters: any) => void
    showCategory?: boolean
    showStatus?: boolean
    showDate?: boolean
    categories?: string[]
}

export function FilterBar({
    filters,
    onFilterChange,
    showCategory = true,
    showStatus = true,
    showDate = true,
    categories = []
}: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    const handleChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value })
    }

    const hasActiveFilters = filters.category || filters.status || filters.sortBy !== 'date-desc'

    return (
        <div className="space-y-2">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={cn("text-xs gap-2", hasActiveFilters && "text-red-500")}
                >
                    <SlidersHorizontal size={14} />
                    {isExpanded ? 'Ocultar Filtros' : 'Filtros Avançados'}
                </Button>
            </div>

            {isExpanded && (
                <div className="bg-card border rounded-lg p-4 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
                    {/* Date Range - Only if showDate is true */}
                    {showDate && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">De:</label>
                                <Input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={e => handleChange('startDate', e.target.value)}
                                    className="w-full text-xs"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Até:</label>
                                <Input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={e => handleChange('endDate', e.target.value)}
                                    className="w-full text-xs"
                                />
                            </div>
                        </>
                    )}

                    {/* Category */}
                    {showCategory && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Categoria:</label>
                            <Select
                                options={[
                                    { label: 'Todas', value: '' },
                                    ...categories.map(c => ({ label: c, value: c }))
                                ]}
                                value={filters.category}
                                onChange={e => handleChange('category', e.target.value)}
                                className="text-xs"
                            />
                        </div>
                    )}

                    {/* Status */}
                    {showStatus && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Status:</label>
                            <Select
                                options={[
                                    { label: 'Todos', value: '' },
                                    { label: 'Pendente/Agendado', value: 'pending' },
                                    { label: 'Pago', value: 'paid' },
                                    { label: 'Atrasado', value: 'overdue' },
                                ]}
                                value={filters.status}
                                onChange={e => handleChange('status', e.target.value)}
                                className="text-xs"
                            />
                        </div>
                    )}

                    {/* Sort */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">Ordenar por:</label>
                        <Select
                            options={[
                                { label: 'Mais Recentes', value: 'date-desc' },
                                { label: 'Mais Antigos', value: 'date-asc' },
                                { label: 'Maior Valor', value: 'amount-desc' },
                                { label: 'Menor Valor', value: 'amount-asc' },
                            ]}
                            value={filters.sortBy}
                            onChange={e => handleChange('sortBy', e.target.value)}
                            className="text-xs"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
