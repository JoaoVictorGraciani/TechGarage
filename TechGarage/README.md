# TechGarage Store 🛠️

> Tecnologia de ponta para quem exige performance.

E-commerce MVP de hardware, periféricos gamer, smartphones e componentes. Front-end construído em React (Vite) + Tailwind CSS, consumindo uma API real (Express + Prisma + MySQL).

## 🧱 Stack

- **React (Vite)** — front-end
- **Tailwind CSS** — estilização (design system com CSS Variables, tema dark/industrial)
- **React Router DOM** — rotas
- **Axios** — consumo da API
- **Context API** — estado global (carrinho e autenticação)

## ✅ Progresso

### Estrutura e configuração
- Setup do Tailwind e correção de imports/exports faltantes (`App.jsx`, `main.jsx`, `CartContext.jsx`, `Loading.jsx`, `slugify.js`)
- `db.json` populado com as 8 categorias obrigatórias e 16 produtos de exemplo (schema: `usuarios`, `categorias`, `produtos`, `carrinho`, `pedidos`, `itens_pedido`, `pagamentos`) — usado na fase inicial com `json-server`
- **Sistema de design centralizado** em `index.css` via CSS Variables (`--color-bg`, `--color-surface`, `--color-accent`, escala de espaçamento e radius) — permite trocar cores/estilo do site inteiro a partir de um único lugar
- Fundo customizado com gradientes radiais sutis na cor de marca + textura de grid, dando profundidade sem competir com o conteúdo
- Logo em imagem substituindo o logotipo em texto no Header

### 🔌 Integração com o back-end real (hoje)
O front deixou de consumir o `json-server` e passou a consumir a API real do time de back-end (Express + Prisma + MySQL):

- **`src/services/api.js`** — `baseURL` atualizada de `http://localhost:3001` (json-server) para `http://localhost:3000/api` (back-end real)
- **`src/hooks/useProdutos.js`** — endpoints trocados de `/produtos` e `/categorias` (português, json-server) para `/products` e `/categories` (inglês, API real)
- **Adaptação de nomes de campo** em todo o front, já que o schema do back-end usa nomenclatura em inglês:

  | Campo antigo (json-server) | Campo novo (API real) |
  |---|---|
  | `nome` | `name` |
  | `preco` | `price` |
  | `estoque` | `stock` |
  | `imagem` | `image` |
  | `categoria_id` | `categoryId` |
  | categoria `{ id, nome }` | categoria `{ id, name }` (já vem aninhada em `product.category`) |

- **`ProductCard.jsx`** — atualizado para os novos campos (`produto.name`, `produto.price`, `produto.stock`, `produto.image`); passou a ler a categoria diretamente de `produto.category.name` (já vem incluída na resposta da API), eliminando a necessidade de cruzar manualmente com uma lista separada de categorias
- **`ProductGrid.jsx`** — simplificado: não recebe mais a lista de `categorias` como prop, já que cada produto já traz sua categoria aninhada
- **`Home.jsx`** — filtro por categoria e por busca ajustado para `p.name`, `p.categoryId`, `c.name`
- **`CartContext.jsx`** — cálculo do `totalPreco` ajustado para `Number(item.price)` (preço vem como `Decimal` da API, precisa de conversão explícita antes de somar)
- **`Carrinho.jsx`** — todas as referências trocadas: `item.nome` → `item.name`, `item.preco` → `Number(item.price)`, `item.imagem` → `item.image`
- **`Checkout.jsx`** — mesmas trocas de campo aplicadas no resumo do pedido

### Componentes
- **`Header.jsx`** — logo em imagem, dropdown de categorias (substituiu a listagem horizontal de 8 links, resolvendo aperto de layout em telas médias), botão de login/usuário destacado (pílula com cor de marca), ícone do carrinho com badge, busca em linha própria, menu mobile com transição suave, dropdown fecha ao clicar fora
- **`CartContext.jsx`** — estado global do carrinho (`adicionarItem`, `removerItem`, `alterarQuantidade`, `totalItens`, `totalPreco`), com remoção automática ao zerar quantidade e **persistência via `localStorage`** (carrinho sobrevive a refresh da página)
- **`AuthContext.jsx`** — estado global de autenticação (`login`, `cadastrar`, `logout`), com sessão persistida em `localStorage` (ainda aponta para o endpoint antigo `/usuarios`; pendente de atualização para a rota real de autenticação do back-end)
- **`CartBadge.jsx`** — contador de itens no ícone do carrinho, sincronizado globalmente
- **`ProductCard.jsx`** — card de produto com imagem, nome, categoria, preço (BRL), badge de estoque, botão de adicionar ao carrinho; microinterações de hover (elevação, zoom na imagem) e clique (scale)
- **`ProductGrid.jsx`** — grid responsiva com espaçamento ajustado
- **`Reveal.jsx`** — wrapper com `IntersectionObserver` que anima entrada (fade + slide-up) dos cards conforme o usuário rola a tela, em efeito cascata
- **`SearchBar.jsx`** — busca via query param na URL (`?busca=termo`)
- **`Loading.jsx`** — spinner de carregamento
- **`slugify.js`** — utilitário que normaliza nomes de categoria em slugs (remove acentos, espaços → hífen), usado no filtro por categoria

### Hooks e páginas
- **`useProdutos.js`** — busca `produtos` e `categorias` da API real via `Promise.all`, com estados de `loading` e `erro`
- **`Home.jsx`** — vitrine principal; filtra produtos por termo de busca **e** por categoria (combináveis), com mensagens de estado vazio específicas para cada caso
- **`Carrinho.jsx`** — listagem de itens, controles +/-, remoção manual, subtotal por item e total geral, estado de carrinho vazio, persistente entre sessões
- **`Checkout.jsx`** — resumo do pedido, geração simulada de código PIX (Copia e Cola), QR Code gerado dinamicamente, botão de simular pagamento aprovado, tela de confirmação com animação
- **`Login.jsx`** — formulário de e-mail/senha com validação, mensagens de erro animadas
- **`Cadastro.jsx`** — formulário de nome/e-mail/telefone/senha com validação (e-mail válido, senha mínima de 6 caracteres, confirmação de senha, e-mail duplicado)

### Rotas configuradas (`App.jsx`)
| Rota | Página |
|---|---|
| `/` | Home |
| `/carrinho` | Carrinho |
| `/checkout` | Checkout |
| `/login` | Login |
| `/cadastro` | Cadastro |

### Correções de bugs
- Imports/exports faltantes causando tela em branco e erros de sintaxe (`App.jsx`, `main.jsx`, `CartContext.jsx`, `Loading.jsx`, `slugify.js`)
- Filtro por categoria não funcionava por mismatch de tipo (`id` retornado como string pelo `json-server` vs `categoria_id` number no `db.json`) — corrigido com comparação via `String()` (fase json-server)
- Scroll horizontal indevido — corrigido com `overflow-x: hidden` e `max-w-7xl` na grid
- Nav com 8 categorias cortando o ícone do carrinho em telas médias — resolvido substituindo a listagem horizontal por um dropdown único
- `ERR_CONNECTION_REFUSED` — causado por esquecer de manter o back-end rodando em paralelo ao `npm run dev` (aconteceu tanto na fase `json-server` quanto na fase API real)
- `404 Not Found` em `/products` e `/categories` — `baseURL` do Axios no `api.js` estava sem o prefixo `/api`
- Vulnerabilidades reportadas pelo `npm audit` no `react-router` — identificadas como relacionadas ao modo RSC (não utilizado neste projeto, que é SPA client-side puro); atualizado para a versão mais recente estável, sem necessidade de downgrade

### Design e UX
- Microinterações consistentes (hover, active, scale) em botões, links e cards em todo o site
- Glassmorphism sutil no Header (blur + transparência) ao rolar a página
- Animações de entrada (fade-in/slide-up) no Checkout, Login e Cadastro
- Efeito cascata de entrada nos cards da vitrine via scroll (`IntersectionObserver`)
- Fundo com gradiente radial + grid sutil, dando profundidade ao layout

## 📁 Estrutura de pastas

```
src/
├── assets/
│   └── logo.png
├── components/
│   ├── CartBadge.jsx
│   ├── Header.jsx
│   ├── Loading.jsx
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── Reveal.jsx
│   └── SearchBar.jsx
├── context/
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── hooks/
│   └── useProdutos.js
├── pages/
│   ├── Cadastro.jsx
│   ├── Carrinho.jsx
│   ├── Checkout.jsx
│   ├── Home.jsx
│   └── Login.jsx
├── services/
│   └── api.js
├── utils/
│   └── slugify.js
├── App.jsx
├── index.css
└── main.jsx
```

## ▶️ Como rodar o projeto

É necessário rodar **dois processos em paralelo**, em terminais separados: o front-end e a API do back-end.

```bash
# Terminal 1 — front-end (porta 5173)
npm install
npm run dev

# Terminal 2 — back-end (porta 3000)
# ver instruções no repositório do Back-end
```

Acesse: `http://localhost:5173`

**Importante:** o `src/services/api.js` aponta para `http://localhost:3000/api` — o back-end precisa estar rodando nessa porta para a Home carregar produtos.

## 🔜 Próximos passos

- [ ] Atualizar `AuthContext.jsx` para consumir a rota real de autenticação do back-end (hoje ainda referencia o endpoint antigo `/usuarios`)
- [ ] Migrar o carrinho de `localStorage` para a API real do back-end, vinculado ao usuário autenticado
- [ ] Conectar o Checkout ao fluxo real de pedido/pagamento do back-end
- [ ] Painel Admin (inserção/edição de produtos e estoque) — *prioridade média*
- [ ] Favoritos (localStorage) — *prioridade baixa*
- [ ] Testes de responsividade mobile completos em todas as páginas
- [ ] Investigar causa raiz do overflow horizontal (atualmente contornado com `overflow-x: hidden`)

## ⚠️ Notas de segurança (MVP simulado)

- O front ainda não valida nem armazena tokens de sessão de forma segura — a autenticação atual é simplificada para fins de MVP. Isso deve ser revisado assim que o `AuthContext` for conectado à rota real de autenticação do back-end.
