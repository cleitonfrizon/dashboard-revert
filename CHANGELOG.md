# CHANGELOG — Pacote AIOX Dashboard de BI Revert

## v2.0 — 12/05/2026

### Mudanças principais
- **Stack migrada de Lovable → Vite + React + Tailwind + Vercel**
  - Razão: economia de ~R$ 3.150 no Sprint 1, controle total da identidade visual, reusabilidade para outros clientes
- **Identidade visual Escala Brand System totalmente embutida** (`docs/brand-system.md`)
  - Paleta dark premium (preto + dourado + navy)
  - Tipografia Poppins + Playfair Display
  - Regras invioláveis (sem "agência", CNPJ correto, etc.)
  - Componentes assinatura
- **28 ADRs pré-aprovadas** em `architecture.md` para autonomia do @dev
- **Adicionado PROMPT_MESTRE_FINAL.md** na raiz — prompt completo para colar no Claude Code
- **Adicionado GUIA_EXECUCAO.md** — passo-a-passo de setup, execução e validação
- **Adicionado .env.example** — template completo com placeholders
- **Adicionado .gitignore** — protege secrets e arquivos sensíveis
- **Adicionada pasta `docs/decisions/`** — para ADRs adicionais geradas em runtime
- **Adicionada pasta `docs/n8n-workflows/`** — para exports JSON dos workflows
- **Updates nas stories**:
  - Story 1.3 totalmente reescrita para Vite (era Lovable)
  - Story 1.10 atualizada para Vercel + domínio próprio (era Lovable custom domain)
  - Demais stories: pequenos ajustes de referências

### Dados confirmados nesta versão
- META_AD_ACCOUNT_ID: `act_608480425054965`
- META_BUSINESS_ID: `1630863521422313`
- REONIC_CLIENT_ID: `29d4c1e4-d67a-4c89-99bb-8980f5bad9dc`
- GitHub repo: `cleitonfrizon/dashboard-revert`
- Domínio alvo: `dashboard.escalanegociosdigitais.com.br`

---

## v1.0 — 12/05/2026 (versão inicial — substituída)

- Pacote AIOX inicial com 10 stories
- Stack proposta: Lovable
- PRD + Architecture + Data Schema + Stories
