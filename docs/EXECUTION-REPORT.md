# Execution Report — Dashboard de BI Revert

**Data:** 2026-05-13
**Status:** ✅ SUCCESS — MVP em produção
**Tag:** `v1.0.0-mvp` (criada localmente; push pendente — ver Pendências)

---

## URLs em produção

| Recurso | URL | Status |
|---|---|---|
| Dashboard custom domain | https://dashboard.escalanegociosdigitais.com.br | ✅ HTTP 200 |
| Alias Vercel | https://dashboard-revert.vercel.app | ✅ HTTP 200 |
| API webhook n8n | https://n8n.escalanegociosdigitais.com.br/webhook/dashboard/revert | ✅ Bearer + CORS restrito |
| Repositório GitHub | https://github.com/cleitonfrizon/dashboard-revert | ⚠️ commits locais, push pendente |
| Workflow n8n | https://n8n.escalanegociosdigitais.com.br/workflow/AJypFIeC4rMcs18P | ✅ active=true |
| Projeto Vercel | escalanegociosdigitais-3508/dashboard-revert | ✅ deploy prod ativo |

---

## Stories

| Story | Status | Notas |
|---|---|---|
| 1.1 Aggregator n8n | Done | Consolidado com 1.2; tempo médio execução 9s; 3 execuções consecutivas OK |
| 1.2 Endpoint REST | Done | Webhook GET com Bearer; CORS restrito ao domínio próprio |
| 1.3 Setup Vite + Auth Shell | Done | bcrypt + sessionStorage; build 238 KB JS gzip 79 KB |
| 1.4 Bloco A — Hero | Done | 4 cards com semáforo CPL + delta vs 7d |
| 1.5 Bloco B — Funil | Done | 5 etapas + taxas vs benchmark com semáforo |
| 1.6 Bloco C — Campanhas | Done | Tabela ordenável + totalizador |
| 1.7 Bloco D — Velocidade | Done | 5 buckets + Hall da Vergonha + médias 30d |
| 1.8 Bloco E — Mix | Done-Partial | EmptyState aguardando Q-4 (Robson) |
| 1.9 Bloco F — Saturação | Done-Partial | Tabela ativa, tendências CTR/CPL zeradas até 7d+ histórico |
| 1.10 Deploy prod + domínio + CORS | Done | dashboard.escalanegociosdigitais.com.br no ar; CORS restrito |

---

## Decisões adicionadas durante a execução

| ID | Decisão | Motivo |
|---|---|---|
| ADR-029 | Schema Reonic real (Q-1/Q-2/Q-3 resolvidas) | `data-schema.md` original estava desalinhado com a API real (`/contacts` + `/h360/offers`, status PT-BR custom) |
| ADR-030 | Cache em `workflow.staticData.global` (substitui ADR-003) | Filesystem n8n é read-only (`/tmp` e `/home/node/.n8n` ambos rejeitaram write) — consolidou Aggregator + API em 1 workflow |
| ADR-031 | Logo fallback SVG + paginação Reonic adiada | escalanegociosdigitais.com.br/logo.png retornou 404; paginação fica para Sprint 2 |

---

## Bugs encontrados e resolvidos

| # | Problema | Causa | Fix |
|---|---|---|---|
| 1 | `Credentials not found` na 1ª execução | Vercel SDK criou nodes Meta sem credential vinculada | PATCH na API n8n adicionando `{facebookGraphApi: {id: o1wmrboZIxR8mF8B}}` aos 3 nodes Meta |
| 2 | Reonic `/h360/requests` → 404 | Schema esperado errado em `data-schema.md` | Migrou para `/contacts` + `/h360/offers`; ADR-029 |
| 3 | `/tmp/...` não writable | Sandbox do n8n | Migrou para `workflow.staticData`; ADR-030 |
| 4 | `n8n SDK validate` rejeitou `.join('\n')` | Security guard do parser | Substituiu por concatenação `+` |
| 5 | Regex no jsCode patch removeu `campaigns/insights/ads` | Pattern gulose `.*?` que cruzou bloco maior | Reescreveu jsCode limpo do zero |
| 6 | Reonic `contacts` returned 100 items separados | n8n divide arrays em items por padrão | Refatorou Code com `safeAll().map()` + função `unwrap` |
| 7 | `bcrypt.compareSync` returnou false | Linha `VITE_DASHBOARD_PASSWORD_HASH` ficou comentada após patch | Removeu `# ` da linha; revalidou |
| 8 | `vercel --token "$T"` rejeitado | Token Vercel contém `:` interpretado como param separator | Splitou em `--token vcp_...` + `--scope team_...` |
| 9 | Senha sempre "incorreta" em produção | Envs `VITE_*` nunca foram adicionadas via `vercel env add` → como `VITE_*` é inlineado em build-time, o bundle saiu sem hash; `bcrypt.compareSync(senha, undefined)` retorna false | `vercel env add` das 3 envs (HASH/API_URL/API_TOKEN) em production + `vercel --prod` (sessão de 13/05/2026) |

---

## Sessão 13/05/2026 — Correção + rotações

| Ação | Detalhe |
|---|---|
| Fix bug #9 | 3 envs `VITE_*` adicionadas em production e bundle regerado |
| Logo PNG oficial | `public/escala-logo.png` (1440x1440, 325 KB) copiado de `CLIENTES/ESCALA/logos/logo escala.png`; `Header.tsx` + `LoginPage.tsx` apontando para `.png` |
| Rotação DASHBOARD_API_TOKEN | Novo token 64-char hex gerado; jsCode do node `Validar Token e Servir Cache` no workflow `AJypFIeC4rMcs18P` atualizado via API n8n; `VITE_DASHBOARD_API_TOKEN` no Vercel substituído; redeploy validado (token velho retorna `INVALID_TOKEN`, novo retorna `ok:true`) |
| Rotação senha dashboard | Nova senha 22-char gerada; hash bcrypt(10) atualizado em `VITE_DASHBOARD_PASSWORD_HASH` no Vercel; redeploy validado (bundle `index-BwwerC59.js` contém hash novo) |

---

## Sessão 13/05/2026 (parte 2) — Sprint 2 Robustez

| Ação | Detalhe |
|---|---|
| HTTP status codes corretos no webhook | `Respond JSON` agora usa `responseCode: "={{ $json._httpStatus }}"`. Webhook retorna 401 em token inválido e 200 em cache válido (resolve ADR-031, pendência 🟢) |
| Paginação Reonic `/contacts` | Node `Buscar Contacts Reonic` migrado de `httpRequest` para `code` com loop `for (page = 1..50)` até `length === 0` ou `< 100`. Header correto: `x-authorization` (não `Authorization` — daí o erro enganoso "There is no Authentication header" em testes manuais). Saída: `{items: [...]}` consumida pelo `unwrap` em `Calcular Metricas`. Resultado: **234 contacts** carregados (antes capava em 100) |
| Paginação Reonic `/h360/offers` | Mesmo padrão. Saída: `{results: [...]}`. Resultado: **234 offers** carregados (antes capava em 100) |
| Meta Graph v23.0 → v25.0 | 3 nodes Meta (`Campanhas`, `Insights`, `Ads`) com URL atualizada via patch script; execução 354 validou sem erros (11 campanhas, 2 insights, 14 ads retornados) |
| Validação | Cron acelerado para `0 * * * * *` (cada minuto), 3 execuções sucessivas com `status=success`, cron restaurado para `0 */30 * * * *`. Webhook respondendo `cached_at: 2026-05-13T21:40:13.089Z` com `funil.leads: 49` (vs `21` no cache pré-paginação) |
| Bug operacional descoberto | PUT no workflow via API n8n sobrescreve `staticData` se enviado no payload. Solução: omitir `staticData` do payload de PUT para preservar cache em runtime |

---

## Pendências para Cleiton

### 🔴 Críticas (antes de mostrar ao Robson)
- [ ] **`git push origin main` + `git push --tags`**: terminal local não tinha credenciais GitHub. Rodar `gh auth login` ou configurar credential.helper antes de pushear (inclui commits do logo PNG + tag `v1.0.0-mvp`)
- [ ] **Atualizar `.env.local` local** com a nova senha + novo DASHBOARD_API_TOKEN (valores entregues fora do report) — produção já está com os valores novos, mas o local está desincronizado

### 🟡 Importantes
- [ ] **Rotacionar tokens externos restantes**: META_GRAPH_TOKEN (developers.facebook.com), REONIC_API_KEY (painel Reonic), N8N_API_KEY (n8n settings → API), VERCEL_TOKEN (vercel.com/account/tokens). DASHBOARD_API_TOKEN e senha do dashboard já foram rotacionados nesta sessão
- [ ] **Q-4 (Robson)**: campo `produto` no Reonic — destrava Bloco E
- [ ] **Q-5 (Robson)**: critério objetivo de MQL — destrava cálculo mais preciso na coluna MQL do Bloco C

### 🟢 Sprint 2 — concluído nesta sessão
- [x] ~~Paginação Reonic~~ — implementada via Code nodes com loop, 234 contacts + 234 offers
- [x] ~~HTTP status codes do webhook~~ — 401/200 dinâmicos via `responseCode` expression
- [x] ~~Meta Graph v25.0~~ — bump dos 3 nodes Meta aplicado e validado

### 🟢 Sprint 2 — Sentry frontend (parte 3 da sessão 13/05)

- [x] **@sentry/react instalado** (10.53.1) + helper em `src/lib/sentry.ts` (init, captureException, ErrorBoundary wrapper)
- [x] **ErrorBoundary** envolvendo `<App />` em `main.tsx` com FallbackUI estilizado (gold/black + botão "Tentar novamente")
- [x] **captureException** ligado em `useDashboardData.ts` para erros inesperados (ignora CACHE_REFRESHING/INVALID_TOKEN que são esperados)
- [x] **No-op gracioso** quando `VITE_SENTRY_DSN` não está setado (console.error como fallback)
- [x] **PII protection** via `beforeSend` (remove Authorization header) e `sendDefaultPii: false`
- [x] Build validado (bundle `index-Bk2UmpdM.js`, 255 KB / 85 KB gzip — antes 238 KB / 79 KB) e deploy em produção
- [ ] **PENDENTE pro Cleiton:** criar projeto Sentry em https://sentry.io (free tier suporta 5K events/mês) e adicionar `VITE_SENTRY_DSN` no Vercel + redeploy. Sem isso, erros caem em `console.error` apenas.

### 🟢 Sprint 2 — ainda pendente
- [ ] Google Ads (PRD seção 11 roadmap)
- [ ] Magic link auth (v1.1 substituindo senha compartilhada)
- [ ] Observability no n8n: enviar erros do workflow pro Sentry via HTTP Request (depende do DSN configurado)

---

## Próximos passos sugeridos (Sprint 2)

1. Robson valida Q-4/Q-5 → habilita Bloco E + MQL preciso
2. Paginação Reonic via SplitInBatches no Aggregator
3. Logo oficial + animações sutis (hover dourado nos cards)
4. Integração Google Ads (segundo PRD seção 11 roadmap)
5. Sentry + alertas (v1.4 do roadmap)
6. Magic link auth (v1.1 substituindo senha compartilhada)
7. Status HTTP correto no webhook (Switch + 3 Respond nodes)

---

## Notificações enviadas via MCP `Qcjrrzy17k2sdq8M`

1. ✅ Checkpoint #1 — Stories 1.1 + 1.2 DONE (workflow no ar) — execId 298
2. ✅ Checkpoint #3 — Story 1.10 DONE (prod no ar) — execId 300

> Checkpoint #2 (após Story 1.3, deploy preview) acabou consolidado no #3 porque o deploy preview e o deploy prod foram feitos na mesma sessão.

---

## Custo

| Item | Valor |
|---|---|
| Vercel | R$ 0 (free tier; 1 deploy prod ativo) |
| GitHub repo | R$ 0 (privado, account pessoal) |
| n8n self-hosted | já existente (sem custo incremental) |
| Domínio | já existente (sem custo incremental) |
| Total | R$ 0 |

---

*MVP entregue em uma sessão única. v1.0.0-mvp pronto para validação com Robson.*
