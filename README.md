# TechGarage v4.3 — Store + Admin + Serper

E-commerce full stack com React 19 + Vite, Express 5, Prisma 6, MySQL e busca de imagens via Serper / Google Images.

## Importante: banco e imagens

A v4.3 separa **preparação do banco** de **seed inicial** para evitar alteração acidental de catálogo durante reinícios/mudanças de pasta.

### Primeira instalação em um banco vazio

```powershell
npm run install:all
npm run setup:database
npm run dev
```

`setup:database` executa `prisma generate`, `db push` e o seed inicial.

### Uso normal depois que o banco já existe

```powershell
npm run prepare:database
npm run dev
```

`prepare:database` agora executa **somente** `prisma generate + db push`. Ele não roda seed. Na v4.3 esse `db push` também adiciona a coluna opcional/única `checkoutKey` usada para idempotência do checkout, sem exigir reset do banco.

Na maioria dos dias, se dependências/Prisma já estão prontos, basta:

```powershell
npm run dev
```

### Diagnosticar se está usando o banco certo

```powershell
npm run diagnose:database
```

O comando mostra qual database/host está ativo e lista produtos que ainda usam `placehold.co`, sem alterar dados.

## `.env` do backend

Crie `techgarage-backend/.env`:

```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/techgarage"
PORT=3000
NODE_ENV=development
CORS_ORIGINS="http://localhost:5173"
JWT_SECRET="CHAVE_ALEATORIA_COM_PELO_MENOS_32_CARACTERES"

ADMIN_EMAIL="admin@techgarage.com"
ADMIN_PASSWORD="SUA_SENHA_ADMIN_COM_8_OU_MAIS_CARACTERES"
ADMIN_NAME="Administrador TechGarage"
ADMIN_RESET_PASSWORD="false"

SERPER_API_KEY="SUA_CHAVE_DA_SERPER"
```

`ADMIN_RESET_PASSWORD=false` impede que executar o seed troque a senha de um admin já existente. Só use `true` quando quiser deliberadamente redefini-la.

Frontend `TechGarage/.env`:

```env
VITE_API_URL="http://localhost:3000/api"
```

## Imagens com Serper

Admin → Produtos → Novo/Editar → **Buscar imagens no Google**.

A URL selecionada é persistida no campo `Product.image`. Na v4.3, depois de salvar, o Admin lê o produto novamente da API e só confirma sucesso se a URL realmente estiver gravada no banco.

A Serper encontra URLs de terceiros; elas podem deixar de funcionar futuramente. Para produção real, copie a imagem para storage próprio (Cloudinary/S3/R2 ou equivalente).

## URLs locais

- Loja: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:3000`
- Health: `http://localhost:3000/api/health`

## Smoke test rápido

Com o backend rodando, em outro terminal:

```powershell
npm run qa:smoke
```

Ele valida health/banco, produtos, categorias, proteção do Admin, proteção da Serper e tratamento de ID inválido sem alterar dados.

## QA

Veja `QA_REPORT_v4.3.md` para os achados da auditoria e prioridades antes de produção.
