-- ESQUEMA DE BANCO DE DATOS PARA O CYCLOP FINANCE SAAS
-- Este script criaria as tabelas na nuvem (Supabase/PostgreSQL)

-- 1. Tabela de Perfis de Usuário (Com suporte a Trial de 7 dias)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  initial_balance DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'canceled'
  PRIMARY KEY (id)
);

-- 2. Tabela de Transações (Multi-usuário)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT,
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Cartões (Onde o usuário cadastra seus próprios cartões)
CREATE TABLE credit_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  card_name TEXT NOT NULL, -- Ex: 'Nézio', 'Nubank', 'Itaú'
  closing_day INTEGER DEFAULT 20,
  due_day INTEGER DEFAULT 25
);

-- 4. Tabela de Parcelamentos (Faturas dos Cartões)
CREATE TABLE card_installments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES credit_cards(id),
  user_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  total_amount DECIMAL NOT NULL,
  installment_amount DECIMAL NOT NULL,
  total_installments INTEGER NOT NULL,
  start_date DATE NOT NULL,
  status TEXT DEFAULT 'pending'
);

-- SEGURANÇA (RLS): Garante que um usuário NUNCA veja os dados de outro
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own transactions" 
ON transactions FOR ALL USING (auth.uid() = user_id);
