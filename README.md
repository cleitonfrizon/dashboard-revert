# Dashboard de BI Revert — Pacote AIOX (v2)

> Pacote consolidado para execução autônoma do projeto Dashboard de BI da Revert Energia Solar via Claude Code + AIOX + MCP n8n.
>
> **Versão:** 2.0 — 12/05/2026
> **Stack:** Vite + React 18 + TypeScript + Tailwind + Vercel + n8n
> **Cliente:** Revert Energia Solar Toledo
> **Owner:** Escala Negócios Digitais

---

## 📦 Conteúdo do pacote

```
dashboard-revert-aiox/
├── README.md                          ← este arquivo
├── PROMPT_MESTRE_FINAL.md             ← prompt para colar no Claude Code
├── GUIA_EXECUCAO.md                   ← passo-a-passo completo
├── .env.example                       ← template de variáveis (sem secrets)
├── .gitignore                         ← protege .env.local e outros
└── docs/
    ├── prd.md                         ← Product Requirements Document
    ├── architecture.md                ← Arquitetura técnica + 28 ADRs
    ├── data-schema.md                 ← Schema Reonic + Meta + JSON consolidado
    ├── brand-system.md                ← Identidade visual Escala (paleta, fontes, regras)
    ├── decisions/                     ← ADRs adicionais geradas durante execução
    ├── n8n-workflows/                 ← Exports dos workflows criados (Stories 1.1 e 1.2)
    └── stories/
        ├── 1.1.story.md               ← Setup workflow Aggregator n8n
        ├── 1.2.story.md               ← Endpoint REST /webhook/dashboard/revert
        ├── 1.3.story.md               ← Setup Vite + autenticação
        ├── 1.4.story.md               ← Bloco A — Hero do Dia
        ├── 1.5.story.md               ← Bloco B — Funil ao Vivo
        ├── 1.6.story.md               ← Bloco C — Performance por Campanha
        ├── 1.7.story.md               ← Bloco D — Velocidade Comercial
        ├── 1.8.story.md               ← Bloco E — Mix de Produto (Sprint 2)
        ├── 1.9.story.md               ← Bloco F — Saturação Criativa (Sprint 2)
        └── 1.10.story.md              ← Deploy Vercel + domínio próprio
```

---

## 🚀 Quick Start

### 1. Setup do projeto (15 min)

```powershell
# Windows PowerShell
cd "C:\Users\frizo\Documents\Projetos Claude"
mkdir "Dashboard Revert" && cd "Dashboard Revert"

# Inicializar Git e conectar ao repo do GitHub (já criado vazio)
git init
git remote add origin https://github.com/cleitonfrizon/dashboard-revert.git
git branch -M main

# Descompactar este pacote dentro da pasta atual
# (Use Windows Explorer ou: tar -xf dashboard-revert-aiox.zip --strip-components=1)
```

### 2. Configurar secrets

Copie `.env.example` para `.env.local` e preencha com os valores reais (recebidos via canal seguro, NÃO commitar):

```powershell
cp .env.example .env.local
# Edite .env.local com seus secrets
```

### 3. DNS

No Registro.br, criar CNAME `dashboard.escalanegociosdigitais.com.br` → `cname.vercel-dns.com`.
A propagação leva 10min-1h.

### 4. Validar MCP do n8n

```powershell
claude mcp list
# Deve aparecer "n8n". Se não, configurar.
```

### 5. Executar

```powershell
claude --dangerously-skip-permissions
```

Cole o conteúdo do `PROMPT_MESTRE_FINAL.md` (parte abaixo da linha tracejada). Aperte Enter. Acompanhe os primeiros 30min. Depois vai dormir — você acorda com tudo no ar.

---

## 🛣️ Roadmap das stories

### Sprint 1 (até 19/05/2026) — MVP

| # | Story | Output | Estimativa |
|---|---|---|---|
| 1.1 | Workflow Aggregator n8n | Workflow rodando, cache JSON gerado | 4-5h |
| 1.2 | Endpoint REST autenticado | Bearer token funcionando | 1-2h |
| 1.3 | Setup Vite + Auth Shell | App vazio com login | 2h |
| 1.4 | Bloco A — Hero do Dia | 4 cards superiores | 1h |
| 1.5 | Bloco B — Funil ao Vivo | Funil em 5 etapas | 1.5h |
| 1.6 | Bloco C — Performance Campanha | Tabela densa ordenável | 2h |
| 1.7 | Bloco D — Velocidade Comercial | Distribuição + Hall da Vergonha | 1.5h |
| 1.10 | Deploy + domínio próprio | URL em produção autenticada | 2h |

### Sprint 2 (próximas 2 semanas)

| # | Story | Pré-requisito |
|---|---|---|
| 1.8 | Bloco E — Mix de Produto | Reonic com campo `produto` preenchido |
| 1.9 | Bloco F — Saturação Criativa | 7+ dias de histórico de criativos |

---

## 🎨 Identidade visual

O dashboard usa **rigorosamente** a identidade Escala Brand System dark premium. Consulte `docs/brand-system.md` para paleta, tipografia, componentes assinatura, regras invioláveis e frases oficiais.

**Cores principais:**
- Preto `#0A0A0A` — fundo
- Dourado `#C8A84E` — destaques
- Navy `#0D1B2A` — gradientes

**Fontes:**
- Poppins (corpo + UI)
- Playfair Display (números grandes + quotes editoriais)

---

## ✅ Critérios de aceite do MVP (Sprint 1)

O MVP passa se o Robson consegue responder estas 7 perguntas em 30 segundos abrindo o dashboard pela manhã:

1. Quanto gastei ontem em mídia paga?
2. Quantos leads entraram ontem e de qual canal?
3. Quantos leads do mês não foram atendidos?
4. Onde está o gargalo do funil hoje?
5. Qual produto está dando mais retorno por canal?
6. Algum criativo está saturando?
7. Meta vs Google — qual está com melhor ROI esta semana?

---

## 🔒 Segurança

- `.env.local` **nunca** commitar (já está no `.gitignore`)
- Tokens em secrets do Vercel para produção (`vercel env add`)
- Após primeiro deploy: **rotacionar todos os tokens** que circularam por canais menos seguros
- Senha do dashboard deve ter 16+ chars (bcrypt hash, salt 10)
- HTTPS obrigatório em todo o stack

---

## 📡 Stack confirmada

| Camada | Tecnologia |
|---|---|
| Frontend | Vite 5 + React 18 + TypeScript 5 |
| UI | Tailwind CSS 3 + shadcn/ui |
| Gráficos | Recharts 2.x |
| Roteamento | React Router v6 |
| Estado | React Context API + useReducer |
| Datas | date-fns + date-fns-tz |
| Validação | Zod |
| Hash senha | bcryptjs |
| Backend | n8n self-hosted (escalanegociosdigitais.com.br) |
| Hospedagem | Vercel (Free tier) |
| Versionamento | Git + GitHub privado |
| CI/CD | Vercel preview + tag `v1.0.0-mvp` |

---

## 📚 Referências

- **Reunião de aprovação:** 12/05/2026 com Robson (Revert)
- **Ata:** `Ata_Reuniao_Revert_12mai2026.docx`
- **Automação Meta→Reonic já em produção:** Workflow n8n `dYJBsmLbfhaU5Og0` (NÃO MEXER)
- **Endpoint Reonic h360:** `POST https://api.reonic.de/rest/v2/clients/29d4c1e4-d67a-4c89-99bb-8980f5bad9dc/h360/request/create`

---

## 💰 Custo

| Item | Estimado |
|---|---|
| API Claude (overnight) | R$ 150-300 |
| Vercel Free | R$ 0 |
| GitHub Private | R$ 0 |
| n8n self-hosted | R$ 0 (já roda) |
| **Total Sprint 1** | **R$ 150-300** |

Vs. estimativa Lovable: R$ 3.450. Economia: **R$ 3.150**.

---

*Pacote AIOX v2 — Escala Negócios Digitais — 12/05/2026*
*Performance não é sorte. É método.*
