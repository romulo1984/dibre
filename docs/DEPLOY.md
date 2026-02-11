# Deploy em produção (Coolify)

## Visão geral

- **Coolify**: deploy via Docker; o backend usa o `Dockerfile` em `apps/backend/`.
- **Banco local**: MySQL no Docker Compose; variável `DATABASE_URL`.
- **Banco produção**: MySQL (recomendado) ou Oracle com wallet; variáveis abaixo.

## Backend (API)

### Build e imagem

O build é feito a partir da **raiz do monorepo** (contexto do Docker), pois o Dockerfile usa npm workspaces e `apps/backend/`:

- **Build context**: raiz do repositório (`.`)
- **Dockerfile**: `apps/backend/Dockerfile`
- **Porta**: 4000 (ou `PORT` via env)

No Coolify, configure o serviço com:

- **Dockerfile path**: `apps/backend/Dockerfile`
- **Build context**: raiz do repo (onde está `package.json`)

### Variáveis de ambiente

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | Sim (MySQL) | URL do MySQL. Local: `mysql://dibre:dibre@mysql:3306/dibre` (compose). Produção: ex. `mysql://user:pass@host:3306/dibre`. |
| `CLERK_SECRET_KEY` | Sim | Chave secreta do Clerk. |
| `CLERK_PUBLISHABLE_KEY` | Sim | Chave pública do Clerk. |
| `FRONTEND_URL` | Recomendado | URL do frontend (CORS). Ex.: `https://app.dib.re`. |
| `PORT` | Não | Porta do servidor (padrão 4000). |

Para **Oracle Cloud com wallet** (conexão via wallet em Persistent Storage):

| Variável | Descrição |
|----------|-----------|
| `TNS_ADMIN` | Diretório da wallet (ex.: `/app/wallet`). Deve ser o path do volume montado no Coolify. |
| `DB_USER` | Usuário do banco. |
| `DB_PASSWORD` | Senha do banco. |
| `DB_CONNECTION_STRING` | Nome TNS (ex.: do `tnsnames.ora`) ou connection string. |

**Importante:** o Prisma atualmente suporta apenas **MySQL** (e outros providers, mas não Oracle). Se você usar apenas essas variáveis Oracle (sem `DATABASE_URL`), a aplicação fará fail-fast com mensagem explicando isso. Para produção com **Oracle Database**, é necessário usar **MySQL** (ex.: Oracle Cloud MySQL HeatWave) e `DATABASE_URL`, ou implementar uma camada de acesso Oracle (ex.: driver `oracledb`) separada. As variáveis `TNS_ADMIN`, `DB_USER`, `DB_PASSWORD` e `DB_CONNECTION_STRING` deixam o projeto pronto para quando essa camada existir.

### Wallet Oracle (Coolify)

1. Baixe a wallet do Autonomous Database (Oracle Cloud).
2. No Coolify, crie um **Persistent Storage** e faça upload/extração dos arquivos da wallet (incluindo `tnsnames.ora`, `sqlnet.ora`, etc.).
3. Monte esse storage no container do backend no path desejado, por exemplo: **Mount path**: `/app/wallet`.
4. Defina no ambiente do serviço: `TNS_ADMIN=/app/wallet`.
5. Defina também `DB_USER`, `DB_PASSWORD` e `DB_CONNECTION_STRING` (nome do serviço em `tnsnames.ora` ou connection string).

Assim o projeto fica pronto para uma futura conexão Oracle; hoje o app usa apenas MySQL via `DATABASE_URL`.

### Migrações

Em produção, rode as migrações antes ou após o deploy (job único ou init container):

```bash
npm run db:migrate
```

No Coolify, isso pode ser um **one-off job** ou script de pré-deploy, com as mesmas variáveis de ambiente do serviço principal (incluindo `DATABASE_URL` para MySQL).

### Health check

O container expõe um endpoint de saúde:

- **GET** `/health` → `{ "status": "ok", "service": "dibre-api" }`

O Dockerfile inclui `HEALTHCHECK` usando esse endpoint. No Coolify você pode usar o health check da imagem ou configurar um check HTTP para `http://localhost:4000/health`.

## Local com Docker

- `docker compose up -d mysql` sobe o MySQL.
- `docker compose up --build` sobe a API (e depende do MySQL).
- A API usa `DATABASE_URL` definida no `docker-compose` (ex.: `mysql://dibre:dibre@mysql:3306/dibre`).

Nenhuma variável Oracle é necessária localmente; o banco é sempre MySQL via Docker.
