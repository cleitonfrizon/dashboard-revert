# Setup OAuth Google Ads — Passo-a-passo executável

**Tempo total:** ~5 min (depois que o `developer_token` foi aprovado pelo Google — esse passo separado leva 1-2 dias).
**Owner:** Cleiton
**Output esperado:** 6 envs configuradas no n8n + workflow rodando com `sources_status.google_ads === 'ok'`.

---

## Pré-requisito (separado, dias antes)

Aplicar pelo `developer_token` no MCC da Escala:

1. Acessar: https://ads.google.com/aw/apicenter (logado com a conta que administra o MCC)
2. Tools & Settings → API Center → "Apply for token"
3. Preencher formulário (caso de uso: "Internal BI dashboard for client agency, read-only access to campaign metrics")
4. Aguardar aprovação (24-48h em média)
5. Status sai como **Basic Access** (suficiente; Standard só precisa quando volume > 15k chamadas/dia)

**Resultado:** `GOOGLE_ADS_DEVELOPER_TOKEN` (string de ~22 chars, ex: `abc123XYZ-9_def456GHI0`)

---

## Passo 1 — Criar OAuth Client ID (Desktop) no GCP

1. Acessar: https://console.cloud.google.com/apis/credentials
2. Selecionar projeto (criar um novo "Escala BI" se não existir) — APIs & Services → Library → procurar "Google Ads API" → Enable.
3. Credentials → Create credentials → **OAuth client ID**.
4. Application type: **Desktop app**.
5. Name: `Escala BI - Revert Dashboard`.
6. Create.

**Resultado:** anota `GOOGLE_ADS_CLIENT_ID` (termina com `.apps.googleusercontent.com`) e `GOOGLE_ADS_CLIENT_SECRET` (string de ~24 chars).

---

## Passo 2 — Capturar o `refresh_token` (fluxo manual, 1x só)

### 2.1 — Gerar URL de autorização

Substitua `CLIENT_ID_AQUI` e cole no browser:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=CLIENT_ID_AQUI&redirect_uri=http://localhost&response_type=code&scope=https://www.googleapis.com/auth/adwords&access_type=offline&prompt=consent
```

**Crítico:**
- `access_type=offline` → garante refresh_token na resposta
- `prompt=consent` → força o Google a re-emitir o refresh_token mesmo se você já autorizou antes
- `redirect_uri=http://localhost` → padrão pra OAuth de Desktop apps (o browser vai mostrar "site não encontrado" — é esperado, pega o `code` da URL)

### 2.2 — Autorizar com a conta que tem acesso ao MCC

Logar com a conta **dono do MCC da Escala** (mesma que aprovou o developer_token). Aceitar permissões.

O browser redireciona pra `http://localhost/?code=4/0A...XYZ&scope=...`. **Copie o valor de `code`** (entre `?code=` e `&scope`).

### 2.3 — Trocar `code` por `refresh_token`

Comando curl (substitua os 3 valores):

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=CLIENT_ID_AQUI" \
  -d "client_secret=CLIENT_SECRET_AQUI" \
  -d "code=CODE_DO_PASSO_2.2" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=http://localhost"
```

Resposta esperada:

```json
{
  "access_token": "ya29...",      // ignorar — expira em 1h
  "refresh_token": "1//0g...",    // ← ESSE é o GOOGLE_ADS_REFRESH_TOKEN
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/adwords",
  "token_type": "Bearer"
}
```

> Se a resposta **não** trouxer `refresh_token`, é porque o Google reconheceu autorização anterior. Refazer o passo 2.1 garantindo que `prompt=consent` está na URL.

---

## Passo 3 — Identificar `MCC_ID` e `CUSTOMER_ID` da Revert

### `GOOGLE_ADS_MCC_ID` (login-customer-id)

Painel do MCC: canto superior direito, embaixo do email — número de 10 dígitos no formato `XXX-XXX-XXXX`. Salvar **sem traços**: `XXXXXXXXXX`.

### `GOOGLE_ADS_CUSTOMER_ID` (Revert)

No painel do MCC, listar contas vinculadas → clicar na **Revert Energia Solar** → mesmo formato 10 dígitos, sem traços.

> Se Robson não confirmou ainda qual é a conta correta, peça a ele um print do canto superior direito do painel Google Ads dele (com o número visível).

---

## Passo 4 — Sanity check via curl (antes de tocar no n8n)

Validar que as 6 credenciais funcionam juntas:

```bash
# 4.1 — Renovar access_token
ACCESS=$(curl -sX POST https://oauth2.googleapis.com/token \
  -d "client_id=$GOOGLE_ADS_CLIENT_ID" \
  -d "client_secret=$GOOGLE_ADS_CLIENT_SECRET" \
  -d "refresh_token=$GOOGLE_ADS_REFRESH_TOKEN" \
  -d "grant_type=refresh_token" | jq -r '.access_token')

echo "Access token: ${ACCESS:0:20}..."

# 4.2 — Query simples (só conta o nome da customer)
curl -sX POST "https://googleads.googleapis.com/v17/customers/$GOOGLE_ADS_CUSTOMER_ID/googleAds:searchStream" \
  -H "Authorization: Bearer $ACCESS" \
  -H "developer-token: $GOOGLE_ADS_DEVELOPER_TOKEN" \
  -H "login-customer-id: $GOOGLE_ADS_MCC_ID" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT customer.descriptive_name FROM customer LIMIT 1"}' | jq .
```

**Resultado esperado:**

```json
[{
  "results": [{ "customer": { "descriptiveName": "Revert Energia Solar" } }]
}]
```

**Erros comuns:**
- `PERMISSION_DENIED` → MCC_ID errado ou customer_id não vinculado ao MCC
- `INVALID_DEVELOPER_TOKEN` → developer_token ainda não aprovado (esperar)
- `UNAUTHENTICATED` → refresh_token expirou (refazer Passo 2)

---

## Passo 5 — Configurar envs no n8n

Via UI (Settings → Variables) ou via API:

```bash
N8N_BASE=https://n8n.escalanegociosdigitais.com.br

for VAR in GOOGLE_ADS_CLIENT_ID GOOGLE_ADS_CLIENT_SECRET GOOGLE_ADS_REFRESH_TOKEN GOOGLE_ADS_DEVELOPER_TOKEN GOOGLE_ADS_MCC_ID GOOGLE_ADS_CUSTOMER_ID; do
  echo "Setando $VAR..."
  # Variáveis no n8n são por instância — ver docs em https://docs.n8n.io/environments/variables/
done
```

> n8n self-hosted lê envs do `docker-compose.yml`/`.env` do container. Adicionar lá, restartar container. **Alternativa:** salvar como **Credentials** custom (preferível pra rotação).

---

## Passo 6 — Aplicar patches no workflow

Seguir, nessa ordem:

1. `docs/n8n-workflows/google-ads-fetch-node.json` — inserir node `Buscar Google Ads` entre `Buscar Ads Meta` e `Buscar Contacts Reonic`.
2. `docs/n8n-workflows/calcular-metricas-google-patch.md` — patchar `Calcular Metricas`.
3. Execute manual do workflow (clicar "Execute Workflow").
4. Validar `staticData.cache.google_ads` populado.
5. Validar via curl no webhook: `data.google_ads.campanhas.length > 0`.
6. Frontend já está pronto — refresh do dashboard mostra Bloco G renderizando.

---

## Checklist final (depois de tudo)

- [ ] `developer_token` aprovado em Basic Access
- [ ] 6 envs configuradas no n8n
- [ ] Sanity check via curl retorna nome da customer (passo 4.2)
- [ ] Node `Buscar Google Ads` retorna `status: 'ok'` em execução isolada
- [ ] Cache `staticData.cache.google_ads.campanhas` populado com 50+ items
- [ ] Webhook `https://n8n.../webhook/dashboard/revert` retorna `data.google_ads`
- [ ] Bloco G no dashboard renderiza tabela com `cpl_real` calculado via match Reonic
- [ ] (Bonus) Sanity comparativo: spend_30d do Bloco G dentro de 15% do que aparece no painel da Google Ads

---

## Rotação de credenciais (médio prazo)

| Credencial | Validade | Como rotacionar |
|---|---|---|
| `access_token` | 1h | Automático (workflow renova a cada execução) |
| `refresh_token` | 6 meses sem uso ou revogação manual | Refazer Passo 2 |
| `developer_token` | Sem expiração | Substituir em emergência (incidente de segurança) |
| `client_secret` | Sem expiração | Recriar OAuth Client no GCP se vazar |

---

*Guia fechado. Quando os 6 envs estiverem no n8n e os 2 patches aplicados, o Bloco G sai do EmptyState pra produção em ~10 min.*
