# Controle de Chamados e Ordens de Serviço

Sistema interno para atendimento a clientes (chamados) e ordens de serviço (OS), com controle de usuários e papéis (Administrador, Atendente, Técnico).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- [Prisma ORM](https://www.prisma.io) + PostgreSQL
- [Auth.js (NextAuth v5)](https://authjs.dev) com login por e-mail/senha
- Tailwind CSS

## Papéis de usuário

- **Administrador**: acesso total, incluindo gestão de usuários.
- **Atendente**: cadastra clientes, abre e acompanha chamados, cria e gerencia ordens de serviço.
- **Técnico**: visualiza chamados e atualiza apenas as ordens de serviço atribuídas a ele.

## Rodando localmente

### 1. Pré-requisitos

- Node.js 20+
- Um banco PostgreSQL (local ou na nuvem — veja opções abaixo)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
DATABASE_URL="postgresql://usuario:senha@host:5432/banco"
NEXTAUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Para desenvolvimento local sem instalar Postgres manualmente, você pode usar o servidor local do Prisma:

```bash
npx prisma dev
```

Ele imprime uma `DATABASE_URL` para usar no `.env`.

### 4. Criar as tabelas e o usuário administrador inicial

```bash
npx prisma db push
npx prisma db seed
```

O seed cria o usuário:

- **E-mail**: admin@empresa.com
- **Senha**: admin123

Troque a senha (ou crie novos usuários) na tela **Usuários** após o primeiro login.

### 5. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Deploy em produção (nuvem)

### Banco de dados

Crie um banco PostgreSQL gerenciado gratuito em um destes serviços:

- [Neon](https://neon.tech)
- [Supabase](https://supabase.com)
- Banco Postgres do próprio [Railway](https://railway.app) ou [Render](https://render.com)

Copie a connection string fornecida para `DATABASE_URL`.

### Aplicação

**Opção Railway ou Render** (ambos com camada gratuita/baixo custo e suportam Next.js nativamente):

1. Crie um novo projeto e conecte este repositório.
2. Configure as variáveis de ambiente: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (URL pública da aplicação).
3. Build command: `npm run build`. Start command: `npm run start`.
4. Após o primeiro deploy, rode as migrações e o seed uma vez (via shell da plataforma ou pipeline):
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

A partir daí, novas alterações de schema devem ser versionadas com `npx prisma migrate dev --name <nome>` em desenvolvimento e aplicadas em produção com `npx prisma migrate deploy`.

## Estrutura principal

- `src/app/(app)` — páginas protegidas (dashboard, clientes, chamados, ordens de serviço, relatórios, usuários).
- `src/app/login` — tela de login.
- `src/lib/actions` — Server Actions (criação/atualização de dados).
- `src/lib/session.ts` — helpers de autenticação/autorização por papel.
- `prisma/schema.prisma` — modelo de dados.
- `prisma/seed.ts` — usuário administrador inicial.
