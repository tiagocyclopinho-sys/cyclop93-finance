# 🚀 Guia de Deploy - Cyclop Finance

## Pré-requisitos
- Conta no GitHub (gratuita)
- Conta no Vercel (gratuita)

## Passo 1: Preparar o Projeto para Deploy

### 1.1 Inicializar Git (se ainda não foi feito)
```bash
git init
git add .
git commit -m "feat: Cyclop Finance v2.1 - Voice commands, notifications, Nezio automation"
```

### 1.2 Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome do repositório: `cyclop-finance` (ou outro nome)
3. Deixe como **Público** ou **Privado**
4. **NÃO** marque "Initialize with README"
5. Clique em **"Create repository"**

### 1.3 Conectar ao GitHub
Após criar o repositório, copie os comandos que aparecem na tela:
```bash
git remote add origin https://github.com/SEU-USUARIO/cyclop-finance.git
git branch -M main
git push -u origin main
```

## Passo 2: Deploy no Vercel

### Método 1: Via Interface Web (RECOMENDADO)
1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório **cyclop-finance**
5. Configure:
   - **Framework Preset**: Next.js (detecta automaticamente)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (padrão)
   - **Output Directory**: `.next` (padrão)
6. Clique em **"Deploy"**
7. Aguarde 2-3 minutos
8. Pronto! Sua URL será algo como: `cyclop-finance-xxxx.vercel.app`

### Método 2: Via CLI (Alternativo)
```bash
# Instalar Vercel CLI globalmente
npm install -g vercel

# Fazer deploy
vercel

# Seguir as instruções no terminal
# Após o primeiro deploy, use:
vercel --prod
```

## Passo 3: Atualizar o Deploy (Futuras Alterações)

Sempre que fizer mudanças no código:

```bash
# Salvar as alterações
git add .
git commit -m "Descrição da alteração"
git push

# O Vercel vai detectar automaticamente e fazer o redeploy!
```

## Passo 4: Configurar Domínio Personalizado (Opcional)

No painel do Vercel:
1. Vá em **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Siga as instruções para configurar DNS

## 🔧 Comandos Rápidos

### Testar build localmente antes do deploy:
```bash
npm run build
npm start
```

### Limpar cache do Next.js:
```bash
# Windows PowerShell
if (Test-Path .next) { Remove-Item -Recurse -Force .next }

# Depois rebuildar
npm run build
```

## ✅ Checklist de Deploy

- [ ] Código commitado no Git
- [ ] Repositório criado no GitHub
- [ ] Código enviado para o GitHub (`git push`)
- [ ] Deploy feito no Vercel
- [ ] URL de produção testada
- [ ] LocalStorage limpo na primeira visita (usuários devem fazer isso manualmente)

## 🌐 URLs Importantes

- **Painel Vercel**: https://vercel.com/dashboard
- **GitHub Repos**: https://github.com/SEU-USUARIO?tab=repositories

## 📝 Notas

- O Vercel faz **deploy automático** a cada push para o branch `main`
- Preview deployments são criados para outros branches
- Builds levam ~2-3 minutos
- LocalStorage é específico do domínio (dados locais não vão para produção)
- Usuários precisarão acessar `/reset.html` na primeira vez para limpar cache

## 🐛 Solução de Problemas

**Build falhou?**
- Verifique os logs no painel do Vercel
- Teste `npm run build` localmente primeiro

**Mudanças não aparecem?**
- Limpe o cache do navegador (Ctrl+Shift+R)
- Acesse `/reset.html` na URL de produção
- Verifique se o último commit está no GitHub

**Deploy não aconteceu?**
- Verifique se o push foi bem-sucedido: `git log`
- No Vercel, vá em Deployments e veja o status
