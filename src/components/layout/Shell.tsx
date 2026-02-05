"use client"
import React, { useState, useEffect } from "react"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, TrendingDown, Droplets, CreditCard, AlertTriangle, PieChart, PanelLeftClose, PanelLeft, Search, Bell, Moon, Sun, Menu, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'
import { AiAgent } from '@/components/modules/AiAgent'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/', label: 'Visão Geral', icon: LayoutDashboard },
    { type: 'separator', label: 'Gestão' },
    { href: '/entrada', label: 'Entradas', icon: TrendingUp },
    { href: '/saidas', label: 'Saídas', icon: TrendingDown },
    { href: '/rone', label: 'Rone', icon: Droplets },
    { href: '/nezio', label: 'Cartão Nézio', icon: CreditCard },
    { type: 'separator', label: 'Patrimônio' },
    { href: '/divida', label: 'Dívidas', icon: AlertTriangle },
    { href: '/investimentos', label: 'Investimentos', icon: PieChart },
]

export function Shell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Forced Dark Mode
    useEffect(() => {
        document.documentElement.classList.add('dark')
    }, [])

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
            {/* Sidebar Desktop */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r bg-card transition-all duration-300 relative z-20",
                    isSidebarCollapsed ? "w-20" : "w-64"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b">
                    <div className="flex items-center gap-3">
                        {/* Cyclops Visor Icon */}
                        <div className="w-10 h-5 bg-zinc-900 rounded-sm border border-zinc-700 relative flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            <div className="w-full h-1 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse"></div>
                        </div>
                        {!isSidebarCollapsed && (
                            <span className="font-bold text-lg tracking-tight font-heading">Cyclop<span className="text-red-500">93</span></span>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
                    {navItems.map((item, idx) => {
                        if (item.type === 'separator') {
                            if (isSidebarCollapsed) return <div key={idx} className="h-4" />
                            return (
                                <div key={idx} className="px-3 mt-6 mb-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                                </div>
                            )
                        }

                        const isActive = pathname === item.href
                        const Icon = item.icon as any

                        return (
                            <Link
                                key={item.href || idx}
                                href={item.href || '#'}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    isSidebarCollapsed && "justify-center px-2"
                                )}
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                                {!isSidebarCollapsed && <span>{item.label}</span>}
                                {isActive && !isSidebarCollapsed && (
                                    <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-4 border-t">
                    <div className={cn("flex items-center gap-3", isSidebarCollapsed && "justify-center")}>
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                            TM
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Tiago Master</p>
                                <p className="text-xs text-muted-foreground truncate">Admin</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b bg-background/95 backdrop-blur flex items-center justify-between px-4 md:px-6 z-10 shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Logo for both Mobile and Desktop (when sidebar is collapsed or on mobile) */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-5 bg-zinc-900 rounded-sm border border-zinc-700 relative flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                <div className="w-full h-1 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse"></div>
                            </div>
                            <span className="font-bold text-lg tracking-tight font-heading">Cyclop<span className="text-red-500">93</span></span>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground ml-4">
                            <span>Dashboard</span>
                            <ChevronRight size={14} />
                            <span className="font-medium text-foreground">
                                {navItems.find(i => i.href === pathname)?.label || 'Visão Geral'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative hidden md:block w-48 mr-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                placeholder="Buscar..."
                            />
                        </div>

                        {/* Menu on the RIGHT for mobile */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                            <Menu size={24} />
                        </button>

                        <button
                            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex text-muted-foreground hover:text-foreground transition-colors p-2"
                        >
                            {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                        </button>
                    </div>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 bg-background md:hidden p-4">
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-bold text-lg">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}><PanelLeftClose /></button>
                        </div>
                        <nav className="space-y-2">
                            {navItems.map((item, idx) => {
                                if (item.type === 'separator') return <div key={idx} className="text-xs font-bold text-muted-foreground mt-4 mb-2 uppercase">{item.label}</div>
                                const Icon = item.icon as any
                                return (
                                    <Link
                                        key={idx}
                                        href={item.href || '#'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                                            pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground bg-accent/50"
                                        )}
                                    >
                                        <Icon size={20} />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                )}

                <main className="flex-1 overflow-auto p-4 md:p-8 bg-muted/20">
                    <div className="mx-auto max-w-7xl space-y-8 pb-20">
                        {children}
                    </div>
                </main>
            </div>

            <div className="fixed bottom-6 left-6 z-50 flex items-center gap-4">
                <button className="bg-zinc-900 border border-zinc-800 text-muted-foreground hover:text-white relative p-4 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 group">
                    <Bell size={24} />
                    <span className="absolute top-[14px] right-[14px] w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-zinc-900 animate-pulse"></span>
                </button>
            </div>

            <AiAgent />
        </div>
    )
}
