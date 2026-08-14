# TechGarage v4.3 — QA Senior Review

## Escopo
Revisão estática de frontend React/Vite, backend Express/Prisma, autenticação, catálogo, carrinho, checkout, pedidos, Admin e integração Serper.

## Correções aplicadas nesta versão

### 1. Persistência do catálogo / seed — CORRIGIDO
**Risco anterior:** `npm run prepare:database` executava `seed` em toda preparação. Embora o seed v4.2 não sobrescrevesse diretamente `image` de um produto existente, misturar preparação de schema com carga de dados aumenta o risco operacional, especialmente quando um `.env` novo aponta para outro banco vazio.

**v4.3:**
- `prepare:database` agora executa somente `prisma generate + db push`;
- `setup:database` é o comando explícito de primeira instalação e inclui o seed;
- o seed só cria o catálogo se a tabela `Product` estiver vazia;
- se houver qualquer produto, o seed não altera imagem, preço, estoque, nome ou descrição;
- admin existente mantém a senha por padrão; reset só ocorre com `ADMIN_RESET_PASSWORD=true`.

### 2. Diagnóstico do banco — CORRIGIDO
Novo comando `npm run diagnose:database` mostra:
- nome/host/porta do banco ativo sem expor senha;
- quantidade de produtos, usuários e pedidos;
- produtos sem imagem ou usando `placehold.co`;
- `updatedAt` dos produtos afetados.

O servidor também imprime qual banco foi conectado ao iniciar e alerta se houver placeholders.

### 3. Persistência da imagem no Admin — ENDURECIDO
Depois de `POST/PUT /products`, o frontend faz uma leitura de confirmação (`GET /products/:id`). O Admin só exibe sucesso se a imagem retornada pelo banco for exatamente a URL que foi enviada.

### 4. Validação de URL de imagem — CORRIGIDO
A API passa a aceitar somente URLs `http://` ou `https://` e rejeita URL inválida/protocolo não suportado.

### 5. Visibilidade de placeholders no Admin — MELHORADO
A tela de produtos contabiliza itens usando imagem padrão e marca esses registros na listagem.

### 6. IDs inválidos em endpoints — CORRIGIDO
Categorias, usuários, pagamentos, order-items e itens do carrinho agora rejeitam IDs inválidos com erro 400 controlado, em vez de deixar o Prisma receber `NaN`/valores inconsistentes.

### 7. Idempotência do checkout — CORRIGIDO
Cada tentativa de checkout envia um `checkoutKey` estável. O banco impõe unicidade e o backend devolve o pedido já criado se a mesma tentativa for repetida, reduzindo risco de pedido duplicado por duplo clique/retry de rede.

## Achados ainda relevantes

### ALTA — Checkout é simulação, não pagamento real
O backend aceita o PIX gerado pelo próprio frontend e cria pedido com `status=PAID` e pagamento `APPROVED`. Isso é adequado para demo escolar/MVP, mas não deve ser considerado pagamento real em produção. O status deveria depender de webhook assinado de um gateway.

### MÉDIA — URLs de imagens são de terceiros
A Serper retorna URLs externas. Mesmo persistidas corretamente no banco, a origem pode bloquear hotlink, remover a imagem ou mudar a URL. Para produção, a imagem escolhida deve ser copiada para armazenamento controlado (Cloudinary/S3/R2 ou equivalente).

### MÉDIA — `db push` não é estratégia ideal de produção
Para desenvolvimento funciona. Em produção, use Prisma Migrations versionadas para ter histórico de schema e deploy reproduzível.

### MÉDIA — Listagens administrativas não têm paginação no backend
Produtos/usuários/pedidos são carregados em lote e paginados no React. Com poucos registros funciona; com milhares, custo de rede/memória cresce. Recomendado `page`, `pageSize`, `total` no backend.

### MÉDIA — Carrinho não possui restrição composta no schema
O modelo `Cart` não define `@@unique([userId, productId])`. Em concorrência, podem surgir linhas duplicadas do mesmo produto para o mesmo usuário. Recomendado adicionar a constraint após limpar possíveis duplicatas.

### MÉDIA — GitHub Pages não hospeda o backend
O frontend pode ir para GitHub Pages, mas Express/Prisma/MySQL/Serper precisam de host separado. Também é necessário configurar `VITE_API_URL` para a URL pública da API e tratar roteamento SPA/base path do repositório.

### BAIXA — Campos de entrega são truncados
`shippingData()` limita strings com `slice()`. É mais previsível rejeitar input acima do limite com erro 400, em vez de salvar texto truncado silenciosamente.

## Veredito
A base está coerente para demonstração/MVP e a arquitetura de autenticação/carrinho/estoque é significativamente melhor do que a versão inicial. Para produção real, os maiores bloqueadores são: pagamento real, idempotência de checkout, storage próprio de imagens, migrations e deploy separado do backend.
