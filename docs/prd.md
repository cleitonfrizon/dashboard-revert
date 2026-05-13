# PRD — Dashboard de BI Revert Energia Solar

**Project:** Dashboard de BI Revert
**Author:** Cleiton Frizon (Escala Negócios Digitais)
**Created:** 2026-05-12
**Updated:** 2026-05-12 (v2 — stack mudou de Lovable para Vite+Vercel)
**Status:** Approved
**Epic:** 001-dashboard-bi-revert

---

## 1. Goals

### Primary
- Permitir que o Robson (sócio da Revert) abra um único painel pela manhã e tome decisões de alocação de verba e gestão comercial em até 30 segundos
- Cruzar dados de Meta Ads, Google Ads (fase 2), Reonic CRM e canais offline em visualização unificada
- Reduzir o tempo de resposta a leads através de visibilidade contínua do funil

### Secondary
- Servir de caso piloto produtizável para replicação em outros clientes da Escala (Portocaril, próximos)
- Reforçar leverage de retenção via integração técnica profunda
- Documentar a propriedade intelectual do código como ativo da Escala

### Non-goals (v1)
- Substituir o Reonic como CRM
- Criar/editar leads no painel
- Predição com Machine Learning
- App mobile nativo
- Multi-tenant

---

## 2. Background

A Revert Energia Solar é cliente da Escala desde dezembro/2025. Atua em B2C (Smart Revert residencial, ticket R$ 14-25K) e B2B (usinas R$ 300K, indústria R$ 1-2M).

A integração Meta Lead Ads → n8n → Reonic CRM **está em produção desde 29/04/2026**, com primeiro lead criado em ~1.178s (workflow `dYJBsmLbfhaU5Og0`).

Na reunião de 12/05/2026, o Robson sinalizou como dor número um a falta de visibilidade integrada sobre origem dos leads, gargalos do funil e performance por produto. Citação:

> "Sem dado, você está otimizando no escuro, tomando no achismo. Eu preciso saber quantos leads chegaram, desses leads quantos geraram proposta, desses que geraram proposta quantos fecharam, e desses que fecharam o que é produto meu."

**Decisão de stack (atualizada após reunião):** inicialmente proposto Lovable, evoluído para **Vite + React + Tailwind + Vercel** após análise de custo/benefício:
- Custo Sprint 1: R$ 200 vs R$ 3.450 estimado Lovable
- Reusabilidade para outros clientes via fork do repositório
- Controle total da identidade visual Escala dark premium
- Versionamento Git nativo + AIOX completo

---

## 3. Personas

### Primary — Robson Souza (Sócio-fundador Revert)
Abre o painel pela manhã. Precisa de diagnóstico imediato. Não é técnico. Acessa do desktop. Tomada de decisão: "se algo está ruim, eu cobro o time hoje".

### Secondary — Paulo (Sócio operacional Escala / gestor da conta)
Usa diariamente. Precisa de drilldown granular. Vai notar saturação criativa antes do Robson.

### Secondary — Cleiton (Founder Escala)
Uso semanal para preparar reuniões quinzenais. Visão executiva consolidada.

### Tertiary — Rodrigo (Comercial Revert) — fase 3
Alimenta canais offline no Reonic. Recebe notificações do "Hall da Vergonha".

---

## 4. Functional Requirements (FRs)

### FR-1 — Hero do Dia (Bloco A)
4 cards no topo:
- Verba gasta hoje em mídia paga (R$) + delta vs média 7d
- CPL hoje vs CPL médio 7d (com semáforo)
- Leads recebidos hoje + tendência vs ontem
- Tempo médio de resposta do dia em segundos

### FR-2 — Funil ao Vivo (Bloco B)
Funil em 5 etapas com números absolutos e taxas de conversão:
1. Leads recebidos
2. Triagem realizada
3. Proposta enviada
4. Em negociação
5. Fechado

Cor semafórica em etapas com taxa abaixo do benchmark.

### FR-3 — Performance por Campanha (Bloco C)
Tabela ordenável com uma linha por campanha Meta:
- Nome, impressões, CTR
- Conversas Meta vs leads Reonic
- CPL real (Reonic), MQL, CAC, ticket médio
- Ordenação por qualquer coluna numérica

### FR-4 — Velocidade Comercial (Bloco D)
- Distribuição em 5 buckets: ≤1min, 1-10min, 10-60min, 1-24h, >24h
- "Hall da Vergonha": últimos 10 leads não atendidos em >24h
- Tempo médio: hoje, semana, mês

### FR-5 — Mix de Produto (Bloco E) — Sprint 2
Para cada produto Revert: leads, propostas, fechamentos, ticket médio, tempo funil, cruzamento produto × canal.

### FR-6 — Saturação Criativa (Bloco F) — Sprint 2
Tabela com criativos ativos:
- Frequência, CTR 7d (tendência), CPL 7d (tendência), investimento
- Alerta "trocar criativo" quando: freq > 3 E CTR caiu >20% em 7 dias

### FR-7 — Filtros globais
- Período: hoje, 7d, 30d, mês atual, customizado
- Produto, canal (fase 2)

### FR-8 — Atualização
- Meta Ads: 30 minutos
- Reonic: 15 minutos
- Indicador visual + botão "atualizar agora"

### FR-9 — Autenticação
- v1: senha compartilhada + bcrypt
- v2: magic link por e-mail
- Logs de acesso

### FR-10 — Responsividade
- Desktop 1280px+ (uso principal)
- Tablet 768-1280px (navegabilidade preservada)
- Mobile (Hero + Funil prioritários, demais com scroll)

---

## 5. Non-Functional Requirements (NFRs)

### NFR-1 — Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Bundle size < 300KB gzip
- Resposta endpoint n8n < 500ms (cache hit)

### NFR-2 — Reliability
- Disponibilidade alvo: 99%
- Tratamento de falhas: usar último cache válido + aviso
- Retry automático com backoff exponencial

### NFR-3 — Security
- HTTPS obrigatório
- Token de auth no endpoint REST armazenado como secret
- Nenhum dado sensível em logs
- Mascaramento de telefone na UI: `(45) ****-1234`

### NFR-4 — Maintainability
- Componentes nomeados por bloco (BlocoA_Hero.tsx, etc.)
- Constantes de theme em arquivo central
- Workflow n8n com nodes em PT-BR

### NFR-5 — Identidade visual
- Padrão Escala dark premium aplicado rigorosamente (ver `docs/brand-system.md`)
- Cores: preto, dourado, navy — sem azul de dashboard padrão
- Tipografia: Poppins + Playfair Display apenas
- Densidade alta (visual de BI, não minimalista)

---

## 6. Edge Cases

| Caso | Tratamento |
|---|---|
| Meta API retorna 0 dados | "Nenhuma campanha ativa no período" |
| Reonic offline | Último cache + badge "dados de X min atrás" |
| Lead no Meta sem chegar no Reonic | Não contar até Reonic confirmar |
| Lead órfão sem UTM | Agrupar em "Origem desconhecida" |
| Período sem vendas | "Sem vendas no período" sem erro |
| Mobile com tabela larga | Scroll horizontal, primeira coluna fixa |
| Browser antigo (IE11) | Bloquear com mensagem |

---

## 7. Métricas de Sucesso

| Métrica | Como medir | Meta v1 |
|---|---|---|
| Adoção | Acessos únicos Robson/semana | ≥ 4 dias úteis |
| Tempo de decisão | Auto-relato em quinzenal | "30 segundos" |
| Erros reportados | Mensagens sobre divergência | < 2/mês |
| Tempo resposta leads | Tempo médio Revert | -30% em 90 dias |
| Satisfação Robson | NPS quinzenal | ≥ 9 ou "essencial" |

---

## 8. Riscos e Mitigações

| ID | Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|---|
| R-1 | Reonic não ter campo "produto" | Alta | Alto | Validar antes Sprint 2 |
| R-2 | Time Revert não preencher origem offline | Média | Alto | SOP definido antes Fase 3 |
| R-3 | Lovable consumir muitos créditos (MITIGADO) | — | — | Migrado para Vite+Vercel ✅ |
| R-4 | Robson mudar layout depois de pronto | Alta | Médio | Validar wireframe antes |
| R-5 | Critérios de MQL mudarem | Alta | Baixo | Parametrizar em env var |
| R-6 | Meta Graph API rate limit | Baixa | Médio | Cache 30min + backoff |
| R-7 | Build Vite falhar config | Baixa | Médio | @qa antes do deploy |

---

## 9. Premissas

- Integração Meta→n8n→Reonic estável
- n8n self-hosted com capacidade ociosa
- Robson e Paulo absorvem painel novo
- Taxa de leads não cresce 10x nas próximas semanas
- Vercel Free tier suficiente para tráfego inicial (3-5 usuários)

---

## 10. Open Questions (a resolver durante Sprint 1)

1. Reonic registra `firstContactAt` ou só `createdAt`? — **Owner: Cleiton, prazo: 14/05**
2. Endpoint Reonic para Offers — qual URL? — **Owner: Cleiton, prazo: 14/05**
3. Campo produto no Reonic — nativo ou customizado? — **Owner: Cleiton + Robson, prazo: 16/05**
4. Critério objetivo de MQL — **Owner: Robson, prazo: 26/05**

---

## 11. Cronograma

| Semana | Marco |
|---|---|
| 12/05 | PRD aprovado, stack confirmada (Vite+Vercel) |
| 13-15/05 | Stories 1.1, 1.2, 1.3 |
| 16-18/05 | Stories 1.4, 1.5, 1.6 |
| 19/05 | MVP entregue ao Robson |
| 20-26/05 | Iterações + Stories 1.7, 1.10 |
| 26/05 | Reunião quinzenal — feedback Robson |
| 27/05-09/06 | Sprint 2 — Stories 1.8, 1.9 |

---

## 12. Referências

- Architecture: `docs/architecture.md`
- Data schema: `docs/data-schema.md`
- Brand system: `docs/brand-system.md`
- Stories: `docs/stories/`
- Ata reunião 12/05/2026: arquivo externo

---

*PRD v2 — aprovado em 12/05/2026 com mudança de stack para Vite+Vercel*
