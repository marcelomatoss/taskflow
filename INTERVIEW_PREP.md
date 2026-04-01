# Guia de Preparação — Entrevista Técnica TaskFlow

## 1. ROTEIRO DA DEMO (~5 min)

### Fluxo sugerido para compartilhamento de tela:

1. **Abrir o Swagger** (`/api/docs`) — mostrar que a API está documentada
2. **Acessar o frontend** — mostrar landing page
3. **Fazer login** com `joao@example.com` / `password123`
4. **Dashboard** — mostrar grid de projetos, contagem de tarefas
5. **Entrar num projeto** — mostrar o board Kanban com 3 colunas
6. **Arrastar uma task** de TODO para IN_PROGRESS (drag and drop)
7. **Criar uma nova task** — mostrar o modal com validação
8. **Editar um projeto** — mostrar modal de edição com color picker
9. **Alternar dark mode** — clicar no toggle na navbar
10. **Mostrar responsividade** — redimensionar janela para mobile
11. **Voltar ao Swagger** — mostrar os endpoints de auth, projects, tasks

---

## 2. ARQUITETURA E ORGANIZAÇÃO

### Pergunta: "Explique a arquitetura do projeto"

**Resposta:**

"O projeto é um monorepo com dois projetos independentes — backend e frontend — que podem ser deployados separadamente.

**Backend (NestJS):** Organizei por módulos de feature — cada entidade (auth, projects, tasks) tem seu próprio módulo com controller, service e DTOs. O PrismaModule é global para evitar imports repetitivos. A autenticação usa JWT com Passport, e cada endpoint protegido verifica ownership — o usuário só acessa seus próprios dados.

**Frontend (Next.js App Router):** Usei route groups — `(auth)` para login/register e `(dashboard)` para as páginas protegidas. Cada grupo tem seu layout: o auth centraliza o conteúdo e redireciona se já logado, o dashboard tem navbar com proteção de rota via hook `useRequireAuth`. A comunicação com a API é feita por um client simples com fetch nativo.

**Por que essa separação?** Permite deploy independente — o frontend vai pro Vercel (otimizado para Next.js) e o backend vai pro Railway. Também facilita escalar cada parte independentemente."

### Pergunta: "Por que não usou monorepo com workspaces?"

"Para um MVP, workspaces adicionam complexidade sem benefício claro. Dois package.json independentes são mais simples de entender, deployar e debugar. Em um projeto maior eu usaria Turborepo ou Nx."

---

## 3. DECISÕES TÉCNICAS — PERGUNTAS PROVÁVEIS

### "Por que JWT e não sessão?"

"JWT é stateless — o servidor não precisa armazenar sessões. Isso simplifica o deploy (sem Redis para sessões) e facilita escalar horizontalmente. O token expira em 7 dias, equilibrando UX e segurança. Para produção real, eu moveria o token para httpOnly cookies para evitar XSS."

### "Por que localStorage e não cookies?"

"Escolha pragmática para o MVP — mais simples de implementar e debugar. O trade-off é que localStorage é vulnerável a XSS. Em produção eu usaria httpOnly cookies com SameSite=Strict, que são inacessíveis via JavaScript."

### "Por que bcrypt com 10 rounds?"

"10 rounds é o padrão da indústria — suficientemente lento para resistir a brute force (~100ms por hash) mas rápido o bastante para não impactar a UX. Acima de 12 começa a ficar perceptível no login."

### "Por que Prisma ao invés de TypeORM?"

"Prisma é obrigatório no teste, mas eu escolheria mesmo assim. O Prisma gera tipos TypeScript automaticamente a partir do schema — o TypeORM exige que você defina entities manualmente. O schema.prisma é declarativo e serve como documentação do banco. A desvantagem é que Prisma não suporta queries SQL complexas tão bem quanto TypeORM, mas para CRUD é superior."

### "Por que Tailwind CSS e não styled-components ou CSS Modules?"

"Tailwind é utility-first — escrevo o estilo direto no JSX sem criar arquivos CSS separados. Isso acelera muito o desenvolvimento e garante consistência (uso as mesmas classes do design system). O bundle final é menor porque o Tailwind faz tree-shaking das classes não usadas. A v4 é ainda melhor — configuração via CSS ao invés de JavaScript."

### "Por que react-hook-form + zod e não Formik?"

"react-hook-form é mais performático — usa refs ao invés de controlled inputs, então não re-renderiza o formulário inteiro a cada keystroke. Zod permite definir o schema de validação uma vez e inferir os tipos TypeScript automaticamente. Formik re-renderiza tudo e o Yup (validação dele) não tem inferência de tipos tão boa."

### "Por que lucide-react e não react-icons?"

"lucide-react é tree-shakeable — importo só os ícones que uso e o bundle final inclui apenas esses. O react-icons importa a biblioteca inteira ou exige configuração extra de tree-shaking. Lucide também tem design mais consistente e moderno."

### "Por que next-themes para dark mode?"

"Resolve dois problemas complexos automaticamente: 1) Flash of unstyled content (FOUC) na troca de tema com SSR, e 2) Respeitar preferência do sistema operacional. São menos de 2KB. Implementar do zero levaria tempo e provavelmente teria bugs de hydration."

### "Por que não usou uma lib de drag and drop?"

"Para o MVP, a API nativa de HTML5 Drag and Drop é suficiente — são ~40 linhas de código (dragStart, dragOver, dragLeave, drop, dragEnd). Adicionar @dnd-kit ou react-beautiful-dnd traria ~30KB+ para o bundle para algo que funciona bem nativo. Se precisasse de features avançadas como reordenação dentro da mesma coluna, aí sim usaria uma lib."

---

## 4. JUSTIFICATIVA DE DEPENDÊNCIAS

### Backend — Produção

| Pacote | Por que instalei | Alternativas consideradas |
|--------|-----------------|--------------------------|
| `@nestjs/core, common, platform-express` | Framework base — estrutura modular, DI, decorators | Express puro (menos estruturado), Fastify (menos ecosystem) |
| `@nestjs/swagger` | Gera docs OpenAPI automaticamente dos DTOs | Swagger manual (trabalhoso), sem docs (requisito do teste) |
| `@nestjs/jwt, @nestjs/passport, passport-jwt` | Stack padrão de auth JWT no NestJS | jose (mais leve, mas sem integração NestJS), Auth0 (overengineering p/ MVP) |
| `@prisma/client, @prisma/adapter-pg, pg` | ORM type-safe, obrigatório no teste | TypeORM (mais verboso), Drizzle (mais novo, menos docs) |
| `class-validator, class-transformer` | Validação declarativa de DTOs via decorators | zod (não integra nativamente com NestJS pipes) |
| `bcrypt` | Hash de senhas — implementação em C, performática | argon2 (mais seguro em teoria, mas bcrypt é padrão), scrypt |
| `tsx` | Executa prisma.config.ts em produção (Prisma 7 exige) | ts-node (mais pesado), compilar o config pra JS |
| `reflect-metadata` | Necessário para decorators do NestJS | Nenhuma — é requisito do framework |
| `rxjs` | Dependência core do NestJS | Nenhuma — é requisito do framework |

### Frontend — Produção

| Pacote | Por que instalei | Alternativas consideradas |
|--------|-----------------|--------------------------|
| `next, react, react-dom` | Framework obrigatório do teste | — |
| `react-hook-form` | Forms performáticos sem re-renders | Formik (re-renderiza tudo), forms nativos (sem validação) |
| `@hookform/resolvers, zod` | Validação type-safe integrada ao RHF | Yup (sem inferência de tipos), joi (pesado pro frontend) |
| `lucide-react` | Ícones SVG tree-shakeable | react-icons (bundle maior), heroicons (menos variedade) |
| `next-themes` | Dark mode com SSR sem FOUC | Implementação manual (bugs de hydration) |
| `clsx` | Classes CSS condicionais — 1KB | classnames (mesma coisa, um pouco maior), template literals (verboso) |

### Raiz — Dev

| Pacote | Por que instalei |
|--------|-----------------|
| `husky` | Git hooks — roda lint-staged no pre-commit |
| `lint-staged` | Roda Prettier só nos arquivos staged (rápido) |
| `@commitlint/cli + config-conventional` | Enforça Conventional Commits |
| `prettier` | Formatação consistente entre backend e frontend |

---

## 5. QUALIDADE DE CÓDIGO

### Pergunta: "Como garantiu qualidade no projeto?"

"Configurei um pipeline completo:

1. **Prettier** — formata o código automaticamente. Configuração compartilhada na raiz.
2. **ESLint** — regras específicas do NestJS no backend e do Next.js no frontend.
3. **Husky + lint-staged** — no pre-commit, roda Prettier nos arquivos staged. Se o código não estiver formatado, o commit falha.
4. **Commitlint** — no commit-msg, valida que a mensagem segue Conventional Commits (feat:, fix:, chore:, etc).
5. **GitHub Actions** — no push/PR para main, roda build + testes + lint em paralelo.
6. **TypeScript strict** — sem `any` desnecessário, null checks habilitados.
7. **class-validator no backend** — rejeita payloads com campos desconhecidos (whitelist + forbidNonWhitelisted).

Escolhi Conventional Commits porque geram changelogs automáticos e facilitam entender o histórico. Escolhi Prettier ao invés de só ESLint para formatação porque Prettier é opinativo — não há debate sobre estilo, ele decide."

---

## 6. DESIGN E UX

### Pergunta: "Como pensou a interface?"

"Foquei em 3 princípios:

1. **Estados visuais claros** — toda página tem skeleton loading, empty state, error state e success state. O usuário nunca fica sem feedback.

2. **Consistência** — defini um design system com variáveis CSS (cores, fontes) no globals.css. Todos os componentes usam as mesmas classes: `bg-background`, `text-foreground`, `bg-primary`, `border-border`. Isso garante consistência entre light e dark mode.

3. **Responsividade** — o grid de projetos vai de 1 coluna (mobile) para 2 (tablet) para 3 (desktop). O board Kanban empilha as colunas no mobile. A navbar tem menu hamburger no mobile.

O dark mode usa variáveis CSS que mudam com a classe `.dark` no HTML — o Tailwind 4 resolve tudo via `@theme inline` referenciando essas variáveis."

---

## 7. USO DE IA — TRANSPARÊNCIA

### Pergunta: "Como utilizou ferramentas de IA?"

**Resposta honesta e preparada:**

"Usei o Claude Code (CLI do Claude da Anthropic) durante todo o desenvolvimento. A IA foi uma ferramenta de produtividade, não um substituto.

**Onde a IA ajudou mais:**
- **Scaffolding inicial** — gerar a estrutura de módulos NestJS e as páginas Next.js seguindo os padrões que eu defini
- **DTOs e validações** — gerar os decorators do class-validator e schemas do Zod
- **Componentes repetitivos** — modais, formulários, cards com o mesmo padrão visual
- **Configuração de ferramentas** — Husky, commitlint, GitHub Actions, Docker

**Onde eu intervim manualmente:**
- **Arquitetura** — a decisão de módulos, separação de responsabilidades e organização de pastas foi minha
- **Debugging** — quando o token JWT não estava sendo salvo (o backend retornava `token` mas o frontend esperava `access_token`), eu identifiquei o mismatch
- **Dark mode** — o Tailwind CSS 4 mudou a forma de configurar temas, e a IA gerou código incompatível que tive que corrigir
- **Deploy** — a configuração do Railway com Prisma 7 exigiu várias iterações manuais (o prisma.config.ts, versão do Node, etc)
- **Drag and drop** — pedi para implementar mas defini a UX que queria (cursor grab, highlight da coluna, opacidade do card)

**Minha filosofia:** Eu defino O QUE construir e COMO organizar. A IA acelera o HOW. Se me perguntarem sobre qualquer trecho do código, consigo explicar porque fui eu quem tomou cada decisão arquitetural."

---

## 8. PERGUNTAS DIFÍCEIS — RESPOSTAS PREPARADAS

### "O que você faria diferente com mais tempo?"

1. **Paginação** — as listas de projetos e tarefas não têm paginação, com muitos dados ficaria lento
2. **Testes E2E** — só tenho unitários no backend, falta testar o fluxo completo
3. **Refresh token** — implementaria refresh token para não forçar re-login a cada 7 dias
4. **httpOnly cookies** — migraria o JWT de localStorage para cookies seguros
5. **WebSockets** — atualizações em tempo real no board Kanban
6. **Internacionalização** — o app está em PT-BR hardcoded, usaria i18next

### "Qual foi o maior desafio?"

"O deploy com Prisma 7. O Prisma 7 mudou fundamentalmente como funciona — removeu o `url` do schema.prisma e exige um `prisma.config.ts`. Isso conflitava com o Railway que não executa TypeScript em runtime por padrão. Precisei instalar o `tsx`, configurar corretamente o adapter pattern com `pg.Pool`, e usar `--url` flag no `prisma db push`. Foi um problema que a IA não resolveu sozinha — precisei entender o que mudou no Prisma 7 e debugar iterativamente."

### "Por que esse tema (task manager)?"

"Escolhi task manager porque demonstra bem as skills avaliadas: relacionamentos entre entidades (User → Project → Task), diferentes estados (enums de status e prioridade), e uma UI que vai além de um CRUD básico (board Kanban com drag and drop). Também é um domínio que todo dev entende, o que facilita a avaliação."

### "Como o projeto escala?"

"O backend é stateless (JWT, sem sessões) — pode rodar em múltiplas instâncias atrás de um load balancer. O Prisma suporta connection pooling via PgBouncer. Para o frontend, o Vercel já escala automaticamente. Os gargalos seriam: falta de paginação (resolvido fácil), falta de cache (adicionaria Redis), e as queries de listagem que poderiam ser otimizadas com índices compostos no Prisma."

---

## 9. CHECKLIST PRÉ-ENTREVISTA

- [ ] Backend rodando em produção (Railway)
- [ ] Frontend rodando em produção (Vercel)
- [ ] Swagger acessível em /api/docs
- [ ] Login funcional com usuários do seed
- [ ] Dark mode funcionando
- [ ] Drag and drop funcionando no board
- [ ] Testar no mobile (responsividade)
- [ ] Ter o código aberto no VS Code pronto para mostrar
- [ ] Ter o terminal pronto para rodar `npm test` se pedirem
