# Data Schema — Dashboard de BI Revert

**Project:** Dashboard de BI Revert
**Data Engineer:** Cleiton Frizon (Escala Negócios Digitais)
**Created:** 2026-05-12
**Status:** Draft — Open Questions Q-1 a Q-3 a confirmar durante execução

---

## 1. Visão Geral

1. **Schema das fontes** — Reonic API v2 e Meta Graph API
2. **Schema do cache** — formato em `/tmp/revert-dashboard-cache.json`
3. **Schema do endpoint** — resposta de `GET /webhook/dashboard/revert`
4. **Transformações** — cálculos de métricas derivadas

---

## 2. Source: Reonic API v2

### Credenciais
- **Base URL:** `https://api.reonic.de/rest/v2`
- **Client ID:** `29d4c1e4-d67a-4c89-99bb-8980f5bad9dc`
- **Auth header:** `x-authorization: Basic <KEY>` (lowercase)

### Endpoint: Listar Requests (leads)

```
GET /clients/{clientId}/h360/requests
```

```typescript
type ReonicRequest = {
  id: string;
  customer: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  postcode: string;
  city: string;
  street: string;
  streetNumber: string;
  note: string;                  // ← UTM/origem fica aqui
  acceptedDataProtection: boolean;
  status: string;                // ⚠️ Q-1: enum a confirmar
  createdAt: string;             // ISO
  firstContactAt?: string;       // ⚠️ Q-2: confirmar se existe
  updatedAt?: string;
}
```

### Endpoint: Listar Offers (propostas)

```
GET /clients/{clientId}/h360/offers
```

```typescript
type ReonicOffer = {
  id: string;
  customer: string;              // FK para ReonicRequest.customer
  status: string;                // draft, sent, accepted, declined
  totalValue: number;            // ⚠️ Q-3: confirmar campo
  createdAt: string;
  signedAt?: string;
  signedPdfUrl?: string;
}
```

### Webhooks disponíveis (futuro — não usar no MVP)

```
POST /webhooks/offer-signed/subscribe
POST /webhooks/request-created/subscribe
POST /webhooks/offer-created/subscribe
```

Payload (offer-signed):
```json
{
  "offerId": "uuid",
  "signedAt": "2026-03-20T15:30:00Z",
  "signedPdfUrl": "https://...",
  "customerEmail": "cliente@email.com"
}
```

---

## 3. Source: Meta Graph API

### Credenciais
- **App ID:** `3923359997963477`
- **API version:** v23.0
- **Ad Account ID:** `act_608480425054965`
- **Business ID:** `1630863521422313`
- **Page ID:** `1040835519119736`

### Endpoints utilizados

**Campanhas ativas:**
```
GET /act_{adAccountId}/campaigns
?fields=id,name,status,objective,daily_budget
&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE","PAUSED"]}]
```

**Insights por campanha (últimos 7 dias):**
```
GET /act_{adAccountId}/insights
?fields=campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpm,frequency,actions
&level=campaign
&time_range={"since":"YYYY-MM-DD","until":"YYYY-MM-DD"}
```

**Ads (criativos):**
```
GET /act_{adAccountId}/ads
?fields=id,name,campaign_id,creative,status
&filtering=[{"field":"effective_status","operator":"IN","value":["ACTIVE"]}]
```

**Insights por ad (saturação):**
```
GET /act_{adAccountId}/insights
?fields=ad_id,ad_name,spend,impressions,reach,frequency,ctr,actions
&level=ad
&time_range={"since":"YYYY-MM-DD","until":"YYYY-MM-DD"}
```

### Rate Limit
- Meta App-level: 200 calls/hora
- Estratégia: 1 refresh dashboard = ~5 calls; cron 30min = 240 calls/dia (dentro do limite)

---

## 4. Cache JSON — `/tmp/revert-dashboard-cache.json`

```typescript
type DashboardCache = {
  meta: {
    generated_at: string;
    next_refresh_at: string;
    period: {
      start: string;
      end: string;
      label: string;
    };
    sources_status: {
      meta_ads: "ok" | "stale" | "error";
      reonic: "ok" | "stale" | "error";
      last_meta_fetch: string;
      last_reonic_fetch: string;
    };
  };

  // ─── BLOCO A ────────────────────────────────────────
  hero: {
    spend_today: number;
    spend_today_delta_pct: number;
    cpl_today: number;
    cpl_7d_avg: number;
    cpl_status: "good" | "warning" | "bad";
    leads_today: number;
    leads_yesterday: number;
    avg_response_time_today_sec: number;
  };

  // ─── BLOCO B ────────────────────────────────────────
  funil: {
    leads: number;
    triagem: number;
    proposta: number;
    negociacao: number;
    fechado: number;
    conversion_rates: {
      lead_to_triagem: number;
      triagem_to_proposta: number;
      proposta_to_negociacao: number;
      negociacao_to_fechado: number;
    };
    benchmarks: {
      lead_to_triagem: 0.95;
      triagem_to_proposta: 0.40;
      proposta_to_negociacao: 0.60;
      negociacao_to_fechado: 0.30;
    };
  };

  // ─── BLOCO C ────────────────────────────────────────
  campanhas: Array<{
    id: string;
    name: string;
    status: "ACTIVE" | "PAUSED";
    impressions: number;
    ctr: number;
    conversas_meta: number;
    leads_reonic: number;
    cpl_real: number;
    mql: number;
    cac: number;
    ticket_medio_realizado: number;
    spend: number;
  }>;

  // ─── BLOCO D ────────────────────────────────────────
  velocidade: {
    distribuicao: {
      ate_1min: number;
      um_a_dez_min: number;
      dez_a_sessenta_min: number;
      uma_a_24h: number;
      mais_de_24h: number;
    };
    avg_response_today_sec: number;
    avg_response_7d_sec: number;
    avg_response_30d_sec: number;
    hall_da_vergonha: Array<{
      lead_id: string;
      nome: string;
      telefone_mascarado: string;
      origem: string;
      created_at: string;
      hours_waiting: number;
    }>;
  };

  // ─── BLOCO E (Sprint 2 — condicional) ──────────────
  mix_produto: Array<{
    produto: string;
    leads: number;
    propostas: number;
    fechamentos: number;
    ticket_medio: number;
    tempo_medio_funil_dias: number;
    por_canal: {
      meta_ads: number;
      google_ads: number;
      offline: number;
    };
  }> | null;

  // ─── BLOCO F (Sprint 2) ─────────────────────────────
  saturacao: Array<{
    ad_id: string;
    ad_name: string;
    campaign_name: string;
    frequency: number;
    ctr_7d: number;
    ctr_trend_pct: number;
    cpl_7d: number;
    cpl_trend_pct: number;
    spend_total: number;
    recommendation: "ok" | "monitor" | "trocar";
  }>;
};
```

---

## 5. Endpoint REST do n8n

```
GET https://n8n.escalanegociosdigitais.com.br/webhook/dashboard/revert
Headers:
  Authorization: Bearer <TOKEN>
```

**200 OK:**
```json
{
  "ok": true,
  "data": { /* DashboardCache */ }
}
```

**401 Unauthorized:**
```json
{ "ok": false, "error": "INVALID_TOKEN" }
```

**503 Service Unavailable:**
```json
{ "ok": false, "error": "CACHE_REFRESHING", "retry_after_sec": 30 }
```

---

## 6. Transformações

### 6.1 Parser de UTM no `note` do Reonic

Formato esperado (gerado pelo workflow legacy):
```
Lead captado via Meta Ads
Campaign: Smart Revert Cascavel
Adset: Públicos Lookalike 1%
Ad: Vídeo Depoimento Cliente
Form: form_id_xxxxx
```

```javascript
function parseNoteToUtm(note) {
  const utm = { campaign: null, adset: null, ad: null };
  const lines = note.split('\n');
  for (const line of lines) {
    if (line.startsWith('Campaign:')) utm.campaign = line.substring(9).trim();
    if (line.startsWith('Adset:')) utm.adset = line.substring(6).trim();
    if (line.startsWith('Ad:')) utm.ad = line.substring(3).trim();
  }
  return utm;
}
```

### 6.2 Cálculos derivados

| Métrica | Fórmula |
|---|---|
| CPL real | `spend_meta / count(leads_reonic_da_campanha)` |
| CAC | `spend_meta / count(offers_aceitas_da_campanha)` |
| Ticket médio | `sum(offer.totalValue WHERE accepted AND da_campanha) / count(aceitas)` |
| MQL | `leads WHERE status IN (qualified, proposal_sent, negotiating, closed_won)` (placeholder) |
| Taxa funil | `count(stage_n) / count(stage_n-1)` |
| Tempo resposta | `firstContactAt OR updatedAt - createdAt` em segundos |
| Saturação | `frequency > 3 AND (ctr_atual - ctr_7d_atras) / ctr_7d_atras < -0.20` |
| Delta vs 7d | `(valor_hoje - media_7d) / media_7d * 100` |

### 6.3 Definição de períodos

- **"Hoje"**: midnight em `America/Sao_Paulo` até agora
- **"7d"**: rolling 7 dias completos (exclui hoje)
- **"30d"**: rolling 30 dias completos
- **"Mês atual"**: dia 1 do mês até hoje

⚠️ **Importante**: sempre `AT TIME ZONE 'America/Sao_Paulo'` — VPS roda UTC.

---

## 7. Mascaramento de PII

| Campo | UI normal | Hall da Vergonha | Regra |
|---|---|---|---|
| Email | Mascarado `j****@gmail.com` | Completo | Cortar meio |
| Telefone | `(45) ****-1234` | `(45) ****-1234` | DDD + últimos 4 |
| Nome | Primeiro + inicial | Primeiro + inicial | "João S." |
| Endereço | Não exibir | Não exibir | — |
| CPF | Não exibir | Não exibir | — |

---

## 8. Pendências (Open Questions)

| ID | Pendência | Owner | Status |
|---|---|---|---|
| Q-1 | Confirmar enum de `status` no Reonic | Cleiton durante Story 1.1 | ✅ ADR-029 |
| Q-2 | Existe `firstContactAt`? Fallback para `updatedAt` | Cleiton durante Story 1.1 | ✅ ADR-029 |
| Q-3 | Endpoint exato de Offers | Cleiton durante Story 1.1 | ✅ ADR-029 |
| Q-4 | Campo de produto no Reonic | Robson + Cleiton | ⏳ (não bloqueia v1) |
| Q-5 | Critério objetivo de MQL | Robson | ⏳ (placeholder em uso) |
| Q-6 | MCC ID + customer_id da Revert no Google Ads | Cleiton + Robson | ⏳ Story 2.1 |
| Q-7 | Tag de conversão Google Ads + UTMs `google_ads` no GTM | Cleiton + Robson | ⏳ Story 2.1 |

---

## 9. Google Ads (Story 2.1 — em discovery)

### 9.1 Endpoint base

```
POST https://googleads.googleapis.com/v17/customers/{customerId}/googleAds:searchStream
Authorization: Bearer {oauth_access_token}
developer-token: {developer_token}
login-customer-id: {mcc_id}
Content-Type: application/json
```

### 9.2 Credenciais necessárias

| Item | Onde obter | Owner |
|---|---|---|
| `developer_token` | https://ads.google.com/aw/apicenter (Tools → API Center) | Cleiton (MCC Escala) |
| `client_id` + `client_secret` | console.cloud.google.com → OAuth 2.0 Client IDs | Cleiton (GCP Escala) |
| `refresh_token` | OAuth flow uma vez (scope `https://www.googleapis.com/auth/adwords`, access_type=offline, prompt=consent) | Cleiton (gera 1x e armazena) |
| `mcc_id` (login-customer-id) | Painel MCC Escala (10 dígitos, sem traços) | Cleiton |
| `customer_id` da Revert | Conta da Revert dentro do MCC | Robson confirma vinculação |

### 9.3 GAQL queries propostas

**Campanhas + métricas 30d** (single request):
```sql
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  metrics.cost_micros,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.conversions,
  metrics.cost_per_conversion
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.status = 'ENABLED'
ORDER BY metrics.cost_micros DESC
LIMIT 50
```

**Conversões por ação** (se houver mais de 1 tag — segunda fase):
```sql
SELECT
  conversion_action.id,
  conversion_action.name,
  metrics.conversions,
  metrics.cost_micros
FROM conversion_action
WHERE segments.date DURING LAST_30_DAYS
```

### 9.4 Schema do cache

Adicionado a `cache.google_ads`:

```typescript
google_ads?: {
  customer_id: string,
  campanhas: Array<{
    id: string,
    name: string,
    status: string,
    spend: number,             // metrics.cost_micros / 1_000_000
    impressions: number,
    clicks: number,
    ctr: number,               // metrics.ctr (0..1)
    conversions: number,
    cost_per_conversion: number,
    leads_reonic: number,      // match via utmSource=google + utmCampaign
    cpl_real: number,          // spend / leads_reonic
  }>,
  totals: {
    spend_7d: number,
    spend_30d: number,
    conversions_7d: number,
    conversions_30d: number,
  }
}
```

E em `cache.meta.sources_status`:
```typescript
google_ads?: 'ok' | 'stale' | 'error' | 'not_configured'
last_google_fetch?: string
```

### 9.5 Match Google Ads ↔ Reonic

Mesmo padrão usado para Meta:
- `contact.utmSource === 'google'` (ou `'google_ads'` — confirmar no GTM via Q-7)
- `contact.utmCampaign` cruza com `campaign.name` (igual, contém, ou contém-no)

Robson + Cleiton precisam validar **Q-7** (que existem UTMs `google_ads` no GTM da Revert) antes da Story sair de discovery.

---

*Data schema v1.1 — Q-1/Q-2/Q-3 resolvidas via ADR-029; Google Ads adicionado em discovery (Story 2.1)*
