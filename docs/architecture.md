# Architecture — Dashboard de BI Revert (v2)

**Project:** Dashboard de BI Revert
**Architect:** Cleiton Frizon (Escala Negócios Digitais)
**Created:** 2026-05-12
**Updated:** 2026-05-12 (v2 — migração Lovable → Vite+Vercel)
**Status:** Approved
**PRD Reference:** `prd.md`

---

## 1. Overview

Sistema web SPA com backend agregador. Front-end React+TS+Vite hospedado no Vercel. Backend n8n self-hosted consolida múltiplas fontes (Meta Graph API + Reonic API v2) em endpoint REST único com cache em arquivo.

**Princípio-chave:** o front consome **apenas um endpoint** do n8n. Toda complexidade de integração e cálculo de métricas vive no workflow n8n. Isso permite trocar o front no futuro sem refazer a lógica.

---

## 2. Diagrama de Arquitetura

```
┌───────────────────────────────────────────────────────────────┐
│                       FONTES DE DADOS                         │
├───────────────────────────────────────────────────────────────┤
│   ┌──────────────────┐         ┌──────────────────────┐      │
│   │ Meta Graph API   │         │  Reonic API v2       │      │
│   │ (campanhas,      │         │  (leads, status,     │      │
│   │  gasto, insights)│         │   propostas, vendas) │      │
│   └────────┬─────────┘         └──────────┬───────────┘      │
└────────────┼────────────────────────────────┼─────────────────┘
             │                                │
             ▼                                ▼
   ┌─────────────────────────────────────────────────────┐
   │  n8n self-hosted (escalanegociosdigitais.com.br)    │
   │                                                     │
   │  ┌──────────────────────────────────────────────┐  │
   │  │ Workflow EXISTENTE (NÃO MEXER):              │  │
   │  │ dYJBsmLbfhaU5Og0                             │  │
   │  │ Meta Lead Ads → Reonic (Production)          │  │
   │  └──────────────────────────────────────────────┘  │
   │                                                     │
   │  ┌──────────────────────────────────────────────┐  │
   │  │ Workflow NOVO 1 — Story 1.1:                 │  │
   │  │ Revert Dashboard Aggregator                  │  │
   │  │                                              │  │
   │  │ Cron */30 ──► Fetch Meta + Reonic ──►       │  │
   │  │ Calc Metrics ──► Write /tmp/cache.json      │  │
   │  └──────────────────────────────────────────────┘  │
   │                                                     │
   │  ┌──────────────────────────────────────────────┐  │
   │  │ Workflow NOVO 2 — Story 1.2:                 │  │
   │  │ Revert Dashboard API                         │  │
   │  │                                              │  │
   │  │ GET /webhook/dashboard/revert                │  │
   │  │ Header: Authorization: Bearer <token>        │  │
   │  │   ↓                                          │  │
   │  │ Validate → Read cache → Return JSON          │  │
   │  └──────────────────────────────────────────────┘  │
   └─────────────────────┬───────────────────────────────┘
                         │ HTTPS GET com Bearer token
                         ▼
   ┌─────────────────────────────────────────────────────┐
   │  Vercel (dashboard.escalanegociosdigitais.com.br)   │
   │                                                     │
   │  ┌──────────────────────────────────────────────┐  │
   │  │ Vite + React 18 + TS + Tailwind              │  │
   │  │ ┌──────────────────────────────────────────┐ │  │
   │  │ │  AuthProvider (senha bcrypt + JWT local) │ │  │
   │  │ └──────────┬───────────────────────────────┘ │  │
   │  │            ▼                                 │  │
   │  │ ┌──────────────────────────────────────────┐ │  │
   │  │ │  DashboardContainer                      │ │  │
   │  │ │  • Filtro global período                 │ │  │
   │  │ │  • Loading skeleton                      │ │  │
   │  │ │  • Error boundary                        │ │  │
   │  │ │                                          │ │  │
   │  │ │  ┌─────┐┌─────┐┌─────┐┌─────┐           │ │  │
   │  │ │  │ A   ││ B   ││ C   ││ D   │           │ │  │
   │  │ │  └─────┘└─────┘└─────┘└─────┘           │ │  │
   │  │ │  ┌─────┐┌─────┐                         │ │  │
   │  │ │  │ E   ││ F   │                         │ │  │
   │  │ │  └─────┘└─────┘                         │ │  │
   │  │ └──────────────────────────────────────────┘ │  │
   │  └──────────────────────────────────────────────┘  │
   └─────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack

### Backend (n8n)
- **Plataforma:** n8n self-hosted v1.x
- **URL:** `https://n8n.escalanegociosdigitais.com.br`
- **VPS:** Contabo `5.189.146.3` (Ubuntu 24.04, SSH porta 2222)
- **Proxy:** Traefik + Let's Encrypt
- **DB:** PostgreSQL (n8n / Escala2026n8nDB)
- **Cache:** arquivo JSON em `/tmp/revert-dashboard-cache.json` (TTL 15min)

### Frontend (Vite + Vercel)
- **Build:** Vite 5
- **Framework:** React 18 + TypeScript 5
- **Estilos:** Tailwind CSS 3
- **Componentes:** shadcn/ui
- **Gráficos:** Recharts 2.x
- **HTTP:** fetch nativo
- **Estado:** React Context API + useReducer
- **Routing:** React Router v6
- **Datas:** date-fns + date-fns-tz
- **Validação:** Zod
- **Hash:** bcryptjs (Node-only)
- **Hospedagem:** Vercel Free tier
- **Domínio:** dashboard.escalanegociosdigitais.com.br (CNAME → cname.vercel-dns.com)

### Integrações externas
- **Meta Graph API:** v23.0
- **Reonic API:** v2 (`https://api.reonic.de/rest/v2`)
- **Reonic Client ID:** `29d4c1e4-d67a-4c89-99bb-8980f5bad9dc`

---

## 4. Fluxo de Dados

### 4.1 Ciclo de atualização (cron 30min)

```
Trigger */30 ──┐
               ▼
    ┌─────────────────┐    ┌─────────────────┐
    │ Branch Meta:    │    │ Branch Reonic:  │
    │ campaigns       │    │ requests        │
    │ insights        │    │ offers          │
    │ ads             │    │                 │
    └────────┬────────┘    └────────┬────────┘
             │                      │
             └──────────┬───────────┘
                        ▼
            ┌────────────────────────┐
            │ Merge & Calculate      │
            │ (CPL, CAC, taxas,      │
            │  saturação, mix)       │
            └────────────┬───────────┘
                         ▼
            ┌────────────────────────┐
            │ Write JSON to disk     │
            │ /tmp/cache.json        │
            └────────────────────────┘
```

### 4.2 Consulta do front

```
Usuario abre dashboard
  ↓
React: fetch(VITE_DASHBOARD_API_URL, { headers: Authorization: Bearer })
  ↓
n8n: valida token → lê /tmp/cache.json → retorna JSON
  ↓
React renderiza Blocos A-F
```

---

## 5. ADRs — 28 Decisões Arquiteturais

| ID | Decisão | Justificativa |
|---|---|---|
| ADR-001 | Frontend SPA estática no Vercel. Sem SSR. | Não há SEO crítico; usuários autenticados |
| ADR-002 | Único endpoint backend autenticado por Bearer | Simplifica integração, isola complexidade |
| ADR-003 | Cache em arquivo `/tmp/revert-dashboard-cache.json`, TTL=15min | Simplicidade; ~100KB carrega em ms |
| ADR-004 | Cron Aggregator `*/30 * * * *`, TZ São Paulo | Balance entre frescor e rate limit Meta |
| ADR-005 | Auth: bcrypt em env + JWT client-side em sessionStorage | Apenas 3 usuários — overkill OAuth |
| ADR-006 | Arquitetura de pastas conforme seção 7 deste doc | Padrão React reconhecível |
| ADR-007 | shadcn instalados sob demanda (não copiar tudo) | Bundle menor |
| ADR-008 | Tema escuro permanente, sem toggle | Identidade Escala dark premium |
| ADR-009 | MQL placeholder até Robson definir: `status IN ('qualified', 'proposal_sent', 'negotiating', 'closed_won')` | Não bloqueia entrega; parametrizável |
| ADR-010 | Cruzamento Meta × Reonic via parser do campo `note` | UTM no note já é padrão do workflow legacy |
| ADR-011 | Tempo resposta: `firstContactAt OR updatedAt - createdAt` | Fallback se Reonic não tiver firstContactAt |
| ADR-012 | PII: telefone `(45) ****-1234`, email completo só no Hall | Reduz risco de vazamento |
| ADR-013 | Loading: shadcn `<Skeleton />`, nunca spinner | UX percebida melhor |
| ADR-014 | Error boundary global + por bloco | Falha de um bloco não derruba dashboard |
| ADR-015 | UI em PT-BR, termos técnicos em inglês permitidos | Convenção marketing digital |
| ADR-016 | `Intl.NumberFormat('pt-BR')` para R$ e % | Padrão BR |
| ADR-017 | Workflow `dYJBsmLbfhaU5Og0` INTOCÁVEL | Em produção; isolar risco |
| ADR-018 | Workflows novos com "Available in MCP" habilitado | Para Claude Code atualizar via MCP |
| ADR-019 | Retry 3x com backoff (1s, 3s, 9s) | Padrão resilência API |
| ADR-020 | Falha de API → último cache + log | NUNCA sobrescrever com erro |
| ADR-021 | Bloco E renderiza EmptyState se Reonic sem campo `produto` | Não bloqueia outros blocos |
| ADR-022 | Bloco F só calcula tendência com 7+ dias histórico | Antes disso, "Coletando dados" |
| ADR-023 | `window.onerror` → POST workflow `Qcjrrzy17k2sdq8M` | Observabilidade |
| ADR-024 | Conventional commits: `feat(dashboard): Story 1.X — desc` | Padrão CI |
| ADR-025 | `vercel --prebuilt` em cada story DONE; prod só na 1.10 | Preview por story |
| ADR-026 | CORS v1: `*`; v2 (após 1.10): restrito ao domínio próprio | Iteração progressiva |
| ADR-027 | Sem testes automatizados na v1; validação manual via @qa | Velocity primeiro |
| ADR-028 | Stories 1.8/1.9 BLOCKED se pré-requisitos externos faltarem | Não tentar implementar sem dados |

---

## 6. Modelo de Segurança

### 6.1 Auth no endpoint n8n
- Header `Authorization: Bearer <TOKEN>` obrigatório
- Token 64 chars random, armazenado:
  - n8n: como Credential
  - Vercel: como env `VITE_DASHBOARD_API_TOKEN`
- Rotacionável a qualquer momento

### 6.2 Auth no front
- v1: senha compartilhada + bcrypt em env (salt 10)
- Sessão: JWT HS256 client-side em sessionStorage
- Logout limpa sessionStorage

### 6.3 PII
- Telefones mascarados: `(45) ****-1234`
- E-mails completos só no Hall da Vergonha
- CPF nunca exibido
- Logs n8n: apenas IDs

### 6.4 Network
- HTTPS obrigatório
- CORS v1 `*` → v2 restrito ao domínio próprio
- Sem WebSocket

---

## 7. Estrutura de Pastas (Vite)

```
dashboard-revert/
├── public/
│   └── escala-logo.png
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── theme.ts
│   ├── index.css
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── AuthContext.tsx
│   │   └── ProtectedRoute.tsx
│   ├── components/
│   │   ├── DashboardContainer.tsx
│   │   ├── PeriodFilter.tsx
│   │   ├── BlocoA_Hero.tsx
│   │   ├── BlocoB_Funil.tsx
│   │   ├── BlocoC_Campanhas.tsx
│   │   ├── BlocoD_Velocidade.tsx
│   │   ├── BlocoE_Mix.tsx
│   │   ├── BlocoF_Saturacao.tsx
│   │   └── shared/
│   │       ├── Card.tsx
│   │       ├── DeltaBadge.tsx
│   │       ├── EmptyState.tsx
│   │       ├── Sparkline.tsx
│   │       └── FunnelStage.tsx
│   ├── hooks/
│   │   ├── useDashboardData.ts
│   │   ├── useAuth.ts
│   │   └── useTableSort.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── formatters.ts
│   │   └── utils/
│   │       └── status.ts
│   └── components/ui/  ← shadcn (auto-generated)
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── data-schema.md
│   ├── brand-system.md
│   ├── stories/
│   ├── decisions/
│   └── n8n-workflows/
├── .env.example
├── .env.local            ← NÃO commitar
├── .gitignore
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 8. Naming Conventions

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes React | PascalCase com prefixo Bloco | `BlocoA_Hero.tsx` |
| Hooks | camelCase `use*` | `useDashboardData` |
| Utilities | camelCase | `formatters.ts` |
| Constantes | SCREAMING_SNAKE_CASE | `CACHE_TTL_MS` |
| Workflows n8n | PT-BR descritivo | `Revert Dashboard Aggregator` |
| Nodes n8n | PT-BR: `Verbo Substantivo` | `Calcular CPL por Campanha` |

---

## 9. Error Handling

### Backend (n8n)
- Try/catch em todos HTTP requests
- Falha → usar último cache válido + logar
- Retry com backoff: 3 tentativas (1s, 3s, 9s)
- Notificação Slack/WhatsApp se falhar 3x seguidas

### Frontend (React)
- Error Boundary global no `App.tsx`
- Cada bloco com try/catch
- Loading skeleton durante fetch inicial
- Estado de erro com "Tentar novamente"

---

## 10. Performance Targets

| Métrica | Alvo |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3.5s |
| Resposta endpoint (cache hit) | < 500ms |
| Bundle size | < 300KB gzip |
| Atualização cache n8n | < 30s end-to-end |

---

## 11. Roadmap de Evolução

| Versão | Mudança | Quando |
|---|---|---|
| v1.0 | Setup inicial (este doc) | Sprint 1 |
| v1.1 | Magic link auth | Sprint 2 |
| v1.2 | CORS restrito + monitoring | Sprint 2 |
| v1.3 | Integração Google Ads | Junho/2026 |
| v1.4 | Sentry + alertas | Julho/2026 |
| v2.0 | Multi-tenant (Portocaril) | Conforme demanda |
| v2.1 | WebSocket real-time | Se demandar |

---

## 12. Constraints

- **Meta Graph API rate limit:** 200 calls/hora — mitigado por cache 30min
- **Reonic API rate limit:** ~100 calls/hora (assumido) — monitorar
- **Vercel Free tier:** 100GB bandwidth/mês — suficiente para 3-5 usuários
- **n8n VPS:** 4GB RAM, 2 vCPUs — Aggregator deve consumir < 200MB pico
- **Tempo desenvolvimento:** Claude Code autônomo + Cleiton revisor

---

## 13. Glossário

| Termo | Definição |
|---|---|
| MQL | Marketing Qualified Lead — critério a definir com Robson |
| CPL | Custo Por Lead = gasto / leads Reonic |
| CAC | Custo Aquisição = gasto / vendas fechadas |
| CTW | Click-to-WhatsApp — campanha Meta |
| Smart Revert | Produto residencial (R$ 14-25K) |
| H360 | Endpoint Reonic residencial |
| Hall da Vergonha | Leads não atendidos > 24h |
| Saturação criativa | Anúncio com performance degradada |

---

*Architecture v2 — aprovada 12/05/2026 com 28 ADRs pré-aprovadas para execução autônoma*
