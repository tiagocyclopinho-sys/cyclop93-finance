import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

/**
 * MENSAGEM IMPORTANTE:
 * Este arquivo é apenas uma DEMONSTRAÇÃO de como o Cyclop Finance
 * seria estruturado para escalar como um produto SaaS (venda para terceiros).
 * 
 * NÃO ESTÁ SENDO USADO NO SEU APP ATUAL.
 */

// 1. Configuração dos clientes (Nuvem)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
    const { userId, userMessage } = req.body;

    try {
        // 2. Busca os dados reais do usuário no Banco de Dados Cloud
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(100);

        // 3. Constrói o contexto para a IA (O "Prompt do Estrategista")
        const context = `
      Você é o Estrategista Cyclops, um consultor financeiro especialista.
      O usuário tem as seguintes transações recentes:
      ${JSON.stringify(transactions)}
      
      Responda de forma estratégica, sugerindo cortes de gastos ou investimentos.
    `;

        // 4. CHAMA A OPENAI (Inteligência Artificial Generativa)
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: context },
                { role: "user", content: userMessage }
            ],
            temperature: 0.7,
        });

        const aiResponse = completion.choices[0].message.content;

        // 5. Salva a conversa no banco para o histórico do usuário
        await supabase.from('ai_chat_history').insert({
            user_id: userId,
            message: userMessage,
            response: aiResponse
        });

        return res.status(200).json({ text: aiResponse });

    } catch (error) {
        console.error('Erro na IA SaaS:', error);
        return res.status(500).json({ error: 'Erro ao processar consulta da IA' });
    }
}
