# Feature: Grupos (Groups)

## Resumo

A feature de Grupos permite que usuários criem espaços compartilhados onde membros convidados podem visualizar jogadores e peladas do dono do grupo. Inclui um sistema de notificações reutilizável.

---

## Regras de Negócio

### Grupos
- Um usuário pode criar quantos grupos quiser.
- A criação de um grupo é **opcional** — jogadores e peladas continuam funcionando independentemente de grupos.
- Cada grupo tem um **dono** (owner), que é quem criou o grupo.
- O dono pode convidar qualquer usuário registrado na plataforma.
- O dono pode gerenciar a lista de membros (remover membros).
- O dono pode aceitar ou recusar solicitações de participação.
- Apenas o dono pode criar jogadores e peladas (como já funcionava); membros têm acesso somente leitura ao conteúdo do grupo.
- O conteúdo do grupo (jogadores e peladas) exibido é o conteúdo criado pelo dono do grupo.

### Membros
- Um usuário logado que acessar a página de um grupo do qual não é membro verá a opção de **solicitar participação**.
- A solicitação gera uma notificação para o dono do grupo.
- O dono aceita ou recusa a solicitação na página de gerenciamento do grupo.
- O dono também pode convidar um usuário diretamente, o que gera uma notificação para o usuário convidado.
- O usuário convidado pode aceitar ou recusar o convite diretamente na página do grupo.
- O dono não pode ser removido do grupo.

### Notificações
- Existe uma "central de notificações" acessível via ícone de sino na navbar (somente quando logado).
- Notificações são geradas automaticamente para:
  - `GROUP_JOIN_REQUEST`: quando alguém solicita participação num grupo (notificação vai para o dono).
  - `GROUP_INVITATION`: quando o dono convida alguém (notificação vai para o convidado).
- As notificações podem ser marcadas como lidas individualmente ou todas de uma vez.
- Um contador de não lidas aparece sobre o sino.
- O sistema de notificações foi projetado para ser extensível a outros tipos no futuro.

---

## Arquivos Criados / Modificados

### Backend

#### Banco de Dados
- **`apps/backend/prisma/schema.prisma`** — Adicionados modelos:
  - `Group`, `GroupMember`, `GroupJoinRequest`, `GroupInvitation`, `Notification`
  - Enums: `GroupRequestStatus`, `NotificationType`
  - Relações adicionadas ao modelo `User`
- **`apps/backend/prisma/migrations/20260219000000_add_groups_and_notifications/migration.sql`** — Migration SQL completa para criação das novas tabelas.

#### Domain
- **`apps/backend/src/domain/group.ts`** — Tipos de entidade: `GroupEntity`, `GroupMemberEntity`, `GroupJoinRequestEntity`, `GroupInvitationEntity`, `NotificationEntity`, `UserSummary`.

#### Repositories
- **`apps/backend/src/repositories/group.repository.ts`** — Acesso ao banco para grupos, membros, solicitações, convites e busca de usuários.
- **`apps/backend/src/repositories/notification.repository.ts`** — Acesso ao banco para notificações.

#### Services
- **`apps/backend/src/services/group.service.ts`** — Lógica de negócio: criar grupo, listar, entrar, convidar, responder solicitações/convites, busca de usuários.
- **`apps/backend/src/services/notification.service.ts`** — Lógica de notificações: listar, marcar como lida.

#### Controllers
- **`apps/backend/src/controllers/groups.controller.ts`** — Handlers HTTP para todas as rotas de grupos, membros, solicitações, convites e busca de usuários.
- **`apps/backend/src/controllers/notifications.controller.ts`** — Handlers HTTP para notificações.

#### Routes
- **`apps/backend/src/routes/index.ts`** — Adicionadas rotas para grupos, notificações e busca de usuários.

### Frontend

#### Domain
- **`apps/frontend/src/domain/types.ts`** — Adicionados tipos: `Group`, `GroupMembership`, `GroupDetailResponse`, `GroupMember`, `GroupJoinRequest`, `GroupInvitation`, `Notification`, `NotificationsResponse`, `UserSummary`.

#### Services
- **`apps/frontend/src/services/groups.service.ts`** — Cliente API para grupos, membros, solicitações, convites e busca de usuários.
- **`apps/frontend/src/services/notifications.service.ts`** — Cliente API para notificações.

#### Features
- **`apps/frontend/src/features/groups/GroupCard.tsx`** — Card de grupo (MagicCard com nome, slug e badge de dono).
- **`apps/frontend/src/features/groups/GroupList.tsx`** — Lista de grupos com estado vazio.
- **`apps/frontend/src/features/notifications/NotificationCenter.tsx`** — Sino de notificações com dropdown, contagem de não lidas, polling a cada 30s.

#### Pages
- **`apps/frontend/src/pages/GroupsPage.tsx`** — Lista de grupos do usuário (próprios e como membro).
- **`apps/frontend/src/pages/GroupNewPage.tsx`** — Formulário de criação de grupo (nome + descrição).
- **`apps/frontend/src/pages/GroupDetailPage.tsx`** — Página do grupo: tabs de Jogadores/Peladas (reutiliza PlayerList e GameList), banner de convite, botão de solicitar participação, botão de gerenciar (para dono).
- **`apps/frontend/src/pages/GroupManagePage.tsx`** — Gerenciamento: aprovar/recusar solicitações, remover membros, convidar usuários por busca, deletar grupo.

#### Componentes Atualizados
- **`apps/frontend/src/components/layout/Layout.tsx`** — Adicionado link "Grupos" na navbar e `NotificationCenter` (visível apenas quando logado).
- **`apps/frontend/src/App.tsx`** — Adicionadas rotas `/groups`, `/groups/new`, `/groups/:id`, `/groups/:id/manage`.

---

## API — Novos Endpoints

### Grupos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/groups` | Lista grupos do usuário (owned + membro) |
| POST | `/api/groups` | Cria novo grupo |
| GET | `/api/groups/:id` | Detalhe do grupo + membership info |
| PATCH | `/api/groups/:id` | Atualiza grupo (owner) |
| DELETE | `/api/groups/:id` | Deleta grupo (soft delete, owner) |
| GET | `/api/groups/:id/players` | Jogadores do dono do grupo |
| GET | `/api/groups/:id/games` | Peladas do dono do grupo |
| GET | `/api/groups/:id/members` | Lista membros |
| DELETE | `/api/groups/:id/members/:userId` | Remove membro (owner) |
| POST | `/api/groups/:id/request-join` | Solicita participação |
| DELETE | `/api/groups/:id/request-join` | Cancela solicitação |
| GET | `/api/groups/:id/join-requests` | Lista solicitações pendentes (owner) |
| POST | `/api/groups/:id/join-requests/:requestId/respond` | Aceita/recusa solicitação (body: `{ action: 'accept' \| 'decline' }`) |
| POST | `/api/groups/:id/invite/:userId` | Convida usuário (owner) |
| GET | `/api/invitations` | Lista convites pendentes do usuário |
| POST | `/api/invitations/:id/respond` | Aceita/recusa convite (body: `{ action: 'accept' \| 'decline' }`) |

### Notificações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/notifications` | Lista notificações + unreadCount |
| PATCH | `/api/notifications/:id/read` | Marca como lida |
| POST | `/api/notifications/read-all` | Marca todas como lidas |

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users/search?q=` | Busca usuários por nome/email (mín. 2 chars) |

---

## Aplicar em Produção

### 1. Executar a Migration

```bash
# Aplicar a migration no banco de produção
npm run db:migrate
```

Isso executará o arquivo `apps/backend/prisma/migrations/20260219000000_add_groups_and_notifications/migration.sql`, criando as tabelas:
- `Group`
- `GroupMember`
- `GroupJoinRequest`
- `GroupInvitation`
- `Notification`

### 2. Gerar o Prisma Client Atualizado

```bash
npm run db:generate
```

### 3. Build

```bash
npm run build
```

### 4. Deploy

Faça deploy normalmente pela plataforma (Coolify ou similar). Nenhuma variável de ambiente nova é necessária — a feature usa o banco MySQL e o Clerk já configurados.

### Reversão (rollback)

Para reverter, remova as tabelas manualmente no banco:

```sql
-- Ordem importa por causa das FK constraints
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_groupId_fkey`;
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_toUserId_fkey`;
ALTER TABLE `Notification` DROP FOREIGN KEY `Notification_fromUserId_fkey`;
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `GroupInvitation`;
DROP TABLE IF EXISTS `GroupJoinRequest`;
DROP TABLE IF EXISTS `GroupMember`;
DROP TABLE IF EXISTS `Group`;
```

E faça o deploy da versão anterior do código.

---

## Arquitetura de Dados

```
User
 ├─ ownedGroups[] → Group
 ├─ groupMemberships[] → GroupMember
 ├─ groupJoinRequests[] → GroupJoinRequest
 ├─ sentInvitations[] → GroupInvitation
 ├─ receivedInvitations[] → GroupInvitation
 ├─ sentNotifications[] → Notification
 └─ receivedNotifications[] → Notification

Group
 ├─ owner → User
 ├─ members[] → GroupMember
 ├─ joinRequests[] → GroupJoinRequest
 ├─ invitations[] → GroupInvitation
 └─ notifications[] → Notification
```

### Fluxo de entrada via solicitação
```
Usuário → POST /groups/:id/request-join
        → cria GroupJoinRequest (status: pending)
        → cria Notification (type: GROUP_JOIN_REQUEST) para o dono

Dono → POST /groups/:id/join-requests/:requestId/respond { action: 'accept' }
     → atualiza GroupJoinRequest (status: accepted)
     → cria GroupMember
```

### Fluxo de entrada via convite
```
Dono → POST /groups/:id/invite/:userId
     → cria GroupInvitation (status: pending)
     → cria Notification (type: GROUP_INVITATION) para o usuário

Usuário → POST /invitations/:id/respond { action: 'accept' }
        → atualiza GroupInvitation (status: accepted)
        → cria GroupMember
```
