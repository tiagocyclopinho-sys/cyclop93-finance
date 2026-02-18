"use client"
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/store'
import { MessageSquare, X, Send, Sparkles, Mic, MicOff } from 'lucide-react'

export function AiAgent() {
    const { state, dispatch } = useApp()
    const [isOpen, setIsOpen] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, action?: any }[]>([
        { role: 'ai', text: 'Olá! Sou o Estrategista Cyclops. Analise seus dados ou use o comando de voz para lançamentos!' }
    ])
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

            // State Data for Analysis - PRECISE DATA
            const totalIncome = state.transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
            const totalExpense = state.transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
            const investSum = state.investments.reduce((a, b) => a + b.amount, 0);
            const currentBalance = state.initialBalance + totalIncome - totalExpense;
            const pendingExpenses = state.transactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + t.amount, 0);
            const nezioTotal = state.nezioInstallments.reduce((a, b) => a + b.amount, 0);

            // 1. Transaction Detection (Voice & Text) - Enhanced with NLP-like logic
            const moneyRegex = /(?:r\$|rs|\$|reais)?\s?(\d+(?:[.,]\d{2})?)/i;
            const amountMatch = userInput.match(moneyRegex);
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;

            const incomeKeywords = ['recebi', 'ganhei', 'renda', 'entrada', 'pix recebido', 'depósito', 'faturamento', 'salário'];
            const expenseKeywords = ['gastei', 'paguei', 'compra', 'saída', 'pix enviado', 'débito', 'custo', 'despesa', 'fatura'];

            const isIncome = incomeKeywords.some(k => lower.includes(k));
            const isExpense = expenseKeywords.some(k => lower.includes(k));

            if (amount > 0 && (isIncome || isExpense)) {
                const type = isIncome ? 'income' : 'expense';
                let category = isIncome ? 'Receita' : 'Geral';
                if (lower.includes('mercado') || lower.includes('comida') || lower.includes('alimento')) category = 'Alimentação';
                if (lower.includes('posto') || lower.includes('gasolina') || lower.includes('combustível')) category = 'Transporte';
                if (lower.includes('lazer') || lower.includes('cinema') || lower.includes('restaurante')) category = 'Lazer';
                if (lower.includes('aluguel') || lower.includes('luz') || lower.includes('água')) category = 'Moradia';

                const descClean = userInput.replace(amountMatch ? amountMatch[0] : '', '').replace(new RegExp(`(${incomeKeywords.concat(expenseKeywords).join('|')})`, 'gi'), '').trim();
                const description = descClean || (isIncome ? 'Entrada via IA' : 'Saída via IA');

                response = {
                    text: `🦾 **Comando Processado:** Detectei um(a) ${isIncome ? 'receita' : 'lançamento de despesa'} de **R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Gostaria que eu registrasse isso agora como "${description}" na categoria ${category}?`,
                    action: {
                        label: `Confirmar Lançamento`,
                        type: 'ADD_TRANSACTION',
                        payload: {
                            id: crypto.randomUUID(),
                            description: description.charAt(0).toUpperCase() + description.slice(1, 40),
                            amount: amount,
                            date: new Date().toISOString().slice(0, 10),
                            type: type,
                            category: category,
                            status: 'paid'
                        }
                    }
                };
            }

            // 2. Expert Financial Insights
            if (!response) {
                if (lower.includes('insight') || lower.includes('análise') || lower.includes('como estou') || lower.includes('ajuda')) {
                    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

                    if (currentBalance < 500 && pendingExpenses > 200) {
                        response = `🔍 **Análise Crítica:** Seu fluxo de caixa está em risco. Com R$ ${currentBalance.toFixed(2)} em conta e R$ ${pendingExpenses.toFixed(2)} previstos, sua margem é apertada. Evite gastos supérfluos esta semana.`;
                    } else if (savingsRate > 20 && investSum < currentBalance) {
                        response = `📈 **Diagnóstico Expert:** Sua taxa de poupança está excelente (${savingsRate.toFixed(1)}%). Recomendo mover parte do saldo parado (R$ ${currentBalance.toFixed(2)}) para um CDB de liquidez diária.`;
                    } else if (totalExpense > totalIncome && totalIncome > 0) {
                        response = `⚠️ **Alerta de Fluxo:** Seus gastos (R$ ${totalExpense.toFixed(2)}) superaram suas entradas. Verifique a aba de Dívidas para renegociações possíveis.`;
                    } else {
                        response = `🎯 **Status Estratégico:** Patrimônio líquido total: R$ ${(currentBalance + investSum).toFixed(2)}. Continue monitorando o Cartão Nézio para o dia 20.`;
                    }
                } else if (lower.includes('saldo') || lower.includes('conta')) {
                    response = `Seu saldo real agora é **R$ ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**. Projetado para o fim do mês: R$ ${(currentBalance - pendingExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`;
                } else if (lower.includes('notificação') || lower.includes('celular') || lower.includes('mobile')) {
                    response = `📱 **Integração Mobile:** Estou monitorando alertas. Quando você receber um PIX ou compra no cartão, eu te avisarei aqui. \n\n**Simulação:** Acabei de detectar uma notificação de compra de R$ 45,90 no Mercado. Deseja lançar?`;
                } else {
                    response = `Olá! Sou seu **Estrategista Cyclops**. Posso processar lançamentos (voz/texto) ou dar insights profundos. Como posso ajudar agora?`;
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
