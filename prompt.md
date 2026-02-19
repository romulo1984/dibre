# dib.re

Crie um sistema web chamado **dib.re** com foco em avaliação de atletas de uma pelada e geração automática de times equilibrados.

O sistema deve permitir:

1. Cadastro de jogadores
2. Avaliação individual
3. Sorteio inteligente de times com base em critérios de equilíbrio

---

## REGRAS DE NEGÓCIO DO dib.re

O sistema deve permitir atribuir a cada jogador:

### ⭐ Estrelas (nível geral)

- Valor de 1 a 5
- 1 = nível mais baixo
- 5 = nível mais alto
- O algoritmo de sorteio deve equilibrar os times com base na média total de estrelas

### 📊 Atributos técnicos (todos variando de 1 a 5)

- Passe
- Chute
- Defesa
- Energia
- Velocidade

O algoritmo de geração de times deve considerar:

- Média de estrelas
- Média dos atributos técnicos
- Garantir que os times tenham o menor desvio possível entre si

O sistema deve permitir:

- Criar uma pelada
- Selecionar jogadores
- Definir número de times
- Executar sorteio equilibrado
- Exibir estatísticas comparativas entre os times
- Perfil detalhado de cada jogador (estatísticas de atributos técnicos, número de estrelas, total de vezes que participou de uma pelada/sorteio). Inclusive, cada jogador pode ter também uma página específica para ele, pra ver tudo isso

Regras de autenticação e autorização

- Devem ter inicialmente duas roles: admin (god mode) e viewer, mas o sistema deve ser capaz de comportar mais roles no futuro
- role admin: tem acesso a criação de pelada, avaliação de cada jogador, definição do número de times e executar sorteio
- role viewer: tem acesso apenas a visualização da pelada, lista de times com jogadores e estatísticas
- Somente a role admin precisa de autenticação

---

## REQUISITOS TÉCNICOS – FRONTEND

- Usar a versão mais recente do React
- Usar lint
- Usar Typescript
- Utilizar um bundle moderno e extremamente rápido (ex: Vite ou similar)
- Interface construída com Magic UI + Untitled UI
- Aplicar obrigatoriamente o Composition Pattern em todos os componentes visuais
- Arquitetura modular e bem organizada
- Usar o serviço/lib clerk para autenticação e autorização (da mesma forma que será feito pro backend, pra ter grande compatibilidade)
- Separação clara entre:
  - UI components
  - Feature components
  - Hooks
  - Services
  - Domain logic
- Código 100% em TypeScript
- Estrutura escalável e de fácil manutenção

---

## REQUISITOS TÉCNICOS – BACKEND

- Backend no mesmo repositório (monorepo)
- TypeScript também no backend
- API REST modular
- Lib simples e de fácil uso para sistema de autenticação
- Usar o serviço/lib clerk para autenticação e autorização (da mesma forma que será feito pro frontend, pra ter grande compatibilidade)
- Separação clara entre:
  - Controllers
  - Services
  - Domain
  - Repositories
  - Database layer
- Arquitetura limpa e fácil de manter
- Uso de padrões de mercado
- Banco de dados: MySQL

---

Tanto para Backend quanto para Frontend, usar o Node 24 (usando .nvmrc para garantir configuração)

## INFRAESTRUTURA

- Projeto organizado como monorepo (ex: `apps/frontend`, `apps/backend`)
- Backend rodando via Docker
- docker-compose para ambiente local com:
  - API
  - MySQL

### Produção

- Deploy em instância Oracle Cloud
- Orquestração via Coolify
- Banco de dados configurado no Coolify
- Conexão com banco via variáveis de ambiente
- docker-compose deve existir apenas para ambiente local
- Produção deve depender exclusivamente de variáveis de ambiente

---

## PADRÕES E QUALIDADE

- Código escrito com padrões de mercado
- Nomes de variáveis, funções, pastas e comentários obrigatoriamente em inglês
- Organização clara e previsível
- Código limpo
- Separação de responsabilidades
- Princípios SOLID
- Fácil escalabilidade futura
- Estrutura pronta para testes automatizados

---

## Objetivo Final

Gerar um projeto completo, moderno, modular, escalável e pronto para rodar localmente e em produção, com foco em clareza arquitetural, organização profissional e algoritmo inteligente de balanceamento de times.


## Melhorias
Iterface:

- No cadastro de uma pelada, deixar na interface um input de seleção de data (apenas dia, mês e ano), e ao salvar, criar o nome da pelada como "Pelada do dia x de Janeiro de x", obviamente formatando corretamente com as libs de formatação do javascript;
- Na lista de selecionar jogadores, ter uma opção de marcar todos
- Na hora de escolher as estrelas de um jogador (editar), fazer um slider de estrelas, onde ao tocar na estrela (por exemplo, estrela 3), define aquele número de estrelas. Para os outros atributos, manter.



## Próximo prompt
Analise todo o projeto da parte de frontend (apps/frontend) e refatore tudo, agora usando as bibliotecas de componentes Magic UI e Untitled UI para os componentes de interface.

Considere as seguintes especificações:

- Use a biblioteca Magic UI: install guide disponível em https://magicui.design/docs/installation;
- Use a biblioteca Untitled UI: install guide disponível em https://www.untitledui.com/react/integrations/vite;
- Para manter consistência visual, use tokens semânticos para os estilos, variáveis css (scss), ou qualquer outra coisa relacionada ao tema;
- Na página principal, crie uma landing page bem moderna e impressionante, se utilizando bastante dos componentes do Magic UI;
- Tente usar componentes visuais mais impressionantes (por exemplo, do Magic UI), para locais onde precisa de um refinamento visual mais amplo, tipo nos cards dos players, landing page, logo, etc. E use o Untitled UI para os componentes mais usuais e de experiência do usuário;
- Ao refatorar a interface, tente manter o Composition Pattern, porém, dê preferência com componentes puros usados da forma como são providos por suas bibliotecas (Magic UI e Untitled UI);
- No geral, deixe a interface mais bonita e com uma ótima experiência, mudando inclusive, se necessário, alguns tipos de interação com a api.