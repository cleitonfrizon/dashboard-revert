# ADR-030 — Cache via `workflow.staticData` + Single Workflow

**Data:** 2026-05-13
**Status:** Aceita (substitui ADR-003 parcialmente)
**Contexto:** O n8n self-hosted da Escala bloqueia escrita em filesystem (`/tmp`, `/home/node/.n8n` retornaram "is not writable"). ADR-003 previa cache em arquivo `/tmp/revert-dashboard-cache.json`. Solução de arquivo é inviável sem alterações na VPS.

---

## Decisão

1. **Cache persiste em `workflow.staticData.global`** (memória persistente do n8n por workflow, com escrita garantida pelo runtime, sem depender do filesystem).
2. **Os dois workflows previstos (Aggregator + API) ficam consolidados em um só workflow**, chamado `Revert Dashboard`. O Schedule Trigger e o Webhook Trigger compartilham o mesmo `staticData`.
3. **Limite operacional:** `staticData` no n8n suporta até ~1MB. O nosso cache atual gera ~7.5KB. Margem de segurança: 130x.

---

## Impactos

| ADR original | Status pós-30 |
|---|---|
| ADR-002 (único endpoint) | ✅ mantido |
| ADR-003 (cache em arquivo `/tmp/...`) | ❌ substituído por staticData |
| ADR-004 (cron */30) | ✅ mantido |
| ADR-017 (workflow legacy intocável) | ✅ mantido |
| ADR-018 (workflows novos separados) | ⚠️ revisto: agora é 1 workflow unificado |

---

## Arquitetura final do workflow `Revert Dashboard`

```
┌─ Trigger A: Schedule (cron 0 */30 * * * *)
│  └─→ Buscar Campanhas Meta
│      └─→ Buscar Insights Meta
│          └─→ Buscar Ads Meta
│              └─→ Buscar Contacts Reonic
│                  └─→ Buscar Offers Reonic
│                      └─→ Calcular e Cachear (staticData.cache = result)
│
└─ Trigger B: Webhook GET /webhook/dashboard/revert
   └─→ Validar Token Bearer
       ├─→ Servir Cache (lê staticData.cache)
       │   └─→ Respond 200 com JSON
       └─→ Respond 401 (token inválido)
```

---

## Vantagens

- ✅ Sem dependência de filesystem
- ✅ Latência baixa (staticData é in-memory)
- ✅ Coerência entre Aggregator e API (mesmo workflow, mesmo state)
- ✅ Simplifica gestão (1 workflow, 1 active flag, 1 export)

## Desvantagens (aceitas)

- ❌ Se o n8n reiniciar, staticData se perde até o próximo cron (max 30min). Aceitável: o webhook retorna 503 nesse intervalo.
- ❌ Concentra mais responsabilidade em um workflow só. Mitigado por separação clara de branches Schedule vs Webhook.

---

## Conexão com Story 1.1 e 1.2

- **Story 1.1** = branch Schedule (criar/manter)
- **Story 1.2** = branch Webhook (adicionar ao mesmo workflow)
- AC11 da 1.1 ("Available in MCP") segue válida no workflow consolidado.
