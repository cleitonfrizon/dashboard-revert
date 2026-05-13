# 🚀 PROMPT MESTRE — Dashboard de BI Revert (Execução Autônoma AIOX)

> **Como usar:**
> 1. Garanta que `.env.local` está preenchido com todos os secrets (use `.env.example` como referência)
> 2. Abra Claude Code: `claude --dangerously-skip-permissions`
> 3. Cole TUDO ABAIXO da linha tracejada `─────`

---

## ✅ Checklist prévio (5 minutos)

- [ ] `.env.local` preenchido com todos os secrets (NÃO commitar)
- [ ] Repositório `dashboard-revert` no GitHub criado e remote conectado
- [ ] Vercel CLI logado (`vercel whoami`)
- [ ] GitHub CLI logado (`gh auth status`)
- [ ] Node 20+ instalado (`node --version`)
- [ ] MCP do n8n configurado (`claude mcp list` mostra "n8n")
- [ ] DNS `dashboard.escalanegociosdigitais.com.br` apontando para Vercel (CNAME → `cname.vercel-dns.com`)
- [ ] Pasta `docs/` na raiz do projeto

---

─────────────────────────────────────────────────────────────────
COLAR DAQUI PARA BAIXO NO CLAUDE CODE
─────────────────────────────────────────────────────────────────

# DASHBOARD DE BI REVERT — EXECUÇÃO AUTÔNOMA AIOX

Você é o time completo de desenvolvimento (PM, Architect, SM, PO, Dev, QA, DevOps) do projeto Dashboard de BI da Revert Energia Solar — cliente da Escala Negócios Digitais. Sua missão é entregar o MVP em produção (URL pública autenticada com dados reais) seguindo rigorosamente o framework AIOX e o pacote em `docs/`.

**Modo de operação:** AUTÔNOMO TOTAL. NÃO me faça perguntas. Decida com base nos `docs/`, ADRs e env vars do `.env.local`. Registre toda decisão ambígua em `docs/decisions/adr-XXX.md` e continue.

---

## 📥 INPUTS — Use o arquivo `.env.local` da raiz

Todos os secrets já estão preenchidos. NÃO altere valores. Carregue via `process.env` (n8n/Node) e `import.meta.env.VITE_*` (Vite browser-side).

Variáveis expostas ao Vite (já com prefixo `VITE_`):
- `VITE_DASHBOARD_API_URL=https://n8n.escalanegociosdigitais.com.br/webhook/dashboard/revert`
- `VITE_DASHBOARD_API_TOKEN` (gerado na Story 1.2)
- `VITE_DASHBOARD_PASSWORD_HASH` (gerado na Story 1.3)

Demais variáveis ficam server-side (n8n e Vercel build).

---

## 🎯 STACK CONFIRMADA (NÃO QUESTIONAR)

- Vite 5 + React 18 + TypeScript 5 + Tailwind CSS 3
- shadcn/ui (CLI sob demanda)
- Recharts 2.x
- React Router v6
- fetch nativo (sem axios)
- React Context API + useReducer
- date-fns + date-fns-tz (timezone `America/Sao_Paulo`)
- Zod
- bcryptjs
- Vercel CLI para deploy
- n8n self-hosted (workflows novos via MCP)
- ESLint + Prettier
- Conventional Commits
- Git + GitHub privado (`cleitonfrizon/dashboard-revert`)

---

## 🧱 28 ADRs PRÉ-APROVADAS

Ver `docs/architecture.md` seção 5 para a lista completa. Não questione, apenas implemente.

Resumo das mais críticas:
- ADR-002: Único endpoint backend autenticado por Bearer
- ADR-005: Auth = bcrypt em env + JWT client-side em sessionStorage
- ADR-009: MQL placeholder = `status IN ('qualified', 'proposal_sent', 'negotiating', 'closed_won')`
- ADR-013: Loading = shadcn `<Skeleton />`, nunca spinner
- ADR-017: Workflow `dYJBsmLbfhaU5Og0` INTOCÁVEL
- ADR-018: Workflows novos com "Available in MCP" habilitado
- ADR-019: Retry 3x backoff exponencial em todas chamadas HTTP
- ADR-024: Conventional commits `feat(dashboard): Story 1.X — desc (Epic 001)`
- ADR-025: `vercel --prebuilt` em cada story DONE; prod só na 1.10
- ADR-028: Stories 1.8/1.9 BLOCKED se pré-requisitos externos faltarem

---

## 🎨 IDENTIDADE VISUAL — Brand System Escala

**OBRIGATÓRIO** seguir `docs/brand-system.md`:

### Paleta (em `src/theme.ts` + `tailwind.config.js`)
- Preto `#0A0A0A` (fundo principal)
- Navy `#0D1B2A` (gradientes, footer)
- Dourado `#C8A84E` (destaque único)
- Branco/Cinzas para texto

### Tipografia (Google Fonts no `index.html`)
- **Poppins** — UI, corpo, tabelas
- **Playfair Display** — números grandes do Hero, quotes editoriais

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet">
```

**PROIBIDO**: Arial, Roboto, Inter, Helvetica, Bebas Neue

### Footer obrigatório
- Esquerda: `escalanegociosdigitais.com.br` (text-gray-500)
- Centro: `Performance não é sorte. É método.` (Playfair italic, text-gold)
- Direita: `Cascavel · Toledo · Florianópolis` (uppercase tracking-widest)
- Linha extra: `CNPJ 48.215.104/0001-40`

### Regras invioláveis
1. NUNCA usar "agência" — sempre "assessoria de performance"
2. Logo sem distorção, fundo transparente
3. Texto PT-BR com acentuação correta
4. Sem emojis na UI

---

## 📋 ROTEIRO DE EXECUÇÃO — 10 STORIES

Execute SEQUENCIALMENTE. Para cada story, ciclo SDC completo:

```
@po *validate-story-draft 1.X
@dev *develop-story 1.X --yolo
@qa *qa-gate 1.X
@devops *push
```

### Story 1.1 — Workflow Aggregator n8n
```
@po *validate-story-draft 1.1
@dev *develop-story 1.1 --yolo
```
**Ações**:
1. `n8n:search_nodes` para conhecer nodes
2. `n8n:create_workflow_from_code` criando `Revert Dashboard Aggregator`
3. Schedule cron `*/30 * * * *` São Paulo
4. Branch Meta: 3 HTTP nodes (campaigns, insights, ads)
5. Branch Reonic: 2 HTTP nodes (requests, offers) — confirmar paths em `https://api.reonic.de/rest/v2/docs`
6. Merge + Code `Calcular Métricas` (CPL, CAC, taxas, distribuição, saturação, mascaramento PII)
7. Write Binary File `/tmp/revert-dashboard-cache.json`
8. Habilitar "Available in MCP" nas Settings
9. Executar 3x via `n8n:execute_workflow` para validar
10. Export para `docs/n8n-workflows/dashboard-aggregator-v1.json`
11. Enviar checkpoint #1 via workflow `Qcjrrzy17k2sdq8M`

**Pular `@devops *push` (sem código no repo).**

### Story 1.2 — Endpoint REST
```
@po *validate-story-draft 1.2
@dev *develop-story 1.2 --yolo
```
**Ações**:
1. Criar workflow `Revert Dashboard API` via MCP
2. Webhook GET path `dashboard/revert`
3. Gerar token 64 chars: `openssl rand -hex 32` ou `crypto.randomBytes(32).toString('hex')`
4. Salvar em `.env.local` como `DASHBOARD_API_TOKEN` + `VITE_DASHBOARD_API_TOKEN`
5. Code `Validar Token` (header Authorization Bearer)
6. Read Binary File + Respond to Webhook (200/401/503)
7. CORS `*` por enquanto (restringe na 1.10)
8. Testar 3 cenários via curl
9. Export para `docs/n8n-workflows/dashboard-api-v1.json`

### Story 1.3 — Setup Vite + Auth Shell
```
@po *validate-story-draft 1.3
@dev *develop-story 1.3 --yolo
@qa *qa-gate 1.3
@devops *push
```
**Ações principais**:
1. `npm create vite@latest . -- --template react-ts`
2. `npm install`
3. Tailwind + paleta Escala (ver `docs/brand-system.md`)
4. shadcn init: `npx shadcn@latest init` (slate, dark, CSS vars)
5. shadcn components: `npx shadcn@latest add card table button input badge skeleton dialog tooltip select dropdown-menu`
6. Deps adicionais: `npm i react-router-dom date-fns date-fns-tz zod bcryptjs recharts`
7. Implementar arquivos conforme `1.3.story.md` File List
8. Gerar hash bcrypt:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync(process.env.DASHBOARD_PASSWORD_RAW, 10))"
   ```
   Adicionar resultado em `.env.local` como `VITE_DASHBOARD_PASSWORD_HASH`
9. `npm run dev` + testar login local
10. `npm run build` + `npm run lint` + `npx tsc --noEmit`
11. Commit + push
12. `vercel --prebuilt` → logue preview URL
13. Enviar checkpoint #2

### Stories 1.4, 1.5, 1.6, 1.7 — Blocos A, B, C, D
Ciclo padrão. Após cada DONE: `vercel --prebuilt` para preview.

### Story 1.8 — Bloco E (Mix de Produto)
Se Reonic não tiver campo `produto` em ao menos 80% dos leads, marque BLOCKED e implemente apenas `<EmptyState />`.

### Story 1.9 — Bloco F (Saturação Criativa)
Se faltar 7+ dias de histórico, exibir "Coletando dados — disponível em X dias" e marcar DONE-PARTIAL.

### Story 1.10 — Deploy + domínio próprio
```
@po *validate-story-draft 1.10
@dev *develop-story 1.10 --yolo
```
**Ações**:
1. `vercel link --token=$VERCEL_TOKEN`
2. `vercel env add` para todas as `VITE_*`
3. `vercel domains add dashboard.escalanegociosdigitais.com.br`
4. `vercel --prod`
5. Restringir CORS no `Revert Dashboard API` para domínio próprio
6. Validar produção end-to-end
7. `git tag -a v1.0.0-mvp -m "MVP entregue"` + `git push --tags`
8. Enviar checkpoint #3 (final)

---

## 📡 CHECKPOINTS

Em **3 momentos críticos**, envie notificação via MCP:

```javascript
n8n:execute_workflow({
  workflowId: "Qcjrrzy17k2sdq8M",
  executionMode: "production",
  inputs: {
    type: "webhook",
    webhookData: {
      method: "POST",
      body: {
        type: "conversation",
        title: "Dashboard Revert — Checkpoint Story X.X",
        category: "Conversations",
        source: "claude-code",
        tags: ["dashboard-revert", "checkpoint", "automacao"],
        content: "<resumo markdown: status, URLs, próxima ação>"
      }
    }
  }
})
```

**Obrigatórios**:
1. ✅ Após Story 1.1 — workflow Aggregator validado
2. ✅ Após Story 1.3 — primeiro deploy preview no Vercel
3. ✅ Após Story 1.10 — produção no ar com domínio próprio

---

## 📊 RELATÓRIO FINAL — `docs/EXECUTION-REPORT.md`

Ao final, gere o arquivo com:

```markdown
# Execution Report — Dashboard de BI Revert

**Data:** YYYY-MM-DD
**Tempo total:** Xh Ymin
**Status:** SUCCESS / PARTIAL / BLOCKED

## URLs
- Preview: ...
- Produção: https://dashboard.escalanegociosdigitais.com.br
- Repo: https://github.com/cleitonfrizon/dashboard-revert
- Workflows n8n: ...

## Stories
| ID | Status | Commits | Notas |
| 1.1 | DONE | n/a | ... |
...

## ADRs adicionados
- adr-029.md: ...

## Bugs e fixes
- ...

## Pendências para Cleiton
- [ ] Restringir CORS produção (se não foi feito)
- [ ] Rotacionar tokens expostos
- [ ] Confirmar critério MQL com Robson

## Custo
- Tokens Claude: ~X mil
- API Claude: ~R$ X
```

---

## 🛡️ FALLBACKS

1. API externa falha 3x → BLOCKED + ADR + próxima story
2. Build Vite falha → `@qa`, máx 3 tentativas, senão BLOCKED
3. Reonic schema diferente → ajustar parser + ADR + continuar
4. MCP n8n erro → `n8n:doctor`, fallback manual + notificação
5. Travado madrugada precisando input → PAUSED-STATE.md + notificação
6. Erro grave (dano ao workflow legacy) → PARAR + reverter + notificação urgente

---

## ✅ DEFINITION OF DONE (projeto inteiro)

- [ ] 7+ stories DONE (1.1-1.7 + 1.10 mínimo)
- [ ] URL produção no ar
- [ ] Login funcionando
- [ ] Dados reais Meta + Reonic renderizando
- [ ] Identidade Escala aplicada (`brand-system.md`)
- [ ] `npm run build` sem warnings
- [ ] `npm run lint` passando
- [ ] `npx tsc --noEmit` passando
- [ ] EXECUTION-REPORT.md commitado
- [ ] 3 checkpoints enviados
- [ ] `main` apontando para produção
- [ ] Tag `v1.0.0-mvp` criada

---

## 🚦 COMECE AGORA

```
@po *validate-epic 001
@po *validate-story-draft 1.1
@dev *develop-story 1.1 --yolo
```

Autonomia total. Documente tudo. Não me espere. Boa execução. 🚀
