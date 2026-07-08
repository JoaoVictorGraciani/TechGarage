const express = require('express');
require('dotenv').config();

// Importa as rotas do carrinho
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: "API TechGarage Store rodando com sucesso!" });
});

// Vincula as rotas do carrinho ao prefixo /api/cart
app.use('/api/cart', cartRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});