# TechGarage Store 🛠️

> Tecnologia de ponta para quem exige performance.

E-commerce MVP de hardware, periféricos gamer, smartphones e componentes. Front-end construído em React (Vite) + Tailwind CSS, com API simulada via `json-server`.

## 🧱 Stack

- **React (Vite)** — front-end
- **Tailwind CSS** — estilização (design system com CSS Variables, tema dark/industrial)
- **React Router DOM** — rotas
- **Axios** — consumo da API
- **json-server** — API REST simulada a partir do `db.json`
- **Context API** — estado global (carrinho e autenticação)

## ✅ Progresso

### Estrutura e configuração
- Setup do Tailwind e correção de imports/exports faltantes (`App.jsx`, `main.jsx`, `CartContext.jsx`, `Loading.jsx`, `slugify.js`)
- `db.json` populado com as 8 categorias obrigatórias e 16 produtos de exemplo (schema: `usuarios`, `categorias`, `produtos`, `carrinho`, `pedidos`, `itens_pedido`, `pagamentos`)
- `src/services/api.js` — instância do Axios apontando para `http://localhost:3001`
- **Sistema de design centralizado** em `index.css` via CSS Variables (`--color-bg`, `--color-surface`, `--color-accent`, escala de espaçamento e radius) — permite trocar cores/estilo do site inteiro a partir de um único lugar
- Fundo customizado com gradientes radiais sutis na cor de marca + textura de grid, dando profundidade sem competir com o conteúdo
- Logo em imagem substituindo o logotipo em texto no Header

### Componentes
- **`Header.jsx`** — logo em imagem, dropdown de categorias (substituiu a listagem horizontal de 8 links, resolvendo aperto de layout em telas médias), botão de login/usuário destacado (pílula com cor de marca), ícone do carrinho com badge, busca em linha própria, menu mobile com transição suave, dropdown fecha ao clicar fora
- **`CartContext.jsx`** — estado global do carrinho (`adicionarItem`, `removerItem`, `alterarQuantidade`, `totalItens`, `totalPreco`), com remoção automática ao zerar quantidade e **persistência via `localStorage`** (carrinho sobrevive a refresh da página)
- **`AuthContext.jsx`** — estado global de autenticação (`login`, `cadastrar`, `logout`), simulado contra o endpoint `/usuarios` do `json-server`, com sessão persistida em `localStorage`
- **`CartBadge.jsx`** — contador de itens no ícone do carrinho, sincronizado globalmente
- **`ProductCard.jsx`** — card de produto com imagem, nome, categoria, preço (BRL), badge de estoque, botão de adicionar ao carrinho; microinterações de hover (elevação, zoom na imagem) e clique (scale)
- **`ProductGrid.jsx`** — grid responsiva com espaçamento ajustado e cruzamento correto de tipos entre `categoria_id` (number) e `id` da categoria (string, retornado pelo json-server)
- **`Reveal.jsx`** — wrapper com `IntersectionObserver` que anima entrada (fade + slide-up) dos cards conforme o usuário rola a tela, em efeito cascata
- **`SearchBar.jsx`** — busca via query param na URL (`?busca=termo`)
- **`Loading.jsx`** — spinner de carregamento
- **`slugify.js`** — utilitário que normaliza nomes de categoria em slugs (remove acentos, espaços → hífen), usado no filtro por categoria

### Hooks e páginas
- **`useProdutos.js`** — busca `produtos` e `categorias` da API via `Promise.all`, com estados de `loading` e `erro`
- **`Home.jsx`** — vitrine principal; filtra produtos por termo de busca **e** por categoria (combináveis), com mensagens de estado vazio específicas para cada caso
- **`Carrinho.jsx`** — listagem de itens, controles +/-, remoção manual, subtotal por item e total geral, estado de carrinho vazio, persistente entre sessões
- **`Checkout.jsx`** — resumo do pedido, geração simulada de código PIX (Copia e Cola), QR Code gerado dinamicamente, botão de simular pagamento aprovado, tela de confirmação com animação
- **`Login.jsx`** — formulário de e-mail/senha com validação, autenticação simulada via API, mensagens de erro animadas
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
- Filtro por categoria não funcionava por mismatch de tipo (`id` retornado como string pelo `json-server` vs `categoria_id` number no `db.json`) — corrigido com comparação via `String()`
- Mesmo bug de tipo replicado no `ProductGrid` (categoria aparecia como "Outros")
- Scroll horizontal indevido — corrigido com `overflow-x: hidden` e `max-w-7xl` na grid
- Nav com 8 categorias cortando o ícone do carrinho em telas médias — resolvido substituindo a listagem horizontal por um dropdown único
- Erro de `ERR_CONNECTION_REFUSED` por esquecimento de rodar o `json-server` em paralelo ao `npm run dev`

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

## 🔜 Próximos passos

- [ ] Painel Admin (inserção/edição de produtos e estoque) — *prioridade média*
- [ ] Favoritos (localStorage) — *prioridade baixa*
- [ ] Testes de responsividade mobile completos em todas as páginas
- [ ] Investigar causa raiz do overflow horizontal (atualmente contornado com `overflow-x: hidden`)

## ⚠️ Notas de segurança (MVP simulado)

- Senhas são armazenadas em texto puro no `db.json` e comparadas diretamente no front-end. Isso é aceitável apenas para fins de simulação/MVP — em produção, autenticação exige hashing de senha e validação no back-end.