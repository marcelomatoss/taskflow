# TaskFlow - Project & Task Manager

Full-stack MVP de gerenciamento de projetos e tarefas, construído com Next.js, NestJS, PostgreSQL e Prisma.

## Deploy

| Serviço | URL |
|---------|-----|
| Frontend | https://frontend-wheat-nine-f2f3cx457c.vercel.app |
| Backend API | https://backend-production-9d35.up.railway.app |
| Swagger | https://backend-production-9d35.up.railway.app/api/docs |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Backend | NestJS 11 |
| Banco de Dados | PostgreSQL 16 |
| ORM | Prisma 7 |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS 4 |
| Containerização | Docker Compose |

## Funcionalidades

- **Autenticação** — Registro e login com JWT (7 dias de expiração)
- **Projetos** — CRUD completo com cores personalizáveis
- **Tarefas** — CRUD com status (TODO, IN_PROGRESS, DONE), prioridade (LOW, MEDIUM, HIGH) e data de entrega
- **Board Kanban** — Visualização de tarefas em colunas por status
- **Dark Mode** — Alternância entre tema claro e escuro
- **Internacionalização (i18n)** — Suporte a PT-BR e inglês com toggle de idioma
- **Cache** — Cache in-memory no backend com invalidação automática (30s TTL)
- **Logging Estruturado** — Logs JSON com método, URL, status, duração, userId e IP
- **Responsivo** — Interface adaptável para mobile e desktop
- **Swagger** — Documentação da API em `/api/docs`
- **Seed de dados** — Dados pré-populados para facilitar avaliação

## Como rodar localmente

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose
- npm

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USUARIO/taskflow.git
cd taskflow
```

### 2. Subir o banco de dados

```bash
docker compose up -d
```

### 3. Configurar o backend

```bash
cd backend
npm install
cp .env.example .env    # ou crie o .env manualmente
```

Crie o arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://taskflow:taskflow123@localhost:5432/taskflow?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
FRONTEND_URL="http://localhost:3000"
PORT=3001
```

```bash
npx prisma migrate dev     # Cria as tabelas
npx prisma db seed          # Popula com dados de exemplo
npm run start:dev           # Inicia em http://localhost:3001
```

### 4. Configurar o frontend

```bash
cd frontend
npm install
```

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
npm run dev                 # Inicia em http://localhost:3000
```

### 5. Acessar a aplicação

- **App**: http://localhost:3000
- **Swagger**: http://localhost:3001/api/docs

**Usuários do seed** (para teste):

| Email | Senha |
|-------|-------|
| joao.silva@example.com | password123 |
| maria.santos@example.com | password123 |

## Decisões Técnicas e Arquiteturais

### Arquitetura

- **Monorepo com dois projetos separados** (backend/ e frontend/) — permite deploy independente de cada camada, sem a complexidade de workspaces npm para um MVP
- **App Router (Next.js)** — Route groups `(auth)` e `(dashboard)` para separar layouts público e protegido
- **Módulos NestJS** — Cada entidade (auth, projects, tasks) é um módulo isolado com controller, service e DTOs próprios
- **Prisma como global module** — Um único PrismaService compartilhado via `@Global()` evita imports repetitivos

### Autenticação

- **JWT com Bearer token** — Sem estado no servidor (stateless), ideal para APIs REST
- **localStorage** — Escolha pragmática para MVP. Em produção, httpOnly cookies seriam mais seguros
- **bcrypt com 10 salt rounds** — Padrão de mercado para hash de senhas
- **Token de 7 dias** — Balanceia UX (não precisa re-logar constantemente) e segurança

### Frontend

- **Tailwind CSS 4** — Nova versão com `@theme inline` e `@custom-variant`, sem necessidade de arquivo de configuração JS
- **react-hook-form + zod** — Validação type-safe com performance (sem re-renders desnecessários)
- **next-themes** — Solução leve e madura para dark mode com SSR
- **lucide-react** — Ícones tree-shakeable (só inclui os que são usados no bundle)
- **Client-side auth** — AuthProvider valida o token no mount e redireciona se inválido

### Qualidade de código

- **Husky + lint-staged** — Git hooks que rodam Prettier automaticamente antes de cada commit
- **commitlint** — Enforça Conventional Commits (feat:, fix:, chore:, etc.)
- **ESLint** — Configurado em ambos os projetos com regras do NestJS e Next.js
- **Prettier** — Formatação consistente com configuração compartilhada na raiz
- **CI pipeline** — GitHub Actions roda build, testes e lint em cada push/PR

## Dependências — Justificativas

### Backend (produção)

| Pacote | Justificativa |
|--------|--------------|
| `@nestjs/core`, `common`, `platform-express` | Framework NestJS — estrutura modular, injeção de dependência, decorator-based |
| `@nestjs/swagger` | Geração automática de documentação OpenAPI a partir dos DTOs e decorators |
| `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt` | Stack padrão de autenticação JWT no NestJS — integração nativa com guards |
| `@prisma/client`, `@prisma/adapter-pg`, `pg` | ORM type-safe com geração de tipos a partir do schema. Adapter pg necessário no Prisma 7 |
| `class-validator`, `class-transformer` | Validação declarativa de DTOs via decorators — integração nativa com NestJS pipes |
| `bcrypt` | Hash de senhas com salt — padrão da indústria, implementação em C (performática) |
| `@nestjs/cache-manager`, `cache-manager` | Cache in-memory para respostas de listagem, com invalidação automática em CUD |
| `tsx` | Executa `prisma.config.ts` em produção — necessário para o Prisma 7 |
| `reflect-metadata` | Necessário para o sistema de decorators do NestJS |
| `rxjs` | Dependência core do NestJS para programação reativa |

### Backend (desenvolvimento)

| Pacote | Justificativa |
|--------|--------------|
| `prisma` | CLI do Prisma para migrations, seed e geração de client |
| `jest`, `ts-jest` | Framework de testes padrão do NestJS |
| `@nestjs/testing` | Utilitários para testes unitários com DI do NestJS |
| `eslint`, `prettier` | Linting e formatação de código |
| `typescript`, `ts-node` | Compilação TypeScript e execução direta (seed) |
| `@types/*` | Tipagens TypeScript para bcrypt, express, jest, passport-jwt, node |

### Frontend (produção)

| Pacote | Justificativa |
|--------|--------------|
| `next`, `react`, `react-dom` | Framework e library de UI — requisito do teste |
| `react-hook-form` | Gerenciamento de formulários performático (sem re-renders a cada keystroke) |
| `@hookform/resolvers`, `zod` | Validação type-safe integrada ao react-hook-form. Zod infere tipos do schema |
| `lucide-react` | Biblioteca de ícones SVG tree-shakeable — bundle final inclui só os ícones usados |
| `next-themes` | Gerenciamento de tema (dark/light) com suporte a SSR e system preference |
| `clsx` | Utilitário para classes CSS condicionais — micro-dependência (< 1KB) |

### Frontend (desenvolvimento)

| Pacote | Justificativa |
|--------|--------------|
| `tailwindcss`, `@tailwindcss/postcss` | Framework CSS utility-first — Tailwind CSS 4 com nova engine |
| `eslint`, `eslint-config-next` | Linting com regras específicas do Next.js (acessibilidade, imports) |
| `typescript`, `@types/*` | Tipagens TypeScript para Node, React, React DOM |

### Raiz (desenvolvimento)

| Pacote | Justificativa |
|--------|--------------|
| `husky` | Git hooks — executa lint-staged no pre-commit e commitlint no commit-msg |
| `lint-staged` | Roda Prettier apenas nos arquivos staged (performance) |
| `@commitlint/cli`, `@commitlint/config-conventional` | Enforce Conventional Commits no histórico git |
| `prettier` | Formatação de código consistente entre backend e frontend |

## Estrutura do projeto

```
taskflow/
├── .github/workflows/ci.yml   # Pipeline CI (build, test, lint)
├── .husky/                     # Git hooks (pre-commit, commit-msg)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelos do banco
│   │   └── seed.ts             # Dados de exemplo
│   └── src/
│       ├── auth/               # Autenticação JWT
│       ├── projects/           # CRUD de projetos
│       ├── tasks/              # CRUD de tarefas
│       ├── common/             # Interceptors (logging) e filters (exceptions)
│       ├── prisma/             # PrismaService global
│       └── main.ts             # Bootstrap + Swagger
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/         # Páginas de login/registro
│       │   └── (dashboard)/    # Páginas protegidas
│       ├── components/         # Componentes reutilizáveis
│       ├── contexts/           # AuthContext
│       ├── hooks/              # Custom hooks
│       ├── lib/                # API client, i18n
│       └── types/              # TypeScript interfaces
├── docker-compose.yml          # PostgreSQL
└── README.md
```

## Diferenciais implementados

- [x] Containerização (Docker Compose para PostgreSQL)
- [x] Testes automatizados (unitários no backend com Jest)
- [x] Pipeline de CI/CD (GitHub Actions)
- [x] Validação de dados no frontend (zod) e backend (class-validator)
- [x] Seed de dados para facilitar avaliação
- [x] Dark mode com suporte a preferência do sistema
- [x] Internacionalização (i18n) — PT-BR e inglês com toggle de idioma
- [x] Cache in-memory (@nestjs/cache-manager com invalidação automática)
- [x] Logging estruturado (JSON logs com interceptor global + exception filter)
- [x] Swagger em /api/docs

## Scripts úteis

```bash
# Backend
cd backend
npm run start:dev       # Dev server com hot reload
npm run test            # Rodar testes
npm run test:cov        # Testes com cobertura
npx prisma studio       # Interface visual do banco

# Frontend
cd frontend
npm run dev             # Dev server
npm run build           # Build de produção
npm run lint            # Verificar linting
```
