# dib.re

Sistema web para avaliação de atletas de pelada e geração automática de times equilibrados.

## Funcionalidades

- **Jogadores**: cadastro com estrelas (1–5) e atributos técnicos (passe, chute, defesa, energia, velocidade).
- **Peladas**: criar pelada, selecionar jogadores, definir número de times e executar sorteio equilibrado.
- **Estatísticas**: comparação entre times (médias) e perfil do jogador (atributos e total de participações).
- **Roles**: admin (criação, avaliação, sorteio) e viewer (apenas visualização). Apenas admin precisa de autenticação (Clerk).

## Stack

- **Monorepo**: `apps/frontend` (Vite + React 19 + TypeScript) e `apps/backend` (Express + TypeScript).
- **Node**: 24 recomendado (`.nvmrc`); engines permitem Node >= 22.
- **Backend**: Express, Prisma, MySQL, Clerk.
- **Frontend**: Vite, React Router, Tailwind CSS v4, Clerk.
- **Infra local**: Docker Compose (API + MySQL). Produção: Oracle Cloud + Coolify, banco via variáveis de ambiente.

## Pré-requisitos

- Node 24 (`nvm use` se usar nvm)
- pnpm 9
- Docker e Docker Compose (para rodar MySQL e API em container)
- Conta no [Clerk](https://clerk.com) para auth

## Setup rápido

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

**Backend** (`apps/backend/.env`):

```env
DATABASE_URL="mysql://dibre:dibre@localhost:3306/dibre"
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
FRONTEND_URL=http://localhost:5173
PORT=4000
```

**Frontend** (`apps/frontend/.env`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```

Em ambos os apps, **`.env.local`** é suportado e sobrescreve variáveis do `.env` (útil para valores locais que não entram no git). Backend: carrega `apps/backend/.env` e depois `apps/backend/.env.local`. Frontend: o Vite já carrega `.env` e `.env.local` em `apps/frontend/`. Comandos Prisma (`db:migrate`, `db:push`, `db:studio`) também usam `.env` e `.env.local`.

Use o mesmo `CLERK_PUBLISHABLE_KEY` no frontend e o `CLERK_SECRET_KEY` apenas no backend. No Clerk Dashboard, defina a role em **publicMetadata** (ex.: `{ "role": "admin" }`) para o usuário admin.

### 3. Banco de dados (local com Docker)

```bash
docker compose up -d mysql
pnpm run db:generate
pnpm run db:push
```

### 4. Rodar em desenvolvimento

Terminal 1 – API:

```bash
pnpm run dev:backend
```

Terminal 2 – Frontend:

```bash
pnpm run dev:frontend
```

- Frontend: http://localhost:5173  
- API: http://localhost:4000 (proxy em dev via Vite em `/api`)

### 5. Rodar tudo com Docker (local)

```bash
# Defina CLERK_SECRET_KEY e CLERK_PUBLISHABLE_KEY no .env na raiz ou em apps/backend
docker compose up --build
```

API em http://localhost:4000. Frontend continua em `pnpm run dev:frontend` apontando para a API (proxy ou `FRONTEND_URL`).

## Produção

- Deploy da API e do frontend em instância Oracle Cloud, orquestração via **Coolify**.
- **Banco**: local = MySQL no Docker; produção = MySQL (ex.: Oracle Cloud MySQL HeatWave) via `DATABASE_URL`, ou Oracle com wallet via `TNS_ADMIN`, `DB_USER`, `DB_PASSWORD`, `DB_CONNECTION_STRING` (ver [docs/DEPLOY.md](docs/DEPLOY.md)).
- Definir no Coolify: `DATABASE_URL` (MySQL), `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` e, se necessário, `FRONTEND_URL`. Para Oracle com wallet, montar o Persistent Storage no container e configurar as variáveis acima; ver **Deploy** em [docs/DEPLOY.md](docs/DEPLOY.md).

## Código e convenções

- **Entidades**: no código e no banco a entidade é `Game` (API em `/games`). Na interface do usuário o nome exibido é **pelada**.
- **Atributos dos jogadores**: em tipos, banco e API os nomes são em inglês (`pass`, `shot`, `defense`, `energy`, `speed`). Na UI são exibidos em português (Passe, Chute, Defesa, Energia, Velocidade).
- **Lint e formatação**: o projeto usa ESLint e Prettier **sem ponto e vírgula** (`.prettierrc`). Com a extensão [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) e `editor.formatOnSave: true` (já em `.vscode/settings.json`), ao salvar o arquivo é formatado conforme essas regras.

## Scripts úteis

| Comando            | Descrição                          |
|--------------------|------------------------------------|
| `pnpm dev`         | Sobe frontend e backend em paralelo |
| `pnpm dev:backend` | Sobe só a API                      |
| `pnpm dev:frontend`| Sobe só o frontend                 |
| `pnpm build`       | Build de todos os apps             |
| `pnpm lint`        | Lint em todos os apps              |
| `pnpm format`      | Formata código com Prettier (sem ponto e vírgula) |
| `pnpm db:generate` | Gera Prisma Client                 |
| `pnpm db:push`     | Aplica schema no banco (dev)       |
| `pnpm db:migrate`  | Roda migrações (produção)          |
| `pnpm db:studio`   | Abre Prisma Studio                 |

## Estrutura do monorepo

```
dibre/
├── apps/
│   ├── backend/          # API REST (Express, Prisma, Clerk)
│   │   ├── prisma/
│   │   └── src/
│   │       ├── controllers
│   │       ├── domain
│   │       ├── middleware
│   │       ├── repositories
│   │       ├── routes
│   │       ├── services
│   │       └── database
│   └── frontend/          # SPA (Vite, React, Tailwind, Clerk)
│       └── src/
│           ├── components/
│           │   ├── layout
│           │   └── ui        # Composition Pattern
│           ├── domain
│           ├── features
│           ├── hooks
│           ├── pages
│           └── services
├── docker-compose.yml     # Local: API + MySQL
├── .nvmrc                 # Node 24
└── pnpm-workspace.yaml
```

## Algoritmo de sorteio

O sorteio equilibrado considera a média de estrelas e a média dos atributos técnicos. Os jogadores são ordenados por “força” (média dos atributos) e distribuídos de forma gulosa: cada jogador é colocado no time que tem a menor soma atual, minimizando o desvio entre os times.

## Licença

Uso interno / projeto pessoal.
