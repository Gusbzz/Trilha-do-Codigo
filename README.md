# Trilha do Código — Diário de Jornada 🛡️

Aplicação web simples (HTML + CSS + JS puro) para acompanhar sua trilha Full Stack com estética RPG medieval leve.

## Stack escolhida
**HTML + CSS + JavaScript puro** — sem build, sem dependências. Mais simples de manter e de colocar no ar (qualquer hospedagem estática).

## Estrutura de arquivos
```
/
├── index.html        # Página principal (estrutura + hero + grid)
├── css/
│   └── style.css     # Tema pergaminho/madeira/pedra, responsivo
├── js/
│   ├── data.js       # Dados da trilha (13 blocos) + config de níveis
│   └── app.js        # Lógica: checklist, progresso, localStorage, gamificação
└── opencode_ler.md   # (seu arquivo original)
```

## Como editar a trilha
Abra `js/data.js` e edite o array `TRILHA_DATA`. Cada bloco:

```js
{
  id: "meu-bloco",
  icon: "📜",
  title: "Título",
  desc: "Descrição curta",
  topics: [{ id: "unico1", label: "Tópico 1" }],
  criteria: [{ id: "unico2", label: "Critério 1" }]
}
```

> IDs devem ser únicos (usados para salvar no localStorage).

Níveis/títulos em `LEVEL_CONFIG` e frases de celebração em `BLOCK_QUOTES`.

## Como rodar localmente
Opção 1 — só abrir o arquivo:
```
duplo clique em index.html
```

Opção 2 — servidor local (recomendado, evita bloqueios de CORS em alguns navegadores):
```bash
# Python
python -m http.server 8000
# ou Node
npx serve .
```
Acesse `http://localhost:8000`

## Persistência
Todo progresso é salvo em `localStorage` na chave `trilha-rpg-v1`. Não precisa backend. Para zerar, use o botão “Reiniciar” no topo ou limpe o localStorage no DevTools.

## Gamificação
- **XP**: 10 por tarefa marcada
- **Níveis**: Aprendiz (0%) → Escudeiro (15%) → Aventureiro (35%) → Cavaleiro (55%) → Guardião (75%) → Mestre (90%)
- **Barra de progresso** geral + por bloco
- **Modal de celebração** ao concluir um bloco (com frase temática)
- **Badges**: Pendente / Em progresso / Concluído

## Deploy
É um site estático. Publique em:
- **Vercel**: `vercel --prod` ou arraste a pasta
- **Netlify**: arraste a pasta no dashboard
- **GitHub Pages**: push para `main` e ative Pages apontando para `/`
- **Cloudflare Pages**, etc.

Nenhum build necessário.

## Próximos passos sugeridos
- Adicionar datas de conclusão por bloco
- Exportar/importar progresso em JSON
- Modo escuro “tocha acesa”
