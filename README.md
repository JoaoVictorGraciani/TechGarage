# TechGarage Store 🛠️

> Tecnologia de ponta para quem exige performance.

E-commerce MVP de hardware, periféricos gamer, smartphones e componentes. Front-end construído em React (Vite) + Tailwind CSS, com API simulada via `json-server`.

## 🧱 Stack

- **React (Vite)** — front-end
- **Tailwind CSS** — estilização (tema dark/industrial)
- **React Router DOM** — rotas
- **Axios** — consumo da API
- **json-server** — API REST simulada a partir do `db.json`
- **Context API** — estado global do carrinho

## ✅ Progresso de hoje (Sprint 1 — Fundação)

### Estrutura e configuração
- Setup inicial do Tailwind (verificação de `index.css`, `postcss.config.js`)
- Correção de imports/exports faltantes (`App.jsx`, `main.jsx`, `CartContext.jsx`, `Loading.jsx`)
- `db.json` populado com as 8 categorias obrigatórias e 16 produtos de exemplo (schema: `usuarios`, `categorias`, `produtos`, `carrinho`, `pedidos`, `itens_pedido`, `pagamentos`)
- `src/services/api.js` — instância do Axios apontando para `http://localhost:3001`

### Componentes
- **`Header.jsx`** — logo + slogan, nav desktop com as 8 categorias, menu hambúrguer responsivo (mobile/tablet), ícone do carrinho com badge, barra de busca em linha própria abaixo da nav
- **`CartContext.jsx`** — estado global do carrinho (`adicionarItem`, `removerItem`, `alterarQuantidade`, `totalItens`, `totalPreco`), com remoção automática ao zerar quantidade
- **`CartBadge.jsx`** — contador de itens no ícone do carrinho, sincronizado globalmente
- **`ProductCard.jsx`** — card de produto com imagem, nome, categoria, preço formatado (BRL), badge de estoque (sem estoque / últimas unidades / em estoque) e botão de adicionar ao carrinho
- **`ProductGrid.jsx`** — grid responsivo de produtos, cruzando `produto.categoria_id` com a lista de categorias
- **`SearchBar.jsx`** — busca via query param na URL (`?busca=termo`), funciona a partir de qualquer página
- **`Loading.jsx`** — spinner de carregamento

### Hooks e páginas
- **`useProdutos.js`** — hook que busca `produtos` e `categorias` da API via `Promise.all`, com estados de `loading` e `erro`
- **`Home.jsx`** — vitrine principal, filtra produtos pelo termo de busca e trata estado vazio ("Nenhum produto encontrado")
- **`Carrinho.jsx`** — listagem de itens, controles +/-, remoção manual, subtotal por item e total geral, estado de carrinho vazio
- **`Checkout.jsx`** — resumo do pedido, geração simulada de código PIX (Copia e Cola), QR Code gerado dinamicamente, botão de simular pagamento aprovado e tela de confirmação

### Rotas configuradas (`App.jsx`)
| Rota | Página |
|---|---|
| `/` | Home |
| `/carrinho` | Carrinho |
| `/checkout` | Checkout |

## 📁 Estrutura de pastas

```
src/
├── assets/
├── components/
│   ├── CartBadge.jsx
│   ├── Header.jsx
│   ├── Loading.jsx
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   └── SearchBar.jsx
├── context/
│   └── CartContext.jsx
├── hooks/
│   └── useProdutos.js
├── pages/
│   ├── Carrinho.jsx
│   ├── Checkout.jsx
│   └── Home.jsx
├── services/
│   └── api.js
├── App.jsx
├── index.css
└── main.jsx
db.json
```

## ▶️ Como rodar o projeto

É necessário rodar **dois processos em paralelo**, em terminais separados:

```bash
# Terminal 1 — front-end (porta 5173)
npm install
npm run dev

# Terminal 2 — API simulada (porta 3001)
npm install -g json-server
json-server --watch db.json --port 3001
```

Acesse: `http://localhost:5173`

## 🔜 Próximos passos (Sprint 2)

- [ ] Filtro funcional por categoria (atualmente os links de categoria navegam via query param, mas ainda não filtram a Home)
- [ ] Login/Cadastro (formulários validados) — *prioridade média*
- [ ] Painel Admin (inserção de produtos/estoque) — *prioridade média*
- [ ] Favoritos (localStorage) — *prioridade baixa*
- [ ] Persistência do carrinho (atualmente reseta ao dar refresh — considerar `localStorage`)
- [ ] Testes de responsividade mobile em todas as páginas