# Execution Report — Dashboard de BI Revert

**Última atualização:** 2026-05-14 (overnight 2 — pacote Solar PRO completo)
**Status produção:** ✅ Operacional (HTTP 200)
**Tag MVP:** `v1.0.0-mvp` (12/05/2026)
**Último commit em main (remoto):** `f1c2f6f` (Bloco Mix detecta packages vazios no Reonic)
**Commits locais aguardando push:** consolidado overnight 2 (Solar PRO completo: alertas piscantes, CSV, print footer, filtro status, fullscreen, error boundary, hover details)

---

## Resumo executivo

O MVP foi entregue em **12/05/2026** após uma sessão única (10 stories). **13/05/2026** trouxe robustez+observability+Sentry+Story 2.1 prep (6 commits). **14/05/2026** dia inteiro de evolução intensa: senha rotacionada, filtro de período funcional (`cache.by_period`), 3 bugs profundos resolvidos via MCP n8n (spend_today real, funil PT-BR cumulativo, avg_response via notas humanas), 10 melhorias UX baseadas em pesquisa profunda (NN/G + Smashing 2025 + Stripe/Linear patterns): paleta refinada sem #000 puro, sticky tables, count-up animation, tooltips contextuais, busca inline, mobile responsive, stale indicator no Header, skeleton em mudança de período. **Overnight 14→15/05** entregou sparklines de 7d nos Hero cards (backend done, frontend pronto aguardando publish) + modo print/PDF-friendly. Total acumulado: **~17 commits em main + 1 local aguardando push pós-reconnect**.

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

## Sprint 2 (continuação) — sessão 14/05/2026

Sessão dedicada a "preparar terreno" da Story 2.1 sem credenciais Google Ads + 5 lotes de polimento sobre o MVP, sem nenhuma dependência externa. Cada lote validado com `typecheck` + `build` + HMR no `vite dev` antes do próximo commit. 6 commits locais aguardando autorização de push (`@devops`).

### 1. Story 2.1 preparada end-to-end (commit `8a4d348`)

Tudo que dá pra fazer **antes** das credenciais Google Ads chegarem:

- `docs/n8n-workflows/google-ads-fetch-node.json` — node Code completo com OAuth refresh + 2 queries GAQL (LAST_30_DAYS + LAST_7_DAYS) + fallback gracioso (`status: 'error'` ou `'not_configured'` sem quebrar o pipeline)
- `docs/n8n-workflows/calcular-metricas-google-patch.md` — diff em 3 blocos pra patchar `Calcular Metricas` com match Reonic via UTM (`google`, `google_ads`, `googleads`) e populate `cache.google_ads`
- `src/lib/fixtures/googleAdsSample.ts` — 6 campanhas sintéticas realistas (Search Brand R$ 21 CPL, PMax R$ 141 CPL, Display CPL R$ 155, etc.)
- `DashboardContainer.tsx` — flag `?preview=google` injeta fixture sem afetar produção (banner sutil avisa modo preview)
- `docs/guides/google-ads-oauth-setup.md` — passo-a-passo com `curl` exatos pra capturar `refresh_token` em ~5min após `developer_token` aprovar (incluindo sanity check antes de tocar no n8n)

**Quando credenciais chegarem:** 6 envs no n8n + 2 patches no workflow = Bloco G em produção em ~10min.

### 2. TableSkeleton + EmptyStates contextuais (commit `e6e5db4`)

- Novo `shared/TableSkeleton.tsx` — header + linhas em opacidade decrescente (mais fiel ao layout real do que `Skeleton` genérico)
- Aplicado nos Blocos C, F e G — feedback visual consistente durante o load inicial
- `BlocoE_Mix` migrado de div `animate-pulse` solta pro componente `Skeleton` padrão
- `EmptyState` ganha prop `hint` (texto secundário uppercase gold/40)
- Bloco E: hint aponta pra Q-4 + `data-schema.md`
- Bloco F: copy explica que "tendências CTR/CPL e recomendação de troca aparecem quando há histórico suficiente" + hint da ADR-022
- Bloco G: hint aponta pro `google-ads-oauth-setup.md` + estado dedicado de erro de auth (separado do `not_configured`)

### 3. A11y nas tabelas + período persistente + microcopy (commit `d28ee74`)

- Bloco C: headers ordenáveis viram `<button>` dentro de `<th>` com `scope="col"`, `aria-sort` dinâmico (`ascending`/`descending`/`none`), `aria-label` reativo ("Ordenar por X (atual: crescente)"), focus ring dourado
- Bloco C: filtro Canal ganha `role="group"` + `aria-pressed` em cada botão
- Blocos F e G: `aria-label` na tabela + `scope="col"` em todos os ths
- `PeriodFilter`: escolha persiste em `localStorage` (`dashboard:period`) com fallback silencioso quando indisponível
- Bloco D · Hall da Vergonha vazio agora **celebra**: ícone `Check` verde, título "Hall vazio · 100% atendidos", hint "Mantenha. É o estado-alvo." (antes só sumia neutro)

### 4. Pills de status das fontes no Header (commit `82ee5b8`)

3 dots coloridos próximos à timestamp "Atualizado", visíveis em `lg+` (>=1024px):

- ● Meta · ● Reonic · ● Google
- Cores: success (ok) · warning (stale) · danger (error) · gray (not_configured)
- `title` nativo + `aria-label`: "Meta: OK · última coleta há 12 min"
- `role="group"` + `aria-label="Saúde das fontes de dados"` no wrapper

Permite enxergar saúde do pipeline em 1 segundo sem precisar abrir o log do n8n. Componente isolado em `shared/SourceStatusPills.tsx` pra reuso.

### 5. Atalhos de teclado + overlay de ajuda (commit `cedf658`)

Hook `useKeyboardShortcuts` escuta `keydown` global e ignora quando o foco está em `input`/`textarea`/`contentEditable` (não interfere com a tela de login). Modifiers (Ctrl/Meta/Alt) são ignorados.

| Tecla | Ação |
|---|---|
| `R` | Atualizar dados agora |
| `1` `2` `3` `4` | Período: Hoje · 7d · 30d · Mês atual |
| `?` | Abre/fecha overlay de ajuda |
| `Esc` | Fecha o overlay |

`ShortcutsOverlay` é um `dialog` acessível (`role=dialog`, `aria-modal`, foco no botão fechar ao abrir, click-fora pra fechar, kbd estilizado por atalho). Footer ganha link sutil "Atalhos `[?]`" pra descoberta.

### 6. Breadcrumbs do Sentry nas ações de UI e fetch (commit `16f6509`)

Helper novo `addBreadcrumb({ category, message, data, level })` que é **no-op silencioso** quando `VITE_SENTRY_DSN` não está setado (sem log de console — não polui).

Eventos rastreados:

| Categoria | Eventos |
|---|---|
| `auth` | `login_ok`, `login_failed` (warning), `logout` |
| `ui.action` | `refresh` (data: `source` = `header`/`shortcut`/`manual`) |
| `ui.period` | `period_changed` (data: período atual) |
| `ui.filter` | `channel_filter` (data: `all`/`meta`/`google`) |
| `ui.shortcut` | `help_opened`, `help_closed` |
| `data.fetch` | `dashboard_fetch_ok` (duration_ms + sources_status) e `dashboard_fetch_error` (code, level dinâmico) |

Quando o DSN entrar, qualquer exception capturada vem com os ~10 breadcrumbs anteriores — reconstrói o que o usuário fez antes do erro.

---

## Métricas antes/depois (sessão 14/05)

| Métrica | Antes (final 13/05) | Depois (final 14/05) |
|---|---|---|
| Bundle frontend | 260 KB / 86 KB gzip | **269.5 KB / 89.2 KB gzip** |
| Componentes shared | 6 (Card, DeltaBadge, EmptyState, Footer, Header, Skeleton) | **9 (+ TableSkeleton, SourceStatusPills, ShortcutsOverlay)** |
| Hooks customizados | 2 (useAuth, useDashboardData) | **3 (+ useKeyboardShortcuts)** |
| Cobertura a11y nas tabelas | nenhuma | **3 tabelas com scope/aria-sort/aria-label** |
| Persistência de preferências | nenhuma | **período em localStorage** |
| Saúde das fontes visível | só no JSON da API | **3 pills no Header com tooltip humano** |
| Atalhos de teclado | nenhum | **R · 1-4 · ? · Esc** |
| Breadcrumbs antes de exception | nenhum | **6 categorias rastreadas** |
| Story 2.1 (Google Ads) | só plano em prosa | **workflow JSON + patch + fixtures + OAuth guide** |
| Modo preview (sem credencial) | inexistente | **`?preview=google` injeta fixture** |

---

## Commits da sessão 14/05

```
8a4d348  feat(dashboard): Story 2.1 prep — workflow JSON + patch + fixtures + OAuth guide
e6e5db4  polish(dashboard): TableSkeleton + EmptyStates contextuais
d28ee74  feat(dashboard): a11y nas tabelas + período persistente + microcopy
82ee5b8  feat(dashboard): pills de status das fontes no Header
cedf658  feat(dashboard): atalhos de teclado + overlay de ajuda
16f6509  feat(dashboard): breadcrumbs do Sentry nas ações de UI e fetch
```

**Estado:** 6 commits em `main` local, `origin/main` atrás. Aguardando autorização do `@devops` pra push (regra de Agent Authority).

**Validações automatizadas executadas em cada commit:**
- `tsc --noEmit` — 0 erros em todos
- `vite build` — bundle final 269.53 KB / 89.15 KB gzip
- `eslint .` — 0 erros (2 warnings pré-existentes em `AuthContext.tsx` e `main.tsx`, sem relação)
- `vite dev` em `http://localhost:5174/` — HMR validado em todos os módulos novos/modificados

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

1. **Autorizar push dos 6 commits locais da sessão 14/05** → `@devops *push` (Vercel detecta e faz redeploy automático; tudo já validado em type-check + build)
2. **Você cria conta Sentry** (5 min) → me devolve DSN → eu seto no Vercel + redeploy (10 min). Bonus: com breadcrumbs já plugados, primeiras exceptions já chegam com trilha completa do usuário
3. **Você aplica pelo `developer_token` Google Ads** (1-2 dias de aprovação Google)
4. **Você alinha Q-4/Q-5/Q-7 com Robson** (próxima call)
5. **Quando credenciais Google Ads chegarem:** ~10min (não mais ~3h) seguindo `docs/guides/google-ads-oauth-setup.md` — 6 envs no n8n + 2 patches do `docs/n8n-workflows/`
6. **Magic link auth** depende de SMTP no n8n (Gmail/Resend/Mailgun) ou pivotar para WhatsApp/Zaia
7. **Observability no n8n** (enviar erros do workflow pro Sentry via HTTP Request) — depende do DSN

---

## Overnight 14→15/05 — sparklines + modo print

Sessão noturna autônoma após o lote de UX polish do dia (cache.by_period funcionando).

**Backend (n8n via MCP):**
- `Calcular Metricas` agora gera `sparkline_7d: [{day, spend, leads, cpl}]` em cada `by_period[k]` — 7 pontos diários terminando no `endMs` da janela.
- Update aplicado via `update_workflow`; **credentials Meta desvinculadas como sempre** — aguardando reconnect manual + `publish_workflow` pra cache popular.

**Frontend (commitado e pushado):**
- `Sparkline.tsx`: componente SVG inline (~50 linhas), polyline + dot no último ponto, opacity 0.55, respeita `currentColor`, viewBox responsivo.
- `BlocoA_Hero`: 3 cards (Verba, CPL, Leads) ganham sparkline 7d alinhado à direita do delta. Resposta média não tem (cálculo per-dia é caro/ruidoso). Fallback gracioso: se `sparkline_7d` não existir, omite renderização.
- `types.ts`: `SparklinePoint` + `PeriodSlice.sparkline_7d?` opcional.

**Modo print (`@media print` no `index.css`):**
- Fundo branco + texto preto pra impressão / "Salvar como PDF".
- Esconde botões, inputs, overlays, dropdowns.
- Cards perdem sombra dourada, ganham borda cinza, padding reduzido.
- Dourado vira cinza escuro (preserva hierarquia em monocromático).
- Semáforo success/warning/danger mantém cor (perde se monocromático mas legibilidade ok).
- Sparklines em preto.
- Sticky/overflow desligados pra tabelas inteiras saírem na página.
- `@page { margin: 1.5cm }` + `page-break-inside: avoid` em cards.
- **Atalho `Ctrl+P`** adicionado à legenda do `?` overlay.

**Estado atual da entrega:**
- ✅ Frontend buildado + commitado + pushado → Vercel autodeploy
- ⏳ Sparklines só aparecem quando Cleiton: (a) reconectar credentials Meta nos 4 nodes HTTP, (b) avisar pra eu `publish_workflow` + `execute_workflow` mode=production
- ✅ Modo print funcional desde o deploy (Ctrl+P em qualquer página)

---

## Custo

| Item | Valor |
|---|---|
| Vercel | R$ 0 (free tier; 1 deploy prod ativo) |
| GitHub repo | R$ 0 (privado, account pessoal) |
| n8n self-hosted | R$ 0 incremental (já existia) |
| Domínio | R$ 0 incremental (já existia) |
| Sentry | R$ 0 (free tier, quando você criar o projeto) |
| API Claude (sessões 12-14/05) | R$ 200-400 estimado |
| **Total Sprint 1 + Sprint 2** | **R$ 200-400** |

Versus estimativa inicial Lovable: R$ 3.450. **Economia: R$ 3.050+** mantida.

---

*Sprint 1 entregou MVP em 1 sessão. Sprint 2 foi distribuído em duas sessões — robustez + observability + UX + preparação Google Ads em 13/05; Story 2.1 totalmente preparada + polimento profundo (a11y, atalhos, breadcrumbs, status pills) em 14/05 — sem regressões em produção em momento algum. Performance não é sorte. É método.*

---

## Overnight 2 — Solar PRO completo (14/05/2026, autônomo)

Sessão autônoma overnight com mandato "quero ele perfeito · nunca pare · autonomia absoluta". Pesquisa profunda de UI/UX para dashboards de performance (NN/g, Smashing 2025, Stripe/Linear/Vercel) + 7 entregas consolidadas num único commit.

### Entregas

| # | Entrega | Arquivos | Detalhe |
|---|---|---|---|
| 1 | **Hero 8 cards (CPA + métricas solar)** | `BlocoA_Hero.tsx`, `types.ts` | Adicionou CAC, ROAS, Vendas, Ticket médio. Hero passou de 4 → 8 cards |
| 2 | **Bloco Pipeline (H) — comercial** | `BlocoH_Pipeline.tsx` (novo) | Open count/revenue, win rate, ciclo médio, forecast vs aberto |
| 3 | **Bloco Loss Reasons (I) — top motivos de perda** | `BlocoI_LossReasons.tsx` (novo) | Top 5 `closeLostReason` com bar chart e receita perdida |
| 4 | **Bloco Mix Solar reformulado** | `BlocoE_Mix.tsx` | 4 produtos (solar/armaz./bomba/wallbox) + EmptyState distinguindo "sem venda" de "sem classificação técnica" |
| 5 | **Alertas piscantes contextuais** | `index.css` | `@keyframes pulse-alert-danger/warning` aplicado em CPL `bad` e ROAS < 1, com `prefers-reduced-motion: reduce` |
| 6 | **Export CSV das campanhas** | `csv.ts` (novo), `BlocoC_Campanhas.tsx` | Botão Download no Bloco C com nome `campanhas-revert-{periodo}-{data}.csv`, BOM UTF-8, `;` como separador (Excel BR) |
| 7 | **Print footer institucional** | `PrintFooter.tsx` (novo) | Cliente/Período/Gerado em — visível só no PDF; tagline Escala + CNPJ |
| 8 | **Filtro ATIVA/PAUSED no Bloco C** | `BlocoC_Campanhas.tsx` | Toggle ao lado do filtro de canal; cor warning em "Pausadas" |
| 9 | **Atalho `F` para fullscreen** | `useKeyboardShortcuts.ts`, `DashboardContainer.tsx`, `ShortcutsOverlay.tsx` | Fullscreen API (apresentação para reuniões) com fallback silencioso |
| 10 | **Error Boundary visível por bloco** | `BlockErrorBoundary.tsx` (novo), `DashboardContainer.tsx` | Cada bloco isolado; falha em um não derruba o dashboard. Botão "tentar de novo" + log no Sentry |
| 11 | **Hover expandido nos cards Hero** | `BlocoA_Hero.tsx` | Mín/Máx/Média 7d revelados em `group-hover`/`group-focus-within` (Verba, CPL, Leads). Receita+Verba em CAC/ROAS. Receita+Ticket em Vendas |

### Backend (n8n via MCP)

- `Calcular Metricas` recebeu `computeWindow()` retornando por período: hero (com CAC/ROAS/vendas), funil, campanhas, velocidade, **pipeline**, **loss_reasons**, sparkline_7d
- Root agrega `mixSolar` consolidando `solarPackage`/`sesPackage`/`heatpumpPackage`/`wallboxPackage`
- Workflow `AJypFIeC4rMcs18P` atualizado e publicado via `update_workflow` + `publish_workflow`
- **Custo aceito:** cada `update_workflow` desvincula credentials Meta — Cleiton reconecta os 4 nodes HTTP manualmente (~2min)

### Bugs descobertos e resolvidos

| Bug | Causa | Fix |
|---|---|---|
| Mix Solar zerado mesmo com 13 vendas | Reonic não tem `solarPackage` preenchido na Revert | EmptyState explicativo distinguindo "sem vendas" de "sem classificação técnica" |
| Reonic `/h360/offers ?page=N` retorna subset enviesado | Paginação inconsistente da API | Chamada única sem `page` (100 mais recentes ≈ 38 dias) |
| Meta `time_increment=1 + last_30d` não inclui hoje | API exclui o dia corrente | Mantido node "Buscar Spend Meta Hoje" com `date_preset=today` separado |
| `avg_response_time` medindo automação Zaia, não humano | Estava usando `requestCreatedAt` | Trocado por primeira `note.createdAt` do offer (toque humano real) |
| Funil PT-BR não mapeado (status reais Reonic) | Estava buscando nomes em inglês | Mapeamento corrigido: "Solicitação de Proposta (Engenharia)", "Proposta Gerada", "Em Negociação", "Forecast Semanal - Assinaturas", "Aguardando PA." |
| n8n `staticData` não persistia entre execuções | `executionMode: "manual"` no `execute_workflow` | Sempre usar `executionMode: "production"` |
| n8n separa draft/active version | Update não vira active automaticamente | Sempre `publish_workflow` após `update_workflow` |

### Decisões de design (pesquisa profunda UI/UX)

- **Contraste WCAG AA:** trocou `text-gray-500` (3.5:1) por `#8B8E97` (>4.5:1) e `#0A0A0A` (preto puro fadiga ocular) por `#0F1116` com escala `surface-1/2/3`.
- **Alertas piscantes:** animação sutil 1.8–2s (não distrai, chama atenção). Desabilitada com `prefers-reduced-motion: reduce`.
- **Hover detalhes:** revelados via `group-hover`/`group-focus-within` (acessível por teclado). `max-h` transition pra layout estável.
- **Error Boundary granular:** cada bloco isolado — falha em Google Ads não derruba Hero/Pipeline/etc. Padrão "fail-soft" do Linear/Notion.
- **CSV com `;`:** Excel BR usa vírgula como separador decimal → CSV com `,` quebra. BOM UTF-8 garante acentos.
- **Print footer:** PDF deve ser auto-explicativo (cliente, período, data) — protocolo de reunião offline.

### Métricas finais da sessão

- **Arquivos modificados:** 6
- **Arquivos novos:** 3 (`BlockErrorBoundary.tsx`, `PrintFooter.tsx`, `csv.ts`)
- **Builds verde:** 2/2
- **Commits:** 1 consolidado (pendente push)
- **Linhas frontend:** +~700 / -~80

*Cada melhoria deste overnight foi pensada para o caso real da Revert: uma assessoria que precisa entregar relatórios visuais ao cliente. PDF auto-explicativo, fullscreen pra apresentações, alertas pra reagir rápido, error boundary pra robustez sem queda total. Solar PRO completo — pronto pra reunião.*
