"use client"
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/store'
import { MessageSquare, X, Send, Sparkles, Mic, MicOff } from 'lucide-react'

export function AiAgent() {
    const { state, dispatch } = useApp()
    const [isOpen, setIsOpen] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: 'Eu sou o Agente Cyclops. Analise seus dados financeiros comigo ou use o comando de voz!' }
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

    // Listen for custom trigger from Dashboard
    useEffect(() => {
        const handleTrigger = (event: any) => {
            const { message } = event.detail;
            setIsOpen(true);
            const userMsg = { role: 'user', text: message };
            const newMsgs = [...messages, userMsg] as any;
            setMessages(newMsgs);
            setIsTyping(true);

            setTimeout(() => {
                const btcPrice = "R$ 408.302,13"; // Based on recent search
                const responseText = `Para seu saldo disponível, aqui estão 3 opções de investimento tático:

1. 🏦 **CDB (Pós-fixado)**: Ideal para reserva de emergência, com liquidez diária e retorno de 100% do CDI.
2. 🏢 **FIIs (Fundos Imobiliários)**: Boa opção para gerar renda passiva mensal (dividendos) isenta de IR.
3. 📈 **Ações (Value Investing)**: Foco em empresas sólidas que pagam bons dividendos para longo prazo.

💰 **Bônus: Cotação BTC hoje:** ~${btcPrice}.

Qual dessas opções você gostaria de detalhar ou registrar em sua aba de Investimentos?`;

                setMessages([...newMsgs, { role: 'ai', text: responseText }]);
                setIsTyping(false);
            }, 1000);
        };

        window.addEventListener('openAiAgent', handleTrigger);
        return () => window.removeEventListener('openAiAgent', handleTrigger);
    }, [messages]);

    // Voice Recognition Setup
    const handleVoiceRecognition = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Seu navegador não suporta reconhecimento de voz. Tente no Chrome.');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    const handleSend = () => {
        if (!input.trim()) return

        const userMsg = { role: 'user', text: input }
        const newMsgs = [...messages, userMsg] as any
        setMessages(newMsgs)
        setInput('')
        setIsTyping(true)

        // Simple Rule-Based AI Response
        setTimeout(() => {
            let response: any = "Ainda estou aprendendo a analisar esses dados complexos."
            const lower = input.toLowerCase()

            // 🏦 Bank Notification Detection Logic
            const moneyRegex = /(?:r\$|rs)\s?(\d+(?:[.,]\d{2})?)/i
            const amountMatch = input.match(moneyRegex)
            const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0

            if (amount > 0 && (lower.includes('aprovada') || lower.includes('compra') || lower.includes('pagamento') || lower.includes('pix enviado') || lower.includes('transferência enviada') || lower.includes('débito'))) {
                // Detected Expense
                const description = lower.includes('em') ? input.split(/em/i)[1]?.trim() : 'Nova Despesa'
                response = {
                    text: `Detectei uma notificação de saída bancária! Deseja registrar este gasto de R$ ${amount.toFixed(2)}?`,
                    action: {
                        label: 'Registrar Despesa',
                        type: 'ADD_TRANSACTION',
                        payload: {
                            id: crypto.randomUUID(),
                            description: description.slice(0, 30),
                            amount: amount,
                            date: new Date().toISOString().slice(0, 10),
                            type: 'expense',
                            category: 'Outros',
                            status: 'paid'
                        }
                    }
                }
            }
            else if (amount > 0 && (lower.includes('recebido') || lower.includes('transferência recebida') || lower.includes('depósito') || lower.includes('pix recebido'))) {
                // Detected Income
                response = {
                    text: `Notificação de entrada detectada! Recebeu R$ ${amount.toFixed(2)}. Quer lançar agora?`,
                    action: {
                        label: 'Registrar Entrada',
                        type: 'ADD_TRANSACTION',
                        payload: {
                            id: crypto.randomUUID(),
                            description: 'Entrada via Notificação',
                            amount: amount,
                            date: new Date().toISOString().slice(0, 10),
                            type: 'income',
                            category: 'Outros',
                            status: 'paid'
                        }
                    }
                }
            }
            else if (lower.includes('gasto') || lower.includes('despesa')) {
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

            const finalMsg = typeof response === 'string' ? { role: 'ai', text: response } : { role: 'ai', text: response.text, action: response.action }
            setMessages([...newMsgs, finalMsg as any])
            setIsTyping(false)
        }, 800)
    }

    const handleAction = (action: any) => {
        dispatch({ type: action.type, payload: action.payload })
        setMessages([...messages, { role: 'ai', text: `✅ ${action.type === 'ADD_TRANSACTION' ? 'Transação registrada com sucesso!' : 'Ação realizada.'}` }])
    }

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
                {/* Microphone Button */}
                <button
                    onClick={handleVoiceRecognition}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 z-50 ${isListening
                            ? 'bg-red-600 animate-pulse'
                            : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
                        }`}
                    title="Comando de Voz"
                >
                    {isListening ? <MicOff className="text-white" size={20} /> : <Mic className="text-zinc-400" size={20} />}
                </button>

                {/* AI Agent Button */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.5)] hover:scale-110 transition-transform group"
                >
                    <div className="w-8 h-1 bg-yellow-400 absolute top-5 animate-pulse group-hover:bg-white transition-colors" />
                    <MessageSquare className="text-white mt-4" size={20} />
                </button>
            </div>
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
                {messages.map((m: any, i) => (
                    <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-3 rounded-2xl max-w-[85%] text-sm shadow-sm ${m.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5' : 'bg-red-600 text-white rounded-tr-none shadow-[0_4px_10px_rgba(220,38,38,0.2)]'}`}>
                            {m.text}
                            {m.action && (
                                <div className="mt-3">
                                    <button
                                        onClick={() => handleAction(m.action)}
                                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-500 transition-colors w-full"
                                    >
                                        {m.action.label}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 px-4 py-2 rounded-full animate-pulse text-[10px] text-zinc-400">Cyclops analisando...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 flex flex-col gap-2 bg-[#050A14]">
                <p className="text-[9px] text-zinc-500 px-2 italic">Dica: Cole o texto de uma notificação bancária aqui.</p>
                <div className="flex gap-2">
                    <button
                        onClick={handleVoiceRecognition}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${isListening
                                ? 'bg-red-600 animate-pulse'
                                : 'bg-zinc-800 hover:bg-zinc-700'
                            }`}
                        title="Reconhecimento de Voz"
                    >
                        {isListening ? <MicOff className="text-white" size={18} /> : <Mic className="text-zinc-400" size={18} />}
                    </button>
                    <input
                        className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
                        placeholder="Ex: Compra de R$ 32,50 no Posto..."
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
        </div>
    )
}
