# 🎬 GUIA DE EXECUÇÃO — Dashboard de BI Revert

Passo-a-passo completo para rodar o projeto até produção.

---

## 📦 O que você precisa antes

- [ ] Conta Vercel ([vercel.com](https://vercel.com)) — Free tier serve
- [ ] Conta GitHub com repositório `dashboard-revert` privado criado vazio
- [ ] Node.js 20+ instalado
- [ ] Claude Code instalado (`npm i -g @anthropic-ai/claude-code`)
- [ ] Vercel CLI instalado (`npm i -g vercel`)
- [ ] GitHub CLI instalado (`gh`)
- [ ] MCP do n8n configurado no Claude Code
- [ ] Os 7 secrets em mãos:
  - META_GRAPH_TOKEN
  - META_AD_ACCOUNT_ID (formato `act_XXXXXXXXX`)
  - REONIC_API_KEY (formato `Basic XXXX`)
  - N8N_API_KEY (JWT do n8n)
  - VERCEL_TOKEN
  - GITHUB_REPO_URL (`https://github.com/USER/dashboard-revert.git`)
  - Senha do dashboard (16+ chars)

---

## ⚙️ Setup (15-20 minutos)

### 1. Criar o projeto local

```powershell
# Windows PowerShell
cd "C:\Users\frizo\Documents\Projetos Claude"
mkdir "Dashboard Revert"
cd "Dashboard Revert"

git init
git remote add origin https://github.com/cleitonfrizon/dashboard-revert.git
git branch -M main
```

### 2. Descompactar o pacote AIOX

Descompacte `dashboard-revert-aiox.zip` dentro de `Dashboard Revert/`.

A estrutura deve ficar:
```
Dashboard Revert/
├── README.md
├── PROMPT_MESTRE_FINAL.md
├── GUIA_EXECUCAO.md
├── .env.example
├── .gitignore
└── docs/
    ├── prd.md
    ├── architecture.md
    ├── data-schema.md
    ├── brand-system.md
    └── stories/
        ├── 1.1.story.md ... 1.10.story.md
```

### 3. Criar `.env.local` com seus secrets

```powershell
# Copiar template
cp .env.example .env.local
# Editar com VS Code, Notepad++ ou o editor de sua preferência
notepad .env.local
```

Substitua os placeholders `<PREENCHER_...>` pelos valores reais. **Atenção especial**:

- `DASHBOARD_PASSWORD_RAW`: senha forte 16+ chars (será hasheada com bcrypt pelo @dev)
- `META_AD_ACCOUNT_ID`: prefixo `act_` é obrigatório

### 4. Configurar DNS no Registro.br

Acesse `registro.br` → seu domínio `escalanegociosdigitais.com.br` → DNS → criar registro:

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `dashboard` | `cname.vercel-dns.com` |

Propagação leva 10min-1h. Faça agora.

### 5. Verificar logins de CLI

```powershell
vercel whoami       # se erro: vercel login
gh auth status      # se erro: gh auth login
node --version      # >= 20
claude --version
```

### 6. Configurar MCP do n8n

```powershell
claude mcp list
```

Se "n8n" não aparecer, adicione:

```powershell
claude mcp add n8n --type http --url https://n8n.escalanegociosdigitais.com.br/mcp-server/http --header "X-N8N-API-KEY: <COLAR_N8N_API_KEY>"
```

### 7. Garantir `.env.local` NÃO vai pro Git

```powershell
git status
# Não deve aparecer .env.local na lista
```

Se aparecer, conferir `.gitignore` (já vem no pacote, mas pode estar fora do lugar).

---

## 🚀 Execução overnight (6 a 8 horas)

### 1. Abrir o Claude Code

```powershell
cd "C:\Users\frizo\Documents\Projetos Claude\Dashboard Revert"
claude --dangerously-skip-permissions
```

### 2. Colar o prompt mestre

Abra `PROMPT_MESTRE_FINAL.md`, role até a linha tracejada, copie TUDO daí pra baixo. Cole no chat do Claude Code. Aperte Enter.

### 3. Acompanhar primeiros 30 minutos

Recomendo acompanhar a Story 1.1 (workflow n8n criado via MCP) para validar que está tudo OK. Se travar:

- Verificar `claude mcp list` mostra "n8n"
- Verificar `.env.local` tem todas as variáveis necessárias
- Conferir que workflow `dYJBsmLbfhaU5Og0` não foi alterado

### 4. Receber notificações nos checkpoints

Você receberá 3 notificações via Obsidian workflow `Qcjrrzy17k2sdq8M`:

1. ✅ Story 1.1 — workflow Aggregator ativo
2. ✅ Story 1.3 — primeiro preview no Vercel
3. ✅ Story 1.10 — produção com domínio próprio

---

## ☀️ Manhã seguinte (15-30 minutos)

### 1. Revisar o relatório

```powershell
cd "C:\Users\frizo\Documents\Projetos Claude\Dashboard Revert"
cat docs/EXECUTION-REPORT.md
git log --oneline
```

### 2. Acessar produção

Abra `https://dashboard.escalanegociosdigitais.com.br` no browser. Logue com a senha em `DASHBOARD_PASSWORD_RAW`.

Confira:
- ✅ Bloco A — Hero do Dia com 4 cards
- ✅ Bloco B — Funil ao Vivo
- ✅ Bloco C — Performance por Campanha
- ✅ Bloco D — Velocidade Comercial

### 3. Validações de segurança

```powershell
# Confirmar que .env.local não foi commitado
git log --all --full-history --source -- .env.local
# Não deve retornar nada
```

### 4. Rotacionar tokens expostos (importante)

Os tokens passaram por chat/arquivos — boa prática rotacionar:

```powershell
# Meta Graph Token: Business Settings → System Users → Generate New Token
# Reonic API Key: painel Reonic → gerar nova
# Vercel Token: vercel tokens rm <id> && vercel tokens create
# n8n API Key: já expira em jun/2026, pode trocar antes
```

Após rotacionar, atualizar:
- `.env.local` (local)
- Vercel env vars (`vercel env add` ou painel web)
- Credentials do n8n nos workflows

### 5. Restringir CORS (se @dev não fez)

No workflow `Revert Dashboard API` no n8n, alterar o header CORS:
- De: `Access-Control-Allow-Origin: *`
- Para: `Access-Control-Allow-Origin: https://dashboard.escalanegociosdigitais.com.br`

### 6. Compartilhar com Robson e Paulo

Por canal seguro (1Password ou WhatsApp mensagem efêmera):

```
🚀 Dashboard de BI Revert no ar

URL: https://dashboard.escalanegociosdigitais.com.br
Senha: [enviada por 1Password]

Atualiza a cada 30 minutos automaticamente.
Dúvidas: me avisa direto.

— Escala Negócios Digitais
```

---

## 💰 Custo estimado

| Item | Custo |
|---|---|
| Claude API (overnight) | R$ 150-300 |
| Vercel | R$ 0 (Free tier) |
| GitHub | R$ 0 (Private free) |
| n8n self-hosted | R$ 0 (já roda) |
| Domínio | R$ 0 (já tem) |
| **TOTAL** | **R$ 150-300** |

Vs. estimativa Lovable de R$ 3.450 → **economia ~R$ 3.150** na Sprint 1.

---

## ⚠️ Riscos e mitigações

| Risco | Probabilidade | Ação |
|---|---|---|
| Reonic API responde formato inesperado | Média | Claude registra ADR + ajusta. Acompanhe Story 1.1 |
| Build Vite falha em alguma config | Baixa | @qa pega antes de @devops *push |
| Token Meta sem scopes suficientes | Média | Se Story 1.1 falhar buscando insights, regenerar com `ads_read`, `ads_management`, `read_insights`, `business_management` |
| MCP n8n rate limit | Baixa | Claude reaplica retry |
| Robson não gostar do layout | Média | Iterar manualmente — base já está pronta |
| DNS não propagou na 1.10 | Baixa | Claude marca warning, você ativa manual depois |

---

## 📞 Quando me chamar de volta

- Se o Claude Code travar e não conseguir continuar
- Para Sprint 2 (Blocos E e F) quando pré-requisitos prontos
- Para integração Google Ads (Fase 2)
- Para replicar para Portocaril (fork + ajustes)
- Para feature nova fora das 10 stories

---

## 🎯 Resumo de uma frase

**Configure `.env.local`, descompacte o ZIP no repo, abra `claude --dangerously-skip-permissions`, cole o prompt mestre, durma. Manhã seguinte: URL no ar.**

Boa execução! 🚀

---

*Performance não é sorte. É método.*
*Escala Negócios Digitais — Cascavel · Toledo · Florianópolis*
