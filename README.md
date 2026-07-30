# TechGarage Store — Back-end 🛠️

API REST do e-commerce TechGarage Store, construída em Express + Prisma ORM + MySQL.

## 🧱 Stack

- **Node.js + Express** — servidor HTTP / API REST
- **Prisma ORM 7** — camada de acesso ao banco de dados
- **@prisma/adapter-mariadb** — driver adapter (obrigatório a partir do Prisma 7 para conectar em bancos MySQL/MariaDB)
- **MySQL** — banco de dados relacional
- **CORS** — liberado para o front-end (`http://localhost:5173`)
- **dotenv** — variáveis de ambiente

## ✅ Progresso de hoje

### Configuração inicial e CORS
- Instalado e configurado o pacote `cors` no `server.js`, restrito à origem do front-end (`http://localhost:5173`) — sem isso, o navegador bloqueia todas as chamadas do front por política de mesma origem
- Rotas registradas no `server.js` sob o prefixo `/api`: `/api/cart`, `/api/products`, `/api/categories`

### Configuração do Prisma 7 (mudança de arquitetura)
O Prisma 7 trouxe duas mudanças importantes em relação a versões anteriores, que exigiram reconfiguração:

1. **A URL de conexão saiu do `schema.prisma`** e passou a viver em `prisma.config.ts`, na raiz do projeto:
   ```typescript
   import "dotenv/config";
   import { defineConfig, env } from "prisma/config";

   export default defineConfig({
     schema: "prisma/schema.prisma",
     migrations: { path: "prisma/migrations" },
     datasource: { url: env("DATABASE_URL") },
   });
   ```
   O bloco `datasource` do `schema.prisma` ficou apenas com o `provider`, sem a linha `url`.

2. **Uso obrigatório de driver adapter** para instanciar o `PrismaClient` — antes era opcional, agora toda conexão MySQL/MariaDB precisa passar por `@prisma/adapter-mariadb`. Centralizamos essa instância em um único arquivo, reutilizado por todas as rotas:
   ```javascript
   // src/prisma.js
   const { PrismaClient } = require('@prisma/client');
   const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
   require('dotenv').config();

   const adapter = new PrismaMariaDb({
     host: process.env.DB_HOST || 'localhost',
     port: Number(process.env.DB_PORT) || 3306,
     user: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME || 'techgarage',
     connectionLimit: 5,
   });

   const prisma = new PrismaClient({ adapter });
   module.exports = prisma;
   ```
   Todas as rotas (`cartRoutes.js`, `productRoutes.js`, `categoryRoutes.js`) foram atualizadas para importar essa instância única (`require('../prisma')`) em vez de criar seu próprio `new PrismaClient()`.

### Banco de dados
- Banco MySQL local criado (`techgarage`) via MySQL Workbench
- Schema modelado com 7 tabelas, refletindo o domínio do e-commerce:

| Model | Campos principais | Finalidade |
|---|---|---|
| `User` | id, name, email, password, phone, role | Clientes e administradores |
| `Category` | id, name | Categorias de produto |
| `Product` | id, name, description, price, stock, image, categoryId | Catálogo |
| `Cart` | id, userId, productId, quantity | Itens temporários antes da compra |
| `Order` | id, userId, totalValue, status | Pedidos realizados |
| `OrderItem` | id, orderId, productId, quantity, unitPrice | Produtos dentro de cada pedido |
| `Payment` | id, orderId, type, pixCode, status | Pagamento PIX simulado |

- Migration inicial aplicada: `npx prisma migrate dev --name init`
- **Seed de dados** (`prisma/seed.js`) criado para popular o banco automaticamente: as 8 categorias obrigatórias (Notebooks, Monitores, Gamer, Smartphones, Headsets e Áudio, Teclados e Mouses, Armazenamento, Memória e Componentes) e 16 produtos de exemplo distribuídos entre elas. Categorias usam `upsert` (evita duplicar em execuções repetidas); produtos usam `create`.

### Rotas implementadas

**`GET /api/products`**
Lista todos os produtos, já com a categoria incluída (`include: { category: true }`), evitando que o front precise cruzar manualmente `categoryId` com uma lista separada de categorias.

**`GET /api/products/:id`**
Detalhe de um produto específico, com categoria incluída. Retorna 404 se não encontrado.

**`GET /api/categories`**
Lista todas as categorias.

**`POST /api/cart/add`**
Adiciona item ao carrinho de um usuário (`userId`, `productId`, `quantity`); se o item já existir no carrinho, soma a quantidade em vez de duplicar.

**`GET /api/cart/:userId`**
Lista os itens do carrinho de um usuário, com os dados do produto incluídos.

**`DELETE /api/cart/remove/:cartItemId`**
Remove um item específico do carrinho.

> ⚠️ As rotas de carrinho existem no back-end, mas **ainda não estão conectadas ao front-end** — hoje o front usa `localStorage` para o carrinho. Rotas de autenticação (`/api/auth/login`, `/api/auth/register`) e de pedidos/pagamento (`Order`/`Payment`) ainda não foram criadas.

### Correções de bugs
- `P1012` — `The datasource property 'url' is no longer supported in schema files` — resolvido movendo a URL para `prisma.config.ts` (mudança de arquitetura do Prisma 7)
- `P1000` — `Authentication failed against database server` — credenciais do `.env` não batiam com a senha configurada no MySQL Workbench
- `MODULE_NOT_FOUND: .prisma/client/default` — Prisma Client não tinha sido gerado; resolvido com `npx prisma generate`
- `PrismaClientInitializationError` (`PrismaClient needs to be constructed with...`) — rotas ainda instanciavam `new PrismaClient()` sem o adapter; resolvido centralizando em `src/prisma.js`
- `Cannot find module 'server.js'` — o arquivo estava em `src/server.js`, não na raiz do projeto
- `ERR_CONNECTION_REFUSED` no front — terminal do back-end (`node src/server.js`) havia sido fechado; back-end precisa permanecer rodando em paralelo ao front

## 📁 Estrutura de pastas

```
Back-end/
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
│       └── 20260729234312_init/
├── src/
│   ├── routes/
│   │   ├── cartRoutes.js
│   │   ├── productRoutes.js
│   │   └── categoryRoutes.js
│   ├── prisma.js
│   └── server.js
├── prisma.config.ts
├── .env
├── package.json
└── package-lock.json
```

## ▶️ Como rodar o projeto

**1. Instalar dependências:**
```bash
npm install
```

**2. Configurar o `.env`** na raiz do Back-end:
```
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/techgarage"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA
DB_NAME=techgarage
```

**3. Criar o banco no MySQL** (se ainda não existir):
```sql
CREATE DATABASE techgarage;
```

**4. Rodar as migrations e gerar o Prisma Client:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**5. Popular o banco com dados de exemplo:**
```bash
node prisma/seed.js
```

**6. Iniciar o servidor:**
```bash
node src/server.js
```

Deve aparecer no terminal:
```
🚀 Servidor rodando na porta 3000
```

**Mantenha esse terminal aberto** enquanto o front-end estiver em uso — se fechado, o front perde a conexão com a API (`ERR_CONNECTION_REFUSED`).

Testar rapidamente: acessar `http://localhost:3000/api/products` no navegador deve retornar a lista de produtos em JSON.

## 🔜 Próximos passos

- [ ] Rotas de autenticação (`POST /api/auth/register`, `POST /api/auth/login`) com hash de senha (ex: bcrypt) — hoje não existem no back-end
- [ ] Conectar as rotas de carrinho já existentes (`/api/cart`) ao front-end, substituindo o `localStorage`
- [ ] Rotas de pedido e pagamento (`Order`, `OrderItem`, `Payment`) para persistir o checkout no banco
- [ ] Middleware de autenticação/autorização para proteger rotas sensíveis (ex: apenas `role: ADMIN` pode criar/editar produtos)
- [ ] Rotas de criação/edição de produtos (para o futuro Painel Admin do front)
- [ ] Validação de payload nas rotas existentes (hoje não há checagem de campos obrigatórios/tipos antes de enviar ao Prisma)
- [ ] Script `npm start`/`npm run dev` no `package.json` (hoje o servidor é iniciado manualmente com `node src/server.js`)

## ⚠️ Notas de segurança (ambiente de desenvolvimento)

- Senhas de usuário, quando a rota de autenticação for implementada, **não devem** ser armazenadas em texto puro — usar hashing (bcrypt ou similar) antes de gravar no banco.
- CORS está liberado apenas para `http://localhost:5173`; ajustar para o domínio real antes de qualquer deploy em produção.
- Credenciais do banco (`.env`) não devem ser commitadas — confirmar que `.env` está no `.gitignore`.
