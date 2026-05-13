# ADR-031 — Logo Fallback SVG + Paginação Reonic Pendente

**Data:** 2026-05-13
**Status:** Aceita (TODO embutido)

---

## Decisão 1 — Logo Escala

A URL `https://escalanegociosdigitais.com.br/logo.png` retornou **HTTP 404** (resposta foi a página HTML 404, 1238 bytes). Sem PNG oficial disponível.

**Implementado:** SVG fallback em `public/escala-logo.svg` com texto "ESCALA" em Playfair Display dourado + "NEGÓCIOS DIGITAIS" em Poppins. Referências em `index.html`, `Header.tsx` e `LoginPage.tsx` apontam para `.svg`.

**TODO para Cleiton (antes de Story 1.10):**
- Fornecer logo PNG/SVG oficial RGBA com fundo transparente
- Substituir `public/escala-logo.svg` pelo asset oficial
- Manter dimensões: header 56px altura, login 120px altura

---

## Decisão 2 — Paginação Reonic adiada

Workflow `Revert Dashboard` hoje só consome **página 1** de `/contacts` e `/h360/offers` (100 itens cada). Suficiente para o volume atual da Revert (~20 contacts ativos), mas insuficiente para volumes maiores.

**TODO para Sprint 2:**
- Adicionar SplitInBatches no workflow para paginar até esgotar
- Performance ainda dentro do AC9 (<30s) provavelmente até página 10 (~ 1000 itens)
- Reavaliar quando volume Revert ultrapassar 80 contacts/mês

---

## Decisão 3 — HTTP status codes do webhook

Hoje o webhook responde HTTP 200 sempre, com `{ok: false, error: 'INVALID_TOKEN'}` no body para erros. Idealmente seria 401/503 conforme `data-schema.md` seção 5.

**Adiar para v1.1.** Não afeta consumo do frontend (que já trata `ok=false` corretamente em `api.ts`).
