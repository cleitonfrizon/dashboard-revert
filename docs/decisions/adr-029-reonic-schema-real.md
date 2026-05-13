# ADR-029 — Schema Real da Reonic (Q-1, Q-2, Q-3 Resolvidas)

**Data:** 2026-05-13
**Status:** Aceita
**Contexto:** Durante a Story 1.1, descobrimos que o schema inicialmente assumido em `data-schema.md` para a API Reonic estava incorreto. Esta ADR registra o schema real e o mapeamento aplicado.

---

## Q-1 RESOLVIDA — Enum de `status`

A Reonic **não usa enum fechado em inglês** (`qualified`, `proposal_sent`, etc.). Cada cliente configura seus próprios status em PT-BR. A Revert tem **71 status configurados**, agrupados por `type`:

- **`h360Request`** (etapas iniciais de qualificação): Geração do Lead, Primeiro contacto, Qualificação do Lead, Triagem (Engenharia), Qualificou? Sobe para Propostas, Proposta Gerada, Proposta Apresentada, Negociação, Fechamento, Próximo passo...
- **`h360Offer`** (etapas comerciais): Solicitação de Proposta, Viabilidade apresentada, Proposta Gerada, Proposta Apresentada, Em negociação, Proposta Aceita, Contrato enviado, Contrato Assinado, Pago, Em operação, Travado, Perdidos...
- **`h360Installation`** (pós-venda): Comissionamento, Aguardando Kit Solar, Em execução, Obra Finalizada, O&M...

**Decisão:** mapear funil via combinação de `state` (Open/Closed) + `type` (request/offer) + presença de `wonAt`/`lostAt`. Status nominais ficam visíveis ao usuário mas a lógica de funil usa esses campos estruturais.

---

## Q-2 RESOLVIDA — `firstContactAt`

**Não existe** campo `firstContactAt` no schema. O `contact` (pessoa) só tem `createdAt`.

**Decisão:** usar `offer.requestCreatedAt` como proxy de "primeiro contato" — quando o lead virou request comercial. Para contacts sem offer associada, considerar "não respondido". Tempo de resposta = `offer.requestCreatedAt - contact.createdAt` em segundos. Fallback se faltar requestCreatedAt: `offer.offerCreatedAt`.

---

## Q-3 RESOLVIDA — Endpoint de Offers + Contacts

| Recurso | URL real | Notas |
|---|---|---|
| Contacts (pessoas) | `GET /clients/{clientId}/contacts?page=N` | Paginação obrigatória; retorna array bruto de 100 itens/página |
| Offers (oportunidades) | `GET /clients/{clientId}/h360/offers?page=N` | Retorna `{ results: [...], ...}`; `state` em inglês, `status` PT-BR custom |
| Status enum | `GET /clients/{clientId}/status` | 71 status; usar `type` para filtrar |

**Endpoint inexistente:** `GET /clients/{clientId}/h360/requests` (404). O termo "request" em Reonic refere-se ao **tipo de Offer** (`offer.type === 'request'`), não a entidade separada.

---

## Schema Real (contacts)

```typescript
type ReonicContact = {
  id: string;
  firstName: string;
  lastName: string;
  salutation: string;
  email: string;
  emailSecondary: string | null;
  telephone: string;
  mobilePhone: string | null;
  street: string;
  number: string;
  city: string;
  postcode: string;
  utmSource: string | null;       // ← UTM já parseada (vem em campo separado!)
  utmCampaign: string | null;
  utmMedium: string | null;
  utmTerm: string | null;          // mapeia para Adset no nosso parser legacy
  utmContent: string | null;       // mapeia para Ad no nosso parser legacy
  createdAt: string;               // ISO
  marketingConsent: boolean;
  marketingConsentText: string;
  marketingConsentDataprotectionLink: string | null;
};
```

**Observação importante:** os UTMs já vêm em **campos estruturados** (`utmCampaign`, `utmTerm`, `utmContent`). O parser de `note` (data-schema seção 6.1) continua válido como fallback, mas a fonte primária agora são esses campos.

---

## Schema Real (offers)

```typescript
type ReonicOffer = {
  id: string;
  name: string;
  type: 'request' | 'offer';        // ← define em qual fase do funil está
  status: string;                   // PT-BR custom (ex: "Negociação")
  statusId: string;                 // UUID
  state: 'Open' | 'Won' | 'Lost';   // estado canônico
  customer: { id: string };         // FK para contact
  customerMessage: string;
  notes: string;
  totalPlannedPrice: number;
  customDealValue: number;
  lostReason: string | null;
  lostAt: string | null;
  wonAt: string | null;
  requestCreatedAt: string;          // ← proxy de "primeiro contato"
  offerCreatedAt: string | null;
  installationCreatedAt: string | null;
  leadSource: string | null;
  archived: boolean;
};
```

---

## Mapeamento de Funil Aplicado (ADR-029)

| Etapa | Regra |
|---|---|
| Leads recebidos | `count(contacts WHERE createdAt no período)` |
| Triagem | `count(offers WHERE type='request')` (Reonic recebeu e está triando) |
| Proposta | `count(offers WHERE type='offer')` (já virou oportunidade comercial) |
| Em negociação | `count(offers WHERE state='Open' AND status contém 'negocia')` (case-insensitive) |
| Fechado | `count(offers WHERE wonAt IS NOT NULL)` |

**MQL placeholder (ADR-009 revisado):** offers com `state IN ('Open','Won')` e `type='offer'`. Robson ainda deve confirmar critério objetivo (Q-5 segue aberta).

**CAC:** `spend_meta_periodo / count(offers WHERE wonAt no período)`.

**Ticket médio realizado:** `sum(totalPlannedPrice WHERE wonAt) / count(WHERE wonAt)`. Fallback: `customDealValue` quando `totalPlannedPrice == 0`.

---

## Impacto

- Code node `Calcular Metricas` reescrito para usar `contacts` (leads) e `offers` (funil) corretamente.
- Q-1, Q-2, Q-3 do `data-schema.md` **fechadas**. Q-4 e Q-5 seguem dependentes do Robson.
- Parser de `note` para UTM segue como fallback secundário (campos `utm*` são primários).
- Tempo de resposta deixou de ser preciso "lead chegou → SDR respondeu" e passou a ser "contact criado → offer/request gerada", o que ainda serve como indicador operacional confiável.
