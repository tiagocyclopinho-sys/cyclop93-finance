"use client"
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/store'
import { MessageSquare, X, Send, Sparkles } from 'lucide-react'

export function AiAgent() {
    const { state } = useApp()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'Eu sou o Agente Cyclops. Analise seus dados financeiros comigo.' }
    ])
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return

        const newMsgs = [...messages, { role: 'user', text: input }] as any
        setMessages(newMsgs)
        setInput('')

        // Simple Rule-Based AI Response
        setTimeout(() => {
            let response = "Ainda estou aprendendo a analisar esses dados complexos."
            const lower = input.toLowerCase()

            if (lower.includes('gasto') || lower.includes('despesa')) {
                const total = state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                response = `Identifiquei que o total de despesas registradas é R$ ${total.toFixed(2)}.`
            }
            else if (lower.includes('entrada') || lower.includes('ganho') || lower.includes('salário')) {
                const total = state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
                response = `Suas entradas somam R$ ${total.toFixed(2)} neste período.`
            }
            else if (lower.includes('saldo')) {
                const income = state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
                const expense = state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
                response = `Seu saldo líquido atual é de R$ ${(income - expense).toFixed(2)}.`
            }
            else if (lower.includes('olá') || lower.includes('oi')) {
                response = "Olá! Como posso ajudar você a economizar hoje?"
            }
            else if (lower.includes('rone')) {
                response = "Para calcular o acerto com Rone, vá até a aba Rone no menu lateral."
            }
            else if (lower.includes('sugestão') || lower.includes('priorizar') || lower.includes('dica')) {
                response = "Minha análise tática: \n1. Priorize pagar as faturas do Nézio para evitar juros do rotativo.\n2. Controle o consumo na Lanchonete, pois isso reduz seu recebimento do Rone.\n3. Tente destinar 10% da renda para a aba Investimentos."
            }

            setMessages([...newMsgs, { role: 'ai', text: response }])
        }, 800)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:scale-110 transition-transform z-50 group"
            >
                <div className="w-8 h-1 bg-yellow-400 absolute top-5 animate-pulse group-hover:bg-white transition-colors" />
                <MessageSquare className="text-white mt-4" size={20} />
            </button>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-[#0F172A] border border-red-500/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in font-sans">
            {/* Header */}
            <div className="p-4 bg-red-600/10 border-b border-red-500/20 flex justify-between items-center backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center shadow-[0_0_10px_rgba(255,0,0,0.4)]">
                        <div className="w-6 h-1 bg-yellow-400"></div>
                    </div>
                    <div>
                        <span className="font-bold text-white block leading-none">Cyclops AI</span>
                        <span className="text-[10px] text-red-300 flex items-center gap-1"><Sparkles size={10} /> Online</span>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full"><X size={16} /></button>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' : 'bg-red-600 text-white rounded-tr-none shadow-[0_4px_10px_rgba(220,38,38,0.2)]'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex gap-2 bg-[#050A14]">
                <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                    placeholder="Digite sua dúvida..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button
                    onClick={handleSend}
                    className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-500 transition-colors shadow-lg"
                    disabled={!input.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}
