# Execution Report — Dashboard de BI Revert

**Última atualização:** 2026-05-13
**Status produção:** ✅ Operacional (HTTP 200)
**Tag MVP:** `v1.0.0-mvp` (12/05/2026)
**Último commit em main:** `f2643bb` (13/05/2026)

---

## Resumo executivo

O MVP foi entregue em **12/05/2026** após uma sessão única de execução (10 stories, R$ 0 de custo extra além das R$ 150-300 de API). Em **13/05/2026** uma segunda sessão entregou seis blocos de evolução pós-MVP: correção crítica de senha em produção, rotação de credenciais sensíveis, robustez de dados (paginação Reonic + Meta API v25.0 + HTTP status codes), observabilidade via Sentry, polimento de UX e preparação completa para Google Ads. Total de **6 commits no main, todos validados em produção**.

---

## URLs em produção

| Recurso | URL | Status |
|---|---|---|
| Dashboard | https://dashboard.escalanegociosdigitais.com.br | ✅ HTTP 200 |
| Alias Vercel | https://dashboard-revert.vercel.app | ✅ HTTP 200 |
| Webhook n8n | https://n8n.escalanegociosdigitais.com.br/webhook/dashboard/revert | ✅ Bearer + CORS restrito |
| Repositório | https://github.com/cleitonfrizon/dashboard-revert | ✅ sincronizado |
| Workflow n8n | `AJypFIeC4rMcs18P` (Revert Dashboard) | ✅ active=true, cron `0 */30 * * * *` |
| Projeto Vercel | `escalanegociosdigitais-3508/dashboard-revert` | ✅ deploy prod ativo |

---

## Sprint 1 — MVP (12/05/2026)

10 stories entregues em uma sessão. Todas as 7 perguntas do critério de aceite respondíveis em 30 segundos no dashboard.

| Story | Status | Observação |
|---|---|---|
| 1.1 Aggregator n8n | ✅ Done | Consolidado com 1.2; tempo médio execução ~9s |
| 1.2 Endpoint REST | ✅ Done | Webhook GET com Bearer; CORS restrito |
| 1.3 Setup Vite + Auth Shell | ✅ Done | bcrypt + sessionStorage |
| 1.4 Bloco A — Hero | ✅ Done | 4 cards com semáforo CPL + delta vs 7d |
| 1.5 Bloco B — Funil | ✅ Done | 5 etapas + benchmark |
| 1.6 Bloco C — Campanhas | ✅ Done | Tabela ordenável + totalizador |
| 1.7 Bloco D — Velocidade | ✅ Done | 5 buckets + Hall da Vergonha + médias 30d |
| 1.8 Bloco E — Mix | ⏳ Done-Partial | EmptyState aguardando Q-4 (Robson) |
| 1.9 Bloco F — Saturação | ⏳ Done-Partial | Ativo, tendências CTR/CPL zeradas até 7d+ histórico |
| 1.10 Deploy prod + domínio + CORS | ✅ Done | Custom domain ativo |

---

## Sprint 2 — Evolução pós-MVP (13/05/2026)

Sessão única que entregou 6 blocos de melhorias em sequência. Cada bloco gerou 1 commit em main, todos validados em produção antes do próximo.

### 1. Correção crítica de senha (commit `9e8b05d`)

**Sintoma:** Dashboard rejeitava qualquer senha como "incorreta" mesmo após rotação.

**Causa raiz:** As variáveis `VITE_*` (HASH/API_URL/API_TOKEN) nunca foram adicionadas no Vercel via `vercel env add`. Como `VITE_*` é inlineado pelo Vite em **build-time**, o bundle saiu sem hash, e `bcrypt.compareSync(senha, undefined)` retorna `false` para qualquer entrada. Bug #9 da tabela.

**Fix aplicado:**
- `vercel env add VITE_DASHBOARD_PASSWORD_HASH production` + URL + TOKEN
- `vercel --prod` regerou bundle com hash inlineado
- Logo PNG oficial 1440×1440 (`public/escala-logo.png`) substituiu o SVG fallback
- `Header.tsx` + `LoginPage.tsx` apontando pro `.png`

### 2. Rotação de credenciais (commit incluído em `9e8b05d`)

Tokens expostos no chat foram trocados ainda durante a sessão:

| Credencial | Onde | Ação |
|---|---|---|
| `DASHBOARD_API_TOKEN` (Bearer do webhook) | n8n (jsCode do node `Validar Token e Servir Cache`) + Vercel env | Novo token 64-char hex; cache n8n atualizado via PATCH na API; bundle frontend regerado |
| Senha do dashboard | Hash bcrypt(10) em `VITE_DASHBOARD_PASSWORD_HASH` | Nova senha 22-char gerada; substituída no Vercel + redeploy |

Validação: token velho retorna HTTP 401 `INVALID_TOKEN`, token novo retorna `ok:true`. Senha velha não autentica mais.

### 3. Robustez de dados (commit `289244d`)

Três fixes técnicos em sequência no workflow `AJypFIeC4rMcs18P`:

**3.1 HTTP status codes corretos no webhook (resolve ADR-031)**

`Respond JSON.options.responseCode` virou expressão dinâmica `={{ $json._httpStatus }}`. Agora o webhook retorna HTTP 401 com token inválido (era 200 antes) e HTTP 503 quando cache ausente (cold start).

**3.2 Paginação Reonic — `/contacts` e `/h360/offers`**

Nodes `Buscar Contacts Reonic` e `Buscar Offers Reonic` migrados de `httpRequest` para `code` com loop `for (page = 1..50)` até resposta vazia. Header correto da Reonic: `x-authorization` (não `Authorization` — daí o "There is no Authentication header" enganoso em testes manuais).

| Endpoint | Antes (1 página) | Depois (paginado) |
|---|---|---|
| `/contacts` | 100 itens | **234 itens** |
| `/h360/offers` | 100 itens | **234 itens** |
| `funil.leads` no cache | 21 | **49** |

**3.3 Meta Graph API v23.0 → v25.0**

3 nodes Meta (`Campanhas`, `Insights`, `Ads`) com URL atualizada antes da deprecação. Execução 354 validou (11 campanhas, 2 insights, 14 ads).

**Bug operacional descoberto:** PUT no workflow via API n8n **sobrescreve `staticData`** se enviado no payload. Solução: omitir `staticData` do payload de PUT preserva o cache em runtime.

### 4. Observabilidade — Sentry frontend (commit `37fc677`)

| Componente | Função |
|---|---|
| `src/lib/sentry.ts` | Helper `initSentry()`, `captureException()`, `SentryErrorBoundary` |
| `main.tsx` | `<SentryErrorBoundary>` envolvendo `<App />` com FallbackUI estilizado (gold/black + botão "Tentar novamente") |
| `useDashboardData.ts` | `captureException` em erros inesperados (ignora `CACHE_REFRESHING`/`INVALID_TOKEN` — fluxo esperado) |
| `beforeSend` | Remove header `Authorization` antes de enviar pro Sentry |
| Config | `sendDefaultPii: false`, `tracesSampleRate: 0.1` em produção |

Sem `VITE_SENTRY_DSN`, todo o SDK é **no-op gracioso** (erros caem em `console.error`). Pendente: você criar projeto em sentry.io e setar a env.

### 5. Polimento UX (commit `b3e8d29`)

| Mudança | Onde | Efeito |
|---|---|---|
| Tick de 30s | `Header.tsx` | "há X min" atualiza sozinho — não fica parado após o load |
| Hover dourado refinado | `.card-escala:hover` (CSS) | Border passa de `gold/20` → `gold/40` + glow sutil; transition 300ms |
| Fade-in stagger | `DashboardContainer.tsx` + `index.css` | Os 4 grupos de blocos surgem em cascata (50/120/200/280 ms) no mount |

### 6. Preparação Google Ads (commits `41a65b3` e `f2643bb`)

**6.1 Discovery (commit `41a65b3`)**
- `docs/stories/2.1.story.md` — plano completo (6 credenciais Google Ads, GAQL queries, pseudo-código n8n, match UTM Reonic, riscos, plano por fase)
- `docs/data-schema.md` v1.1 — seção §9 Google Ads + Q-6 (MCC + customer_id) e Q-7 (UTMs no GTM) abertas
- `types.ts` — `GoogleAdsBlock` + `GoogleAdsCampaignRow`; `DashboardCache.google_ads` opcional; `sources_status.google_ads` com estado `'not_configured'`
- `BlocoG_GoogleAds.tsx` — placeholder em produção: `EmptyState "Aguardando configuração"` enquanto `not_configured`. Quando dados chegarem, mostra totais (spend 30d, conversões 30d) + tabela top 8 com CPL real (match UTM Reonic)

**6.2 Coluna Canal no Bloco C (commit `f2643bb`)**
- `AdChannel` type (`'meta' | 'google'`) e `channel?: AdChannel` em `CampanhaRow`
- `ChannelPill` no Bloco C: pill azul para Meta, amarelo para Google
- Filtro Todos/Meta/Google **progressivo** — só aparece quando há > 1 canal nos dados
- Patch `Calcular Metricas` via API n8n: `channel: 'meta'` em todos os items de `campanhasOut`
- Cache validado: 11 campanhas com `channel: 'meta'`

Quando Google Ads ligar via Story 2.1, basta o workflow popular `channel: 'google'` que o filtro aparece automaticamente sem código adicional no frontend.

---

## Métricas antes/depois (sessão 13/05)

| Métrica | Antes | Depois |
|---|---|---|
| Contacts Reonic puxados | 100 (cap) | **234** |
| Offers Reonic puxados | 100 (cap) | **234** |
| `funil.leads` no dashboard | 21 | **49** |
| HTTP status quando token errado | 200 (com `ok:false`) | **401** |
| Meta Graph API | v23.0 | **v25.0** |
| Bundle frontend | 238 KB / 79 KB gzip | **260 KB / 86 KB gzip** |
| Observability frontend | nenhuma | **Sentry SDK ativo (no-op até DSN)** |
| Logo | SVG fallback | **PNG oficial 1440×1440** |
| Canais visíveis no Bloco C | implícito (só Meta) | **Pill explícito + filtro progressivo** |
| Pendências críticas 🔴 | 2 (logo, push GitHub) | **0** |
| Pendências 🟢 do MVP | 8 | **3 (todas dependem de credencial externa)** |

---

## Decisões (ADRs)

| ID | Decisão | Motivo |
|---|---|---|
| ADR-029 | Schema Reonic real (Q-1/Q-2/Q-3 resolvidas) | `data-schema.md` original estava desalinhado com a API real (`/contacts` + `/h360/offers`, status PT-BR custom) |
| ADR-030 | Cache em `workflow.staticData.global` (substitui ADR-003) | Filesystem n8n é read-only — consolidou Aggregator + API em 1 workflow |
| ADR-031 | Logo SVG fallback + paginação Reonic adiada | Ambos resolvidos na sessão 13/05 |

---

## Bugs encontrados e resolvidos

| # | Problema | Causa | Fix |
|---|---|---|---|
| 1 | `Credentials not found` na 1ª execução | Vercel SDK criou nodes Meta sem credential vinculada | PATCH na API n8n adicionando `facebookGraphApi.id` aos 3 nodes |
| 2 | Reonic `/h360/requests` → 404 | Schema esperado errado | Migrou para `/contacts` + `/h360/offers`; ADR-029 |
| 3 | `/tmp/...` não writable | Sandbox do n8n | Migrou para `workflow.staticData`; ADR-030 |
| 4 | `n8n SDK validate` rejeitou `.join('\n')` | Security guard do parser | Substituiu por concatenação `+` |
| 5 | Regex no jsCode patch removeu blocos errados | Pattern guloso `.*?` | Reescreveu jsCode limpo do zero |
| 6 | Reonic contacts retornava 100 items separados | n8n divide arrays em items por padrão | Code com `safeAll().map()` + `unwrap` |
| 7 | `bcrypt.compareSync` retornou false | Linha `VITE_DASHBOARD_PASSWORD_HASH` ficou comentada após patch | Removeu `# ` |
| 8 | `vercel --token "$T"` rejeitado | Token Vercel contém `:` interpretado como separator | `--token vcp_...` + `--scope team_...` |
| 9 | Senha sempre "incorreta" em produção | Envs `VITE_*` nunca foram adicionadas via `vercel env add` → bundle saiu sem hash inlineado | `vercel env add` + `vercel --prod` |
| 10 | Reonic respondia "no Authentication header" mesmo com Authorization | Header da Reonic é `x-authorization`, não `Authorization` | Trocou nome do header nos Code nodes paginados |
| 11 | PUT workflow n8n sobrescreve cache | `staticData` no payload de PUT substitui o do runtime | Omitir `staticData` do payload preserva cache |

---

## Commits da sessão 13/05

```
9e8b05d  fix(dashboard): logo PNG oficial + envs VITE_* + rotações de credenciais
289244d  docs(dashboard): Sprint 2 Robustez — paginação + Meta v25.0 + HTTP status codes
37fc677  feat(dashboard): observability via @sentry/react
b3e8d29  polish(dashboard): tick automático + fade-in stagger + hover refinement
41a65b3  feat(dashboard): Google Ads discovery (Story 2.1 + Bloco G placeholder)
f2643bb  feat(dashboard): coluna Canal no Bloco C (preparando consolidação Meta+Google)
```

Todos pushados pra `main`. Tag `v1.0.0-mvp` no GitHub aponta pro `b3e8d29` (snapshot pré-Google-Ads).

---

## Pendências externas (Cleiton)

### 🟡 Credenciais e configurações pendentes

| Item | Onde criar/obter | Desbloqueia |
|---|---|---|
| `VITE_SENTRY_DSN` | https://sentry.io/signup (free tier 5K events/mês) | Captura real de erros frontend |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | https://ads.google.com/aw/apicenter (MCC Escala → Tools → API Center) | Story 2.1 (aprovação 1-2 dias) |
| `GOOGLE_ADS_CLIENT_ID` + `CLIENT_SECRET` | console.cloud.google.com → OAuth 2.0 Client IDs (Desktop) | Story 2.1 |
| `GOOGLE_ADS_REFRESH_TOKEN` | OAuth flow 1x (scope `adwords`, `access_type=offline`, `prompt=consent`) | Story 2.1 |
| `GOOGLE_ADS_MCC_ID` | Painel MCC Escala (10 dígitos sem traços) | Story 2.1 |
| `GOOGLE_ADS_CUSTOMER_ID` (Revert) | Painel MCC → cliente Revert | Story 2.1 |
| `.env.local` local | Atualizar com senha + DASHBOARD_API_TOKEN novos | Sincronizar com produção |

### 🟡 Rotação de tokens externos ainda expostos no chat

| Token | Onde rotacionar |
|---|---|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens → "Create" + delete o velho |
| `META_GRAPH_TOKEN` | developers.facebook.com → System User → Generate |
| `REONIC_API_KEY` | painel Reonic |
| `N8N_API_KEY` | n8n → Settings → API → revoke + criar novo |

DASHBOARD_API_TOKEN e senha do dashboard **já foram rotacionados** nesta sessão.

### 🟡 Pendências com o Robson

| ID | Pergunta | Desbloqueia |
|---|---|---|
| Q-4 | Campo `produto` no Reonic | Bloco E — Mix de Produto |
| Q-5 | Critério objetivo de MQL | Cálculo de MQL preciso no Bloco C |
| Q-7 | UTMs `google_ads` no GTM da Revert + tag de conversão | Match Google Ads ↔ Reonic na Story 2.1 |

---

## Próximos passos sugeridos

1. **Você cria conta Sentry** (5 min) → me devolve DSN → eu seto no Vercel + redeploy (10 min)
2. **Você aplica pelo developer_token Google Ads** (1-2 dias de aprovação Google)
3. **Você alinha Q-4/Q-5/Q-7 com Robson** (próxima call)
4. **Quando credenciais Google Ads chegarem:** ~3h pra integração end-to-end seguindo Story 2.1
5. **Magic link auth** depende de SMTP no n8n (Gmail/Resend/Mailgun) ou pivotar para WhatsApp/Zaia
6. **Observability no n8n** (enviar erros do workflow pro Sentry via HTTP Request) — depende do DSN

---

## Custo

| Item | Valor |
|---|---|
| Vercel | R$ 0 (free tier; 1 deploy prod ativo) |
| GitHub repo | R$ 0 (privado, account pessoal) |
| n8n self-hosted | R$ 0 incremental (já existia) |
| Domínio | R$ 0 incremental (já existia) |
| Sentry | R$ 0 (free tier, quando você criar o projeto) |
| API Claude (sessões 12-13/05) | R$ 150-300 estimado |
| **Total Sprint 1 + Sprint 2** | **R$ 150-300** |

Versus estimativa inicial Lovable: R$ 3.450. **Economia: R$ 3.150** mantida.

---

*Sprint 1 entregou MVP em 1 sessão. Sprint 2 entregou robustez + observability + UX + preparação Google Ads em outra sessão única, sem regressões. Performance não é sorte. É método.*
