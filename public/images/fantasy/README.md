# Fantasy Assets — Especificação

Esta pasta prepara a identidade ilustrada **Medieval Light Fantasy**.
As imagens reais ainda serão produzidas; o código já está pronto para recebê-las com `object-fit: cover`, `aspect-ratio` e fallback elegante em gradiente.

## Convenções
- Formato preferencial: **WebP** (com fallback PNG se necessário)
- Nomes em **inglês**, `kebab-case`
- `loading="lazy"` em tudo exceto hero (eager)
- Transparência apenas em ícones

---

## 1. Hero — janela para o mundo
**Arquivo esperado**
```
public/images/fantasy/hero/journey-landscape.webp
```

**Descrição**
Grande árvore lateral, campo verde, flores, rio/riacho, vila medieval pequena, montanhas ao fundo, castelo distante, céu azul com nuvens volumosas, luz de fim de tarde. Sensação: “janela para o mundo da jornada”.

**Dimensão / proporção**
- Desktop: **1600×560** (~ 21:7 ou 16:5, máx 1800×600)
- Mobile: corte inteligente centralizado (safe area 60% centro)
- `aspect-ratio: 21/7` no CSS, `object-fit: cover`, `object-position: 50% 38%`
- Tamanho alvo < 180KB (WebP 78-82)

**Uso**
`index.html` → `.hero-scenic > img.hero-image` (eager, maior prioridade)

---

## 2. Níveis — Vila → Cidade → Reino
Cada card ilustrado ocupa 40–50% do topo do card.

| Nível | Arquivo esperado | Dimensão | Proporção | Conceito |
|-------|------------------|----------|-----------|----------|
| I Iniciante | `public/images/fantasy/levels/beginner-village.webp` | 640×400 | 8:5 (ou 16:10) | Pequena vila, estrada, floresta, riacho, amanhecer. Começo da aventura. |
| II Intermediário | `public/images/fantasy/levels/intermediate-city.webp` | 640×400 | 8:5 | Cidade medieval maior, guilda, pontes/torres, natureza integrada. Pertencimento. |
| III Avançado | `public/images/fantasy/levels/advanced-kingdom.webp` | 640×400 | 8:5 | Reino monumental, castelo, montanhas, cachoeiras, jardins. Sabedoria. |

Tamanho alvo < 90KB cada. `loading="lazy"`, `aspect-ratio: 8/5`.

---

## 3. Missões Principais — banners
Banner horizontal pequeno no topo de cada **Missão Principal**.

| Arquivo esperado | Dimensão | Proporção | Conceito |
|------------------|----------|-----------|----------|
| `public/images/fantasy/quests/level-1-main.webp` | 800×300 | 8:3 | Guilda / oficina acolhedora, mapa, ferramentas. Quest importante mas terrena. |
| `public/images/fantasy/quests/level-2-main.webp` | 800×300 | 8:3 | Fortaleza/biblioteca, luz de vitral, engenharia. |
| `public/images/fantasy/quests/level-3-main.webp` | 800×300 | 8:3 | Cidade fantástica / castelo majestoso, arquitetura e luz dourada. |

Tamanho alvo < 80KB cada. `loading="lazy"`, `aspect-ratio: 8/3`.

---

## 4. Ícones — família fantasy clean
Substituem emojis atuais (🌱 ⚔️ 👑 📜 ⚡ ⏳ 🌐 etc.) quando existirem.

```
public/images/fantasy/icons/
  icon-village.svg        (N1)
  icon-city.svg           (N2)
  icon-kingdom.svg        (N3)
  icon-scroll.svg
  icon-shield.svg
  icon-sword.svg
  icon-map.svg
  icon-star.svg
  icon-crystal.svg
  icon-leaf.svg
  icon-crown.svg
  icon-rune.svg
```

Requisitos: SVG ou WebP transparente, **24–32px** base, stroke 1.5px, cor via `currentColor` (herda bronze/ink), estilo **fantasy clean** — elegante, sem infantilização, sem outline pesado.

**Fallback**: enquanto o arquivo não existir, o CSS/JS mantém emoji + gradiente elegante. `onerror` esconde `<img>` e mostra fallback.

---

## Fallback
- Toda imagem tem `.fallback` em gradiente (pergaminho + acento do nível) preservando `aspect-ratio`
- Nunca volta para montanhas geométricas CSS
- Nunca quebra layout

## Integração
- Bordas `14–18px`, sombra `var(--shadow-soft)`, fade suave `linear-gradient(to bottom, transparent 68%, var(--color-parchment-3) 100%)`
- Overlay máximo `rgba(46,39,30,.06)` quando sobre texto
- `object-fit: cover`, nunca `contain` para ilustrações

---

## Status atual
- [ ] `hero/journey-landscape.webp`
- [ ] `levels/beginner-village.webp`
- [ ] `levels/intermediate-city.webp`
- [ ] `levels/advanced-kingdom.webp`
- [ ] `quests/level-1-main.webp`
- [ ] `quests/level-2-main.webp`
- [ ] `quests/level-3-main.webp`
- [ ] `icons/*.svg` (família)

Enquanto pendentes, a UI exibe gradientes temáticos sem perda de layout.
