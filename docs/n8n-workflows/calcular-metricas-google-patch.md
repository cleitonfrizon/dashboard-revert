# Patch — `Calcular Metricas` para incluir Google Ads

**Workflow:** `AJypFIeC4rMcs18P` (Revert Dashboard)
**Node alvo:** `Calcular Metricas` (id `e10a0322-268a-48eb-9c4b-f4367fd67488`)
**Pré-requisito:** Node `Buscar Google Ads` já inserido entre `Buscar Ads Meta` e `Buscar Contacts Reonic` (ver `google-ads-fetch-node.json`).

---

## Objetivo

1. Ler o output do `Buscar Google Ads` via `safeFirst('Buscar Google Ads')`.
2. Fazer match das campanhas Google com Reonic via UTM (`utm_source=google_ads` ou `google` + `utm_campaign`).
3. Popular `cache.google_ads = { customer_id, campanhas[], totals }`.
4. Atualizar `cache.meta.sources_status.google_ads` (`'ok' | 'error' | 'not_configured'`) e `last_google_fetch`.
5. NÃO quebrar comportamento atual quando o node Google Ads não existe ou retorna erro — fallback gracioso pra `'not_configured'`.

---

## Diff aplicado ao `jsCode` do `Calcular Metricas`

### Bloco 1 — Adicionar **antes** de `const cache = { ... }`

Inserir logo após a linha que monta `const saturacao = ads.map(...)`:

```javascript
// === Google Ads ===
const googleAdsRaw = safeFirst('Buscar Google Ads') || null;
let googleAdsBlock = null;
let googleStatus = 'not_configured';

if (googleAdsRaw && Array.isArray(googleAdsRaw.campanhas)) {
  const rawCamp = googleAdsRaw.campanhas;
  googleStatus = googleAdsRaw.status === 'ok' ? 'ok'
               : googleAdsRaw.status === 'error' ? 'error'
               : 'not_configured';

  // Match UTM: aceita 'google', 'google_ads', 'googleads' (case-insensitive)
  function isGoogleSource(co) {
    const src = lower(co.utmSource || '');
    return src === 'google' || src === 'google_ads' || src === 'googleads' || contains(src, 'google');
  }

  const googleCampanhas = rawCamp.map(function(c) {
    const leadsG = contactsWithResponse.filter(function(co) {
      return isGoogleSource(co) && matchesCampaign(co, c.name);
    });
    return {
      id: String(c.id || ''),
      name: c.name || '',
      status: c.status || 'UNKNOWN',
      spend: toNumber(c.spend),
      impressions: toNumber(c.impressions),
      clicks: toNumber(c.clicks),
      ctr: toNumber(c.ctr),
      conversions: toNumber(c.conversions),
      cost_per_conversion: toNumber(c.cost_per_conversion),
      leads_reonic: leadsG.length,
      cpl_real: leadsG.length > 0 ? toNumber(c.spend) / leadsG.length : 0,
    };
  });

  googleAdsBlock = {
    customer_id: String(googleAdsRaw.customer_id || ''),
    campanhas: googleCampanhas,
    totals: {
      spend_7d: toNumber(googleAdsRaw.totals && googleAdsRaw.totals.spend_7d),
      spend_30d: toNumber(googleAdsRaw.totals && googleAdsRaw.totals.spend_30d),
      conversions_7d: toNumber(googleAdsRaw.totals && googleAdsRaw.totals.conversions_7d),
      conversions_30d: toNumber(googleAdsRaw.totals && googleAdsRaw.totals.conversions_30d),
    },
  };
}
```

### Bloco 2 — Adicionar `channel: 'meta'` em **todas** campanhas Meta

Localizar `campanhasOut.map(...)` (já patchado em commit `f2643bb` — confirmar) ou ajustar o `return` interno do `campaigns.map(...)` adicionando:

```javascript
return {
  id: String(c.id),
  name: c.name,
  status: c.status,
  channel: 'meta',         // ← adicionar
  impressions: impressions,
  // ... resto igual
};
```

### Bloco 3 — Atualizar `cache` para incluir `google_ads` e `sources_status`

Substituir o objeto `cache` no final pelo:

```javascript
const cache = {
  meta: {
    generated_at: nowIso,
    next_refresh_at: new Date(now.getTime() + 30*60*1000).toISOString(),
    period: { start: thirtyDaysAgo.toISOString(), end: nowIso, label: 'Ultimos 30 dias' },
    sources_status: {
      meta_ads: campaigns.length ? 'ok' : 'error',
      reonic: contacts.length ? 'ok' : 'error',
      google_ads: googleStatus,                    // ← adicionar
      last_meta_fetch: nowIso,
      last_reonic_fetch: nowIso,
      last_google_fetch: googleAdsRaw ? nowIso : null,  // ← adicionar
    },
  },
  hero: { /* ... igual ... */ },
  funil: { /* ... igual ... */ },
  campanhas: campanhasOut,
  velocidade: { /* ... igual ... */ },
  mix_produto: null,
  saturacao: saturacao,
  google_ads: googleAdsBlock,                      // ← adicionar (null quando not_configured)
};
```

---

## Aplicar via API n8n (sem abrir UI)

```bash
# 1) Pegar workflow atual (preservar versionId pra evitar conflito)
N8N_BASE=https://n8n.escalanegociosdigitais.com.br
WORKFLOW_ID=AJypFIeC4rMcs18P
TOKEN=$N8N_API_KEY  # do .env.local

curl -s -X GET "$N8N_BASE/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $TOKEN" > /tmp/wf.json

# 2) Editar com Node.js (script abaixo em scripts/patch-calcular-metricas.mjs)
node scripts/patch-calcular-metricas.mjs /tmp/wf.json > /tmp/wf-patched.json

# 3) Enviar via PUT — IMPORTANTE: omitir staticData do payload (preserva cache em runtime)
jq 'del(.staticData)' /tmp/wf-patched.json > /tmp/wf-final.json

curl -s -X PUT "$N8N_BASE/api/v1/workflows/$WORKFLOW_ID" \
  -H "X-N8N-API-KEY: $TOKEN" \
  -H "Content-Type: application/json" \
  --data-binary @/tmp/wf-final.json
```

> **Lembrete crítico (Bug #11 do EXECUTION-REPORT):** PUT no n8n com `staticData` no payload sobrescreve o cache em runtime. Sempre `jq 'del(.staticData)'` antes.

---

## Validação pós-patch

1. **Execução manual do workflow** (clicar "Execute Workflow" na UI ou via API `POST /workflows/:id/execute`) — deve completar em <15s.
2. **Verificar staticData** no node `Validar Token e Servir Cache` → output deve ter:
   ```json
   {
     "google_ads": { "customer_id": "...", "campanhas": [...], "totals": {...} },
     "meta": { "sources_status": { "google_ads": "ok", "last_google_fetch": "..." } }
   }
   ```
3. **Webhook em produção** (`curl -H "Authorization: Bearer ..." https://n8n.../webhook/dashboard/revert`) → `data.google_ads` populado.
4. **Frontend** — refresh do dashboard, Bloco G deve renderizar tabela real (e não EmptyState).

---

## Rollback

Se algo quebrar, restaurar o `jsCode` original do `Calcular Metricas` (commit `f2643bb` tem a versão exata em `docs/n8n-workflows/revert-dashboard-v1.json` linha 278). O node `Buscar Google Ads` pode ficar isolado (sem affect) ou ser removido via PATCH similar.

---

*Patch pronto pra colar — não precisa improvisar quando credenciais chegarem.*
