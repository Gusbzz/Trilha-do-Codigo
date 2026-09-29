# Jornada Full Stack — Diário de Jornada 🛡️

Aplicação web estática (HTML + CSS + JS puro) para acompanhar sua **Trilha Full Stack** em uma jornada **Medieval Light Fantasy** — vila próspera, guilda luminosa, rios, montanhas e castelos. Sem build, sem dependências, com persistência em `localStorage`.

## ✨ Visão geral

- **Hero panorâmico** (`journey-landscape.webp` 1600×560, `cover`, fade suave) + painel de boas-vindas sobreposto (`max-width:1020px`).
- **3 níveis ilustrados** — *Vila → Cidade → Reino* — com imagens próprias e progressão horizontal.
- **Background contínuo** (`world-background.webp`) atrás da área principal, com overlay moderado e superfícies translúcidas.
- **Projetos de Consolidação** lado a lado no desktop (`1:1` com altura equalizada via `stretch` + `flex:1`), empilhados no mobile.
- **Missões recolhidas por padrão**, critérios expansíveis, checkboxes custom bronze→esmeralda, barras e badges temáticos.

## 🗺️ Stack escolhida

**HTML + CSS + JavaScript puro** — site 100% estático. Qualquer hospedagem estática serve.

## 📁 Estrutura

```
/
├── index.html
├── css/style.css              # Tokens, layout amplo (page-max 1560), light fantasy
├── js/
│   ├── data.js                # JOURNEY_LEVELS, NIVEL_*_DATA, CONSOLIDATION_PROJECTS, HERO_ASSET
│   └── app.js                 # Checklists, progresso, projetos, localStorage, collapsed
└── public/images/fantasy/
    ├── hero/journey-landscape.webp
    ├── backgrounds/world-background.webp
    ├── levels/beginner-village.webp / intermediate-city.webp / advanced-kingdom.webp
    ├── quests/level-1-main.webp / level-1-challenge.webp / level-2-main.webp / level-3-main.webp
    ├── icons/.gitkeep         # família fantasy clean (SVG/WebP transparente)
    └── README.md              # especificação de assets, dimensões e fallback
```

## 🧭 Níveis e progressão

**Nível 1 — Iniciante** (*Aprendiz do Código*) → Nível 2 (*Cavaleiro da Engenharia*) → Nível 3 (*Arquiteto do Reino*).

- Progresso por bloco, por nível e geral (nível % = conteúdo + Missão Principal; Desafio não bloqueia).
- `Nível Concluído` exige conteúdo `100%` + Missão Principal `Concluído`.
- Seletor em estandartes ilustrados (`aspect 16/10`, `cover`, fallback em gradiente), linha de progressão com dots.

## ✅ Trilha e critérios

`js/data.js` — `JOURNEY_LEVELS` (com `image`/`iconAsset`), `NIVEL_1/2/3_DATA` (13 + 16 + 28 blocos), `CONSOLIDATION_PROJECTS` (obrigatório + desafio por nível), `HERO_ASSET`. Cada critério tem `id` único (persistido).

Exemplo de bloco:
```js
{ id:"fundamentos", icon:"📜", title:"Fundamentos", desc:"...", topics:[{id:"f1",label:"..."}], criteria:[{id:"fc1",label:"..."}] }
```

> IDs devem ser únicos — usados no `localStorage`.

## 🖼️ Imagens

- **Hero:** `public/images/fantasy/hero/journey-landscape.webp` — `1600×560`, `21/7`, `cover 50% 50%` (260px mobile).
- **Níveis:** `levels/*` — `640×400`, `16/10`, `cover`.
- **Quests:** `quests/*` — `800×300`, `16/6`, `cover` (principal e desafio com mesma estrutura; fallback gradiente por nível).
- **Background contínuo:** `backgrounds/world-background.webp` — `center top / cover no-repeat` atrás de `main.page` com `linear-gradient(rgba(248,241,220,0.55), rgba(248,241,220,0.60))` e `opacity:1` (`filter: saturate 0.96`), visível nos respiros. Superfícies leves (`Sua Jornada`, cabeçalho do nível, filtros) usam `rgba(255,255,255,0.78–0.92)` + `backdrop-filter: blur(6px)`; cards de missão permanecem opacos para legibilidade.

Ver `public/images/fantasy/README.md` para spec completa e fallbacks.

## 🚀 Como rodar localmente

Duplo clique em `index.html` **ou** servidor local (recomendado):

```bash
python -m http.server 8000
# http://localhost:8000
# ou
npx serve .
```

## 💾 Persistência e layout

- `localStorage` `trilha-rpg-v3` → `{ checks: {iniciante,intermediario,avancado}, projects: {mandatoryStatus, challengeStatus, mandatoryChecks, challengeChecks} }` + compat `trilha-rpg-v2/v1`.
- Layout amplo `page-max 1560 / content-max 1440` com `padding 48px` (32 notebook, 24 tablet, 16 mobile); hero, grids e projetos respiram horizontalmente.
- **Projetos lado a lado** `repeat(2, minmax(0,1fr))` com `align-items:stretch`, `height:100%`, `flex:1` no corpo e `margin-top:auto` no rodapé — mesma altura/largura (50/50) no desktop, `1fr` no mobile. Missões e projetos iniciam recolhidos (`_collapsed` / `projectCollapsed`).

## 🎮 Gamificação

- **XP:** 10 por tarefa
- **Títulos:** Aprendiz (0%) → Escudeiro (15%) → Aventureiro (35%) → Cavaleiro (55%) → Guardião (75%) → Mestre (90%)
- **Modal** ao concluir bloco + badges Pendente/Em progresso/Concluído

## 📦 Deploy

Site estático — Vercel (`vercel --prod`), Netlify (arraste a pasta), GitHub Pages (`main` → `/`), Cloudflare Pages. Nenhum build necessário. Teste local: `node -c js/data.js && node -c js/app.js`.

## 🔜 Próximos passos

- Datas de conclusão por bloco, export/import JSON, modo tocha.
