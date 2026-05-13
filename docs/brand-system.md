# Escala Brand System — Identidade Visual Aplicada ao Dashboard

> Fonte única da verdade para a identidade visual do dashboard. Aplicar RIGOROSAMENTE em todos os componentes.

---

## 🎨 Paleta de Cores

### Tokens principais

| Token | Hex | Uso |
|---|---|---|
| `--black` | `#0A0A0A` | Fundo principal |
| `--navy` | `#0D1B2A` | Gradientes hero, footer |
| `--navy-light` | `#1C2636` | Headers de tabela, cards elevados |
| `--bg-card` | `#141414` | Cards no fundo preto |
| `--gold` | `#C8A84E` | Cor de destaque principal — bordas, ícones, números hero |
| `--gold-light` | `#D4B96A` | Hover, brilhos, subtítulos |
| `--gold-dark` | `#A8883A` | Acentos secundários |
| `--white` | `#FFFFFF` | Texto principal sobre escuro |
| `--gray-200` | `#E0E0E0` | Texto lead |
| `--gray-300` | `#BDBDBD` | Texto corpo |
| `--gray-500` | `#666666` | Texto meta/secundário |

### Cores de status (uso restrito, não dominar paleta)

| Token | Hex | Uso |
|---|---|---|
| `--success` | `#10B981` | Taxa boa, CPL verde, lead atendido rápido |
| `--warning` | `#F59E0B` | Monitorar, CPL amarelo |
| `--danger` | `#EF4444` | CPL ruim, lead atrasado, criativo saturado |

### `src/theme.ts`

```typescript
export const colors = {
  black:       '#0A0A0A',
  navy:        '#0D1B2A',
  navyLight:   '#1C2636',
  bgCard:      '#141414',
  gold:        '#C8A84E',
  goldLight:   '#D4B96A',
  goldDark:    '#A8883A',
  white:       '#FFFFFF',
  gray200:     '#E0E0E0',
  gray300:     '#BDBDBD',
  gray500:     '#666666',
  success:     '#10B981',
  warning:     '#F59E0B',
  danger:      '#EF4444',
} as const;

export const fonts = {
  body: '"Poppins", system-ui, sans-serif',
  display: '"Playfair Display", Georgia, serif',
} as const;
```

### `tailwind.config.js`

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#0A0A0A',
        navy: { DEFAULT: '#0D1B2A', light: '#1C2636' },
        gold: { DEFAULT: '#C8A84E', light: '#D4B96A', dark: '#A8883A' },
        bgCard: '#141414',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
}
```

---

## 🔤 Tipografia

### Fontes (apenas estas duas)

- **Poppins** — corpo, títulos sans-serif, UI, labels, tabelas
  - Pesos: 300, 400, 500, 600, 700, 800, 900
- **Playfair Display** — números grandes do Hero, quotes, italics editoriais, destaques
  - Pesos: 400, 700, 800, 900 + italic

### Import obrigatório no `index.html`

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&display=swap" rel="stylesheet">
```

### Hierarquia

| Elemento | Fonte | Peso | Tamanho |
|---|---|---|---|
| Stat number (Hero) | Playfair Display | 700-800 | 4xl–6xl |
| Quote editorial | Playfair Display italic | 700 | xl–2xl |
| H1 (sections) | Poppins | 700 | 2xl–3xl |
| H2 (subsections) | Poppins | 600 | xl |
| H3 (cards) | Poppins | 600 | base–lg |
| Body | Poppins | 400 | sm–base |
| Label/caption | Poppins | 500 | xs |
| Section tag | Poppins | 500 uppercase tracking-widest | xs |

### Proibições

❌ **NUNCA usar**: Arial, Roboto, Inter, Helvetica, Bebas Neue, Cormorant, ou qualquer fonte fora desse par Poppins + Playfair Display.

---

## 🧩 Componentes assinatura

### Card padrão
```jsx
<div className="bg-bgCard border border-gold/20 rounded-lg p-6">
  {/* conteúdo */}
</div>
```

### Section tag (rótulo de seção)
```jsx
<span className="text-xs uppercase tracking-[0.2em] text-gold font-medium">
  HERO DO DIA
</span>
```

### Stat number (números grandes do Hero)
```jsx
<div className="font-display font-bold text-5xl text-gold"
     style={{ filter: 'drop-shadow(0 0 20px rgba(200,168,78,0.2))' }}>
  R$ 12.450
</div>
```

### Pill badge
```jsx
<span className="inline-flex items-center rounded-full border border-gold/40 px-3 py-1 text-xs uppercase tracking-wider text-gold">
  ATIVO
</span>
```

### Header do dashboard
- Logo Escala em 56px de altura com drop-shadow:
  ```css
  filter: drop-shadow(0 0 40px rgba(200,168,78,0.2)) drop-shadow(0 4px 20px rgba(0,0,0,0.5));
  ```
- À direita: "REVERT ENERGIA SOLAR" em uppercase + tracking-widest + text-gold
- Botão de logout discreto no canto direito
- Última atualização do cache em text-gray-500 text-xs

### Footer obrigatório
```jsx
<footer className="border-t border-gold/10 bg-navy py-6 mt-12">
  <div className="container mx-auto flex justify-between items-center text-xs">
    <div className="text-gray-500">
      escalanegociosdigitais.com.br
    </div>
    <div className="font-display italic text-gold">
      Performance não é sorte. É método.
    </div>
    <div className="text-gray-500 uppercase tracking-widest">
      Cascavel · Toledo · Florianópolis
    </div>
  </div>
  <div className="container mx-auto mt-2 text-center text-xs text-gray-500">
    CNPJ 48.215.104/0001-40
  </div>
</footer>
```

---

## 📝 Frases oficiais (usar quando couber)

| Frase | Onde usar |
|---|---|
| **Performance não é sorte. É método.** | Footer (centro) — tagline principal |
| Systems over ego. Process over hype. Results over excuses. | Footer secundário (opcional) |
| Cascavel · Toledo · Florianópolis | Footer (direita) |

---

## 🚫 Regras invioláveis

1. **NUNCA** usar "agência" — sempre "assessoria de performance"
2. **NUNCA** distorcer a logo (manter proporção, fundo transparente)
3. **NUNCA** usar fontes diferentes de Poppins + Playfair Display
4. **NUNCA** usar cores fora da paleta acima (incluindo azul padrão de dashboard)
5. **NUNCA** texto em PT-BR sem acentuação correta
6. **CNPJ oficial**: `48.215.104/0001-40` — sempre exato
7. **Sem emojis** em peças oficiais (UI do dashboard)
8. **Sem termos de fraqueza**: "tentamos", "esperamos", "acreditamos" — usar afirmações diretas

---

## 🌅 Logo

- **Arquivo oficial**: `public/escala-logo.png` (PNG RGBA, fundo transparente)
- **Fallback** (se não tiver localmente): `https://escalanegociosdigitais.com.br/logo.png`
- **Tamanhos recomendados**:
  - Header dashboard: 56px de altura
  - Login page: 120px de altura
  - Footer: 40-48px (se aparecer)
- **NUNCA** com container/fundo colorido — sempre transparente
- **NUNCA** recortar, recolorir, distorcer ou aplicar filtros que alterem a cor

---

## 🎯 Aplicação por bloco

### Bloco A — Hero do Dia
- 4 cards em linha (desktop) / 2x2 (tablet) / stack (mobile)
- Stat number em Playfair Display, dourado
- Delta badge usando cor semafórica
- Section tag "HERO DO DIA" no topo

### Bloco B — Funil ao Vivo
- 5 stages decrescentes
- Cada stage tem stat number Playfair + label Poppins
- Taxa de conversão entre stages com cor semafórica
- Section tag "FUNIL DE CONVERSÃO"

### Bloco C — Performance por Campanha
- Tabela densa
- Header em navy `#0D1B2A` com texto dourado
- Linhas alternadas (zebra) `#141414` / `#1A1A1A`
- Métricas críticas com cor semafórica
- Linha totalizadora no rodapé

### Bloco D — Velocidade Comercial
- Distribuição em barras horizontais com 5 buckets coloridos
- Tempo médio em 3 valores grandes (hoje/7d/30d) em Playfair
- Hall da Vergonha: lista com nome mascarado + telefone mascarado + tempo aguardando em vermelho

### Bloco E — Mix de Produto
- Cards de produto com mini-pizza Recharts
- Cada card com 3 stats grandes em Playfair

### Bloco F — Saturação Criativa
- Tabela com sparklines
- Recomendação em pill badge colorida (verde/amarelo/vermelho)

---

## ✅ Checklist de validação visual

Antes de marcar qualquer story como DONE, validar:

- [ ] Logo correta, sem distorção
- [ ] Cores apenas da paleta oficial
- [ ] Apenas Poppins + Playfair Display
- [ ] Frase tagline no footer
- [ ] CNPJ no footer
- [ ] Cidades no footer
- [ ] Sem emojis na UI
- [ ] Tom direto, sem termos de fraqueza
- [ ] Acentuação PT-BR correta
- [ ] Section tags em uppercase + tracking-widest
- [ ] Cards com borda dourada sutil (`gold/20`)
- [ ] Stat numbers em Playfair Display dourado

---

*Brand System v1.0 — derivado do `escala-brand-system` oficial da Escala Negócios Digitais*
