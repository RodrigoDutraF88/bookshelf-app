# 📚 Bookshelf App
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![tRPC](https://img.shields.io/badge/tRPC-v11-398CCB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![CI](https://github.com/RodrigoDutraF88/bookshelf-app/actions/workflows/ci.yml/badge.svg)

**[🔗 Demo ao Vivo](https://bookshelf-app-pearl-theta.vercel.app)** &nbsp;·&nbsp; **[🐳 Rodar com Docker](#rodar-com-docker)**

Não precisa de conta para dar uma olhada: escolha *Try it without signing up* na tela de login.

[🇬🇧 English](README.md) &nbsp;·&nbsp; 🇧🇷 Português &nbsp;·&nbsp; [🇮🇹 Italiano](README.it.md)

---

## Visão Geral

O Bookshelf App permite construir uma biblioteca digital pessoal, acompanhar o progresso de leitura e visualizar seus hábitos de leitura ao longo do tempo, buscar entre milhões de títulos via Google Books, escanear um código de barras para adicionar um livro pelo ISBN, e receber recomendações de leitura personalizadas por IA usando o Gemini.

Desenvolvido com a **T3 Stack** com type safety de ponta a ponta, do banco de dados à UI: uma mudança de schema do Prisma é sentida como um erro de compilação num componente React, sem nenhum passo manual de sincronização de tipos ou geração de código no meio do caminho.

## Screenshots


<p align="center">
     <img width="1440" height="777" alt="Screenshot 2026-07-20 at 18 55 08" src="https://github.com/user-attachments/assets/5877c17b-cfc1-4e33-a103-2a23e9f481f6" />
     <img width="1440" height="779" alt="Screenshot 2026-07-20 at 18 55 23" src="https://github.com/user-attachments/assets/9de223a0-3461-4c8e-adfb-cee514d35629" /> 
     <img width="1440" height="778" alt="Screenshot 2026-07-20 at 18 55 50" src="https://github.com/user-attachments/assets/eed9e7cf-cb90-404b-a5ec-2f36e2e9b694" />

<img width="1428" height="777" alt="Screenshot 2026-07-20 at 19 02 10" src="https://github.com/user-attachments/assets/ea12c9ba-51ed-4155-a747-cb9f358f8642" />
     <img width="328" height="607" alt="Screenshot 2026-07-20 at 18 59 17" src="https://github.com/user-attachments/assets/19d8e6ab-c736-416b-bfb7-35a90fdd0bcb" />
<img width="328" height="606" alt="Screenshot 2026-07-20 at 19 00 42" src="https://github.com/user-attachments/assets/02a6318e-9f1e-43e1-a9d5-15d854b47bc8" />
<img width="328" height="604" alt="Screenshot 2026-07-20 at 18 59 41" src="https://github.com/user-attachments/assets/1ad90599-bf54-4563-b64a-a068aab4c6ab" />


</p>


## Teck Stack 

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript (strict, ponta a ponta) |
| UI | React 19, Tailwind CSS v4 |
| API | tRPC v11, SuperJSON |
| Banco de Dados | PostgreSQL (Supabase), Prisma ORM |
| Auth | Auth.js (NextAuth v5 Beta), Prisma Adapter, sessões JWT |
| Validação | Zod |
| Data Fetching | TanStack React Query |
| IA | Google Gemini 2.5 Flash-Lite |
| APIs Externas | Google Books API |
| Testes | Vitest, com Prisma e sessões mockados |
| CI/CD | GitHub Actions → Vercel |
| Containerização | Docker, Docker Compose |
| Validação de Env | @t3-oss/env-nextjs |

## Funcionalidades

- **Biblioteca Pessoal** : adicione, edite e remova livros com metadados completos (título, autor, capa, gêneros, ISBN, ano de publicação)
- **Status de Leitura** : Quero Ler, Lendo, Concluído, Abandonado, com uma visão em estante organizada por categoria ou tudo junto
- **Acompanhamento de Progresso** : página atual, porcentagem concluída, datas de início e fim
- **Resenhas e Avaliações** : avaliação de 5 estrelas, notas pessoais, diário de leitura privado
- **Dashboard de Estatísticas** : total de livros, páginas lidas, avaliação média, sequência de leitura, atividade ao longo do tempo, distribuição por gênero
- **Explorar e Descobrir** : busque entre milhões de livros via Google Books API, veja detalhes, adicione direto na estante
- **Recomendações por IA** : sugestões personalizadas via Gemini com base nos livros concluídos, a um clique de encontrar o título real no Google Books
- **Leitura de Código de Barras** : adicione livros instantaneamente escaneando o ISBN com a câmera (`@zxing/browser`)
- **Autenticação OAuth** : entre com Discord ou Google, com vinculação automática de conta por e-mail verificado
- **UI Responsiva e Mobile-First** : navegação inferior dedicada no mobile, navegação superior no desktop, e layout totalmente adaptado para cada tamanho de tela


## Práticas de Engenharia

Este projeto foi construído com práticas de nível profissional, não apenas para "funcionar":

- **Type safety de ponta a ponta** : o tRPC infere todo o contrato da API a partir do código do servidor; um contrato quebrado falha no `tsc`, não em runtime
- **Pipeline de CI** — todo push roda typecheck → lint → test → build → Docker smoke test via GitHub Actions ([workflow](.github/workflows/ci.yml))
- **Testes automatizados** : testes unitários com Vitest para os routers do tRPC, com Prisma e contexto de sessão mockados
- **Ambiente de desenvolvimento containerizado** : qualquer pessoa pode clonar e rodar a stack completa (app + Postgres) com um único comando, sem precisar de Postgres local ou conta na Supabase — veja [Rodar com Docker](#rodar-com-docker)
- **Separação de runtime edge/Node para auth** : o middleware roda uma config do Auth.js segura para edge (sem Prisma), enquanto as rotas de API usam a config completa em Node, com sessões JWT conectando as duas de forma consistente
- **Conventional commits** : prefixos `feat/`, `fix/`, `chore/`, branch por feature com merges `--no-ff` para preservar o histórico
- **Documentação incorporada ao repositório** : decisões de arquitetura, modelo de dados e fluxo de autenticação documentados em [`/docs`](docs), não apenas em comentários no código

## O Que Eu Aprendi

Esse projeto também funcionou como um curso intensivo na prática da T3 Stack. fui mantendo uma lista de "coisas que aprendi" enquanto desenvolvia:
**Banco de dados & Prisma**
- `String` do Prisma mapeia para `VARCHAR(191)` por padrão : tokens OAuth/JWTs podem passar disso. `@db.Text` evita truncamento silencioso.
- O Prisma traduz objetos TS em SQL, gerencia queries, garante type safety e cuida das migrations.
- `upsert` = `where` (encontrar) + `create` (se não existir) + `update` (se existir).
**tRPC & validação**
- O Zod valida o input *antes* da procedure rodar: `.input(schema).mutation(...)`.
- `.mutation` = escreve, `.query` = só leitura; `ctx` carrega `{ db, session }`.
- `...(input?.status && { status: input.status })` ,chave condicional no objeto, sem pilha de `if`.
- `.refine()` força regras entre campos que o Zod sozinho não expressa (ex: "pelo menos rating ou body precisa existir").
**Arquitetura & runtime**
- Como o App Router resolve layouts/pages e a fronteira entre server e client components.
- Edge Runtime = leve, baseado em V8, APIs padrão da web, baixa latência, troca compatibilidade total com Node por isso.
- Por isso o Prisma precisa de uma config só-Node, separada do middleware edge-safe.
**Colocando no ar**
- Primeiro pipeline de CI de verdade: typecheck → lint → test → build via GitHub Actions.
- Deploy na Vercel : variáveis de ambiente, configs de build, diferenças entre local e serverless.
- Instintos mais afiados em React quanto a fronteiras server/client e data fetching.
**APIs externas**
- Primeira vez levando rate limits a sério como restrição de design — moldou o debounce e o tamanho mínimo de busca no Google Books.

## Documentação

| Doc | Descrição |
|---|---|
| [Architecture](docs/architecture.md) | Visão geral do sistema, fluxo de requisições e log de decisões |
| [Data Model](docs/data-model.md) | Schema do banco de dados e relações entre entidades |
| [Authentication](docs/authentication.md) | Setup de Auth.js + tRPC + Prisma Adapter |
| [Project Overview](docs/project-overview.md) | Resumo completo de funcionalidades e stack |
| [Development Order](docs/development-order.md) | Fases de desenvolvimento e histórico de branches |

## Design

A UI foi desenhada do zero no Figma antes da implementação, mobile-first, com uma paleta de cores em tom pergaminho e uma linguagem visual customizada de "estante" (lombadas de livro em 3D, prateleiras com textura de madeira) em vez de um visual genérico de biblioteca de componentes.

<p align="center">
  <img width="331" height="195" alt="Screenshot 2026-07-20 at 19 34 15" src="https://github.com/user-attachments/assets/2a3226ab-4a2d-4e24-91a3-ec0cdd6b6572" />

</p>

## Como Começar

### Pré-requisitos

- Node.js 22+ (recomendado gerenciar via [nvm](https://github.com/nvm-sh/nvm))
- Um banco de dados PostgreSQL (local, Docker, ou [Supabase](https://supabase.com))
- Credenciais de app OAuth do Discord e/ou Google ([Discord Developer Portal](https://discord.com/developers/applications), [Google Cloud Console](https://console.cloud.google.com))

### Setup local

```bash
git clone https://github.com/RodrigoDutraF88/bookshelf-app.git
cd bookshelf-app
npm install
cp .env.example .env   # preencha DATABASE_URL, AUTH_SECRET, credenciais OAuth, etc.
npx prisma migrate deploy
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Rodar com Docker

A forma mais rápida de testar o app completo — sem precisar de Postgres local ou conta na Supabase:

```bash
cp .env.docker.example .env.docker   # preencha suas próprias credenciais de OAuth/API
docker compose up --build
```

Isso sobe um container Postgres local junto com o app Next.js, rodando as migrations do Prisma automaticamente na primeira inicialização. Abra [http://localhost:3000](http://localhost:3000).

> Provedores OAuth exigem `http://localhost:3000/api/auth/callback/{provider}` registrado como redirect URI autorizada nas configurações do seu app Discord/Google.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de dev (Turbopack) |
| `npm run build` | Build de produção |
| `npm run typecheck` | Roda a checagem do compilador TypeScript |
| `npm run test` | Roda os testes unitários com Vitest |
| `npx prisma studio` | Navega pelo banco de dados visualmente |
| `docker compose up --build` | Roda a stack completa em containers |

## Licença

MIT