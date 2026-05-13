# Workflows n8n exportados

Os workflows criados nas Stories 1.1 e 1.2 serão exportados aqui como JSON após cada execução bem-sucedida:

- `dashboard-aggregator-v1.json` — Workflow agregador (Story 1.1)
- `dashboard-api-v1.json` — Workflow endpoint REST (Story 1.2)

Comando para exportar via API n8n:
```bash
curl -X GET "https://n8n.escalanegociosdigitais.com.br/api/v1/workflows/<WORKFLOW_ID>" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" > dashboard-aggregator-v1.json
```
