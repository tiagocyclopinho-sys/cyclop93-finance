"use client"
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/store'
import { MessageSquare, X, Send, Sparkles, Mic, MicOff } from 'lucide-react'
import { getTodayISO } from '@/lib/utils'

export function AiAgent() {
    const { state, dispatch } = useApp()
    const [isOpen, setIsOpen] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, action?: any }[]>([
        { role: 'ai', text: 'Fala, mestre. Sou o **Cyclops**. Vi que seu saldo mudou. Quer que eu faça um raio-x das suas contas ou vamos direto pros investimentos?' }
    ])
    const [lastTopic, setLastTopic] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const [isTyping, setIsTyping] = useState(false)

    // Voice Recognition Setup
    const handleVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            const errorMsg = { role: 'ai', text: '❌ Seu navegador não suporta reconhecimento de voz. Use o Chrome ou Edge.' } as const;
            setMessages([...messages, errorMsg]);
            return;
        }

        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'pt-BR';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                if (isOpen) {
                    setMessages(prev => [...prev, { role: 'ai', text: '🎤 Escutando... Fale agora!' }]);
                }
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);

                // Auto-open and process
                setIsOpen(true);
                setTimeout(() => {
                    const userMsg = { role: 'user', text: transcript };
                    setMessages(prev => {
                        const filtered = prev.filter(m => !m.text.includes('🎤 Escutando...'));
                        const newMsgs = [...filtered, userMsg] as any;
                        processMessage(transcript, newMsgs);
                        return newMsgs;
                    });
                    setInput('');
                }, 400);
            };

            recognition.onerror = (event: any) => {
                setIsListening(false);
                let errorText = '❌ Erro no reconhecimento de voz.';
                if (event.error === 'no-speech') errorText = '❌ Nenhuma fala detectada.';
                else if (event.error === 'not-allowed') errorText = '❌ Permissão de microfone negada.';

                setIsOpen(true);
                setMessages(prev => [...prev.filter(m => !m.text.includes('🎤 Escutando...')), { role: 'ai', text: errorText }] as any);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (error) {
            setIsListening(false);
            setMessages(prev => [...prev, { role: 'ai', text: '❌ Erro ao iniciar voz.' }] as any);
        }
    };

    // Expert AI Processing Logic
    const processMessage = (userInput: string, currentMsgs: any[]) => {
        setIsTyping(true);

        setTimeout(() => {
            const lower = userInput.toLowerCase();
            let response: any = "";

            // --- BRAIN DATA ---
            const totalIncome = state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const totalExpense = state.transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
            const investSum = state.investments.reduce((a, b) => a + b.amount, 0);
            const currentBalance = state.initialBalance + totalIncome - totalExpense;
            const pendingExpenses = state.transactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
            const nezioTotal = state.nezioInstallments.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
            const totalDebtTotal = state.debts.reduce((a, b) => a + b.totalValue, 0) + nezioTotal;

            // --- CONTEXT & INTENT ---
            const isFollowUpWhy = lower.includes('por que') || lower.includes('pq') || lower.includes('explica');
            const isInvestRequest = lower.includes('investir') || lower.includes('aplicar') || lower.includes('fii') || lower.includes('cdb') || lower.includes('sugestão');
            const isDebtRequest = lower.includes('dívida') || lower.includes('devo') || lower.includes('nézio') || lower.includes('renegocia');

            // 1. TRANSACTION LOGIC (Precise Detection)
            const moneyRegex = /(?:r\$|rs|\$|reais)?\s?(\d+(?:[.,]\d{2})?)/i;
            const amountMatch = userInput.match(moneyRegex);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

            if (amount > 0 && (lower.includes('gastei') || lower.includes('recebi') || lower.includes('paguei') || lower.includes('ganhei'))) {
                const isIncome = ['recebi', 'ganhei', 'salário', 'pix'].some(k => lower.includes(k));
                const type = isIncome ? 'income' : 'expense';
                const description = userInput.replace(moneyRegex, '').replace(/(gastei|paguei|recebi|ganhei|lança|adiciona)/gi, '').trim() || 'Lançamento via IA';

                response = {
                    text: `🦾 **Lançamento Detectado:** Quer que eu registre R$ ${amount.toLocaleString('pt-BR')} como "${description}"?`,
                    action: {
                        label: `Confirmar`,
                        type: 'ADD_TRANSACTION',
                        payload: {
                            id: crypto.randomUUID(),
                            description: description.charAt(0).toUpperCase() + description.slice(1, 40),
                            amount: amount,
                            date: getTodayISO(),
                            type: type,
                            category: isIncome ? 'Salário' : 'Geral',
                            status: 'paid'
                        }
                    }
                };
            }

            // 2. STRATEGIC CONVERSATION (The "Soul" of Cyclops)
            if (!response) {
                // Handle "WHY?" based on memory
                if (isFollowUpWhy && lastTopic) {
                    if (lastTopic === 'reserva') {
                        response = `**Por que R$ 1.500?** Porque esse valor é o seu 'seguro contra imprevistos'. Se o pneu do carro fura ou o Rone quebra, você não precisa se endividar. É o básico da dignidade financeira antes de pensar em bolsa de valores. Ficou claro agora?`;
                    } else if (lastTopic === 'investimento') {
                        response = `Porque inflação é um imposto silencioso. Se seu dinheiro tá no saldo, o banco tá ganhando e você tá perdendo poder de compra. Juros compostos só funcionam se você der o primeiro passo.`;
                    } else if (lastTopic === 'divida') {
                        response = `Porque juros de dívida no Brasil são abusivos. Trabalhar para pagar juros é o oposto de prosperar. Temos que fechar essa torneira primeiro.`;
                    }
                }
                // Context: Investing
                else if (isInvestRequest) {
                    if (currentBalance < 1500) {
                        setLastTopic('reserva');
                        response = `🌱 **Visão Realista:** Você tá querendo falar de FIIs com saldo de R$ ${currentBalance.toLocaleString('pt-BR')}? Minha regra é clara: primeiro você monta sua **Reserva de Emergência** de pelo menos R$ 1.500. Depois a gente fala de mercado. O que acha de focar na reserva esse mês?`;
                    } else {
                        setLastTopic('investimento');
                        const selicPot = (currentBalance * 0.009).toLocaleString('pt-BR');
                        response = `💰 **Oportunidade:** Seu saldo de R$ ${currentBalance.toLocaleString('pt-BR')} parado é lucro pro banco. Num CDB 100% renderia uns **R$ ${selicPot}** extras por mês. Bora parar de deixar dinheiro na mesa?`;
                    }
                }
                // Context: Debts
                else if (isDebtRequest) {
                    setLastTopic('divida');
                    response = `🛡️ **Raio-X de Passivos:** Você tem **R$ ${totalDebtTotal.toLocaleString('pt-BR')}** em aberto. Se for o Nézio, cuidado com o dia 20. Dívida não se ignora, se ataca. Quer que eu te mostre o plano pra zerar isso?`;
                }
                // Context: General Analysis
                else if (lower.includes('analise') || lower.includes('estratégia')) {
                    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
                    response = `🧠 **Diagnóstico Estratégico:** Sua taxa de poupança está em **${savingsRate.toFixed(1)}%**. \n\n${savingsRate > 20 ? '🚀 Você tá voando! Hora de aumentar os aportes.' : '⚠️ Você tá operando no limite. Se um pneu furar, o sistema cai. Vamos revisar os gastos variáveis?'}\n\nO que quer atacar primeiro: Reservas ou Investimentos?`;
                }
                // Default with context
                else {
                    response = `Fala, mestre. Tô aqui monitorando seus R$ ${currentBalance.toLocaleString('pt-BR')}. Quer lançar um gasto real, entender por que seu dinheiro não rende ou quer um diagnóstico bruto da sua situação?`;
                }
            }

            const finalMsg = typeof response === 'string' ? { role: 'ai', text: response } : { role: 'ai', text: response.text, action: response.action };
            setMessages(prev => [...prev.filter(m => !m.text.includes('🎤 Escutando...')), finalMsg as any]);
            setIsTyping(false);
        }, 1200);
    };

    const handleSend = () => {
        if (!input.trim()) return
        const userMsg = { role: 'user' as const, text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        processMessage(input, messages)
    }

    const handleAction = (action: any) => {
        dispatch({ type: action.type, payload: action.payload })
        setMessages(prev => [...prev, { role: 'ai', text: `✅ Ação realizada com sucesso: ${action.payload.description}` }])
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
                <button
                    onClick={handleVoiceRecognition}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 z-50 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-zinc-900 border border-zinc-800'}`}
                >
                    {isListening ? <MicOff className="text-white" size={20} /> : <Mic className="text-zinc-400" size={20} />}
                </button>
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <MessageSquare className="text-white" size={20} />
                </button>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-96 h-[500px] bg-[#0F172A] border border-red-500/30 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in font-sans">
            <div className="p-4 bg-red-600/10 border-b border-red-500/20 flex justify-between items-center backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center">
                        <div className="w-6 h-1 bg-yellow-400"></div>
                    </div>
                    <span className="font-bold text-white">Cyclops AI Expert</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white bg-white/5 p-1 rounded-full"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m: any, i) => (
                    <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${m.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-none' : 'bg-red-600 text-white rounded-tr-none'}`}>
                            {m.text}
                            {m.action && (
                                <div className="mt-3">
                                    <button onClick={() => handleAction(m.action)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-500 transition-colors w-full">Confirmar</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="text-xs text-zinc-500 animate-pulse">Cyclops analisando...</div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-white/10 flex gap-2 bg-[#050A14]">
                <button onClick={handleVoiceRecognition} className={`w-10 h-10 rounded-full flex items-center justify-center ${isListening ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'}`}>
                    {isListening ? <MicOff className="text-white" size={18} /> : <Mic className="text-zinc-400" size={18} />}
                </button>
                <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-white text-sm focus:outline-none focus:border-red-500/50"
                    placeholder="Fale ou digite..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white"><Send size={18} /></button>
            </div>
        </div>
    )
}
