// Dados iniciais da trilha — edite livremente
// Cada bloco tem: id, icon, titulo, descricao, topicos[], criterios[]
const TRILHA_DATA = [
  {
    id: "fundamentos",
    icon: "📜",
    title: "Fundamentos de Programação",
    desc: "Lógica, variáveis, condicionais e laços. A base de todo aventureiro.",
    topics: [
      { id: "f1", label: "Variáveis, tipos e operadores" },
      { id: "f2", label: "Condicionais (if/else, switch)" },
      { id: "f3", label: "Laços (for, while) e iteração" },
      { id: "f4", label: "Funções, escopo e parâmetros" },
      { id: "f5", label: "Arrays e objetos básicos" },
      { id: "f6", label: "Algoritmos simples e debugging" },
    ],
    criteria: [
      { id: "fc1", label: "Resolver 10 exercícios de lógica sem consultar resposta" },
      { id: "fc2", label: "Explicar com suas palavras cada estrutura básica" },
    ]
  },
  {
    id: "js-essencial",
    icon: "⚡",
    title: "JavaScript Essencial",
    desc: "O idioma da web. Domine o JS moderno além da sintaxe.",
    topics: [
      { id: "j1", label: "let/const, desestruturação e spread" },
      { id: "j2", label: "Arrow functions e template literals" },
      { id: "j3", label: "Métodos de array (map, filter, reduce, find)" },
      { id: "j4", label: "Objetos, JSON e cópia rasa/profunda" },
      { id: "j5", label: "Módulos (import/export) e escopo" },
      { id: "j6", label: "Manipulação de DOM básica" },
    ],
    criteria: [
      { id: "jc1", label: "Reescrever 3 exercícios usando métodos funcionais" },
      { id: "jc2", label: "Criar mini-projeto JS sem framework (ex: todo list)" },
    ]
  },
  {
    id: "assincronismo",
    icon: "⏳",
    title: "Assincronismo",
    desc: "O tempo no JavaScript: callbacks, promises e o fluxo do event loop.",
    topics: [
      { id: "a1", label: "Callbacks e callback hell" },
      { id: "a2", label: "Promises (then/catch/finally)" },
      { id: "a3", label: "Async/await e try/catch" },
      { id: "a4", label: "Event Loop, microtasks e setTimeout" },
      { id: "a5", label: "Promise.all / allSettled / race" },
    ],
    criteria: [
      { id: "ac1", label: "Consumir uma API pública com async/await" },
      { id: "ac2", label: "Tratar erros e estados de loading corretamente" },
    ]
  },
  {
    id: "web-http",
    icon: "🌐",
    title: "Web e HTTP",
    desc: "Como a web realmente funciona: requisições, respostas e bastidores.",
    topics: [
      { id: "w1", label: "HTTP: verbos, status codes e headers" },
      { id: "w2", label: "Request/Response e URL/Query params" },
      { id: "w3", label: "REST: recursos, rotas e boas práticas" },
      { id: "w4", label: "Fetch API e JSON" },
      { id: "w5", label: "CORS, cookies e autenticação básica" },
    ],
    criteria: [
      { id: "wc1", label: "Inspecionar requisições no DevTools e explicar cada parte" },
      { id: "wc2", label: "Criar requisições GET/POST/PUT/DELETE para uma API fake" },
    ]
  },
  {
    id: "node-sem-framework",
    icon: "🟢",
    title: "Node.js sem Framework",
    desc: "Node cru: entenda o que os frameworks abstraem.",
    topics: [
      { id: "n1", label: "Node, npm e módulo http nativo" },
      { id: "n2", label: "Criar servidor HTTP na mão (rotas e handlers)" },
      { id: "n3", label: "File System (fs) e streams" },
      { id: "n4", label: "Variáveis de ambiente e .env" },
      { id: "n5", label: "Nodemon, scripts npm e organização" },
    ],
    criteria: [
      { id: "nc1", label: "Servidor com 3 rotas funcionando sem Express" },
      { id: "nc2", label: "Ler/escrever arquivos e servir JSON estático" },
    ]
  },
  {
    id: "banco-sql",
    icon: "🗄️",
    title: "Banco de Dados e SQL",
    desc: "Onde os dados descansam. Modele, consulte e proteja.",
    topics: [
      { id: "b1", label: "Modelo relacional e tipos de dados" },
      { id: "b2", label: "SELECT, WHERE, ORDER BY, LIMIT" },
      { id: "b3", label: "JOINs, GROUP BY e agregações" },
      { id: "b4", label: "INSERT/UPDATE/DELETE e transactions" },
      { id: "b5", label: "Índices, chaves e normalização" },
      { id: "b6", label: "SQLite/Postgres na prática com Node" },
    ],
    criteria: [
      { id: "bc1", label: "Modelar 2 tabelas com relacionamento e popular" },
      { id: "bc2", label: "Escrever 5 queries com JOIN e filtros complexos" },
    ]
  },
  {
    id: "backend-framework",
    icon: "🏰",
    title: "Backend com Framework",
    desc: "Erga as muralhas: Express/Fastify, rotas e camadas.",
    topics: [
      { id: "bf1", label: "Express ou Fastify: setup e middlewares" },
      { id: "bf2", label: "Roteamento, controllers e services" },
      { id: "bf3", label: "Validação (Zod/Joi) e tratamento de erros" },
      { id: "bf4", label: "Conexão com DB e queries parametrizadas" },
      { id: "bf5", label: "Autenticação JWT e rotas protegidas" },
      { id: "bf6", label: "Estrutura em camadas e boas práticas" },
    ],
    criteria: [
      { id: "bfc1", label: "CRUD completo com validação e status codes corretos" },
      { id: "bfc2", label: "Middleware de auth protegendo rotas privadas" },
    ]
  },
  {
    id: "typescript",
    icon: "🔷",
    title: "TypeScript",
    desc: "Armadura para seu código: tipos que protegem sua jornada.",
    topics: [
      { id: "t1", label: "Tipagem básica, interfaces e types" },
      { id: "t2", label: "Generics e utility types" },
      { id: "t3", label: "Tipagem de funções e promises" },
      { id: "t4", label: "TS no Node e no frontend" },
      { id: "t5", label: "ESLint + TSConfig e strict mode" },
    ],
    criteria: [
      { id: "tc1", label: "Migrar um projeto JS para TS sem usar 'any'" },
      { id: "tc2", label: "Criar tipos para requests/responses da API" },
    ]
  },
  {
    id: "frontend-sem-framework",
    icon: "🎨",
    title: "Frontend sem Framework",
    desc: "HTML, CSS e JS puros: a forja onde se tempera o aço.",
    topics: [
      { id: "ff1", label: "HTML semântico e acessibilidade" },
      { id: "ff2", label: "CSS moderno: Flex, Grid e responsivo" },
      { id: "ff3", label: "JS no browser: eventos e DOM" },
      { id: "ff4", label: "Formulários, validação e feedback" },
      { id: "ff5", label: "Fetch no frontend e renderização" },
    ],
    criteria: [
      { id: "ffc1", label: "Página responsiva consumindo sua própria API" },
      { id: "ffc2", label: "Form com validação e estados visuais" },
    ]
  },
  {
    id: "react",
    icon: "⚛️",
    title: "React",
    desc: "Componentes, estado e o ecossistema reativo.",
    topics: [
      { id: "r1", label: "Componentes, props e JSX" },
      { id: "r2", label: "useState, useEffect e ciclo de vida" },
      { id: "r3", label: "Listas, keys e renderização condicional" },
      { id: "r4", label: "React Router e navegação" },
      { id: "r5", label: "Context API / estado global simples" },
      { id: "r6", label: "Vite, build e deploy" },
    ],
    criteria: [
      { id: "rc1", label: "SPA com 3 rotas e consumo de API" },
      { id: "rc2", label: "Gerenciar estado sem prop drilling excessivo" },
    ]
  },
  {
    id: "docker-infra",
    icon: "🐳",
    title: "Docker e Infra",
    desc: "Embarque sua aplicação: containers e ambiente reproduzível.",
    topics: [
      { id: "d1", label: "Docker: imagens, containers e Dockerfile" },
      { id: "d2", label: "Docker Compose (app + db)" },
      { id: "d3", label: "Volumes, networks e variáveis" },
      { id: "d4", label: "Build otimizado e .dockerignore" },
    ],
    criteria: [
      { id: "dc1", label: "Subir app + banco com docker-compose up" },
      { id: "dc2", label: "Dockerfile multi-stage funcionando" },
    ]
  },
  {
    id: "git-testes-deploy",
    icon: "🚀",
    title: "Git, Testes e Deploy",
    desc: "O caminho até a produção: versionamento, testes e entrega.",
    topics: [
      { id: "g1", label: "Git: branches, merge, rebase e PRs" },
      { id: "g2", label: "Testes unitários (Vitest/Jest)" },
      { id: "g3", label: "Testes de integração / E2E básicos" },
      { id: "g4", label: "CI simples (GitHub Actions)" },
      { id: "g5", label: "Deploy (Vercel/Render/Fly) e env vars" },
    ],
    criteria: [
      { id: "gc1", label: "Repositório com histórico limpo e README" },
      { id: "gc2", label: "Pipeline que roda testes a cada push" },
    ]
  },
  {
    id: "evolucao-intermediaria",
    icon: "👑",
    title: "Evolução Intermediária",
    desc: "Além do básico: aprofunde e torne-se mestre.",
    topics: [
      { id: "e1", label: "Padrões: repository, service, factory" },
      { id: "e2", label: "Performance e paginação" },
      { id: "e3", label: "Segurança (hash, sanitização, rate limit)" },
      { id: "e4", label: "WebSockets / tempo real (básico)" },
      { id: "e5", label: "Projeto full stack completo do zero" },
    ],
    criteria: [
      { id: "ec1", label: "Refatorar projeto aplicando um padrão" },
      { id: "ec2", label: "Entregar projeto final documentado e no ar" },
    ]
  },
];

const LEVEL_CONFIG = [
  { min: 0,  title: "Aprendiz",   icon: "🌱", quote: "Toda lenda começa com um primeiro passo." },
  { min: 15, title: "Escudeiro",  icon: "🛡️", quote: "O escudo pesa, mas você já sabe carregá-lo." },
  { min: 35, title: "Aventureiro",icon: "🗺️", quote: "O mapa se abre — a estrada chama por você." },
  { min: 55, title: "Cavaleiro",  icon: "⚔️", quote: "Sua lâmina encontrou propósito. Avance!" },
  { min: 75, title: "Guardião",   icon: "🏹", quote: "Você guarda o conhecimento e guia outros." },
  { min: 90, title: "Mestre",     icon: "👑", quote: "Lenda viva da trilha. O reino o reconhece!" },
];

const BLOCK_QUOTES = {
  "fundamentos": "A base foi lançada. Nenhuma torre cai com alicerces fortes!",
  "js-essencial": "A lâmina de JavaScript agora obedece sua mão!",
  "assincronismo": "Você dobrou o tempo a seu favor. O fluxo é seu aliado!",
  "web-http": "Os correios do reino não têm segredos para você!",
  "node-sem-framework": "Você forjou um servidor com as próprias mãos!",
  "banco-sql": "Os arquivos do castelo estão em ordem. Dados sob seu comando!",
  "backend-framework": "Muralhas erguidas! Seu backend resiste ao cerco!",
  "typescript": "Armadura rúnica equipada. Nenhum tipo te escapa!",
  "frontend-sem-framework": "Você moldou a face do reino sem magia emprestada!",
  "react": "Componentes conjurados! A interface ganha vida!",
  "docker-infra": "Seu exército cabe em um container. Pronto para marchar!",
  "git-testes-deploy": "Estandarte fincado em produção. Sua lenda é pública!",
  "evolucao-intermediaria": "Ciclo completo. De aprendiz a mestre — honra máxima!",
};
