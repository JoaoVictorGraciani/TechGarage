const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa as rotas do carrinho
const cartRoutes = require('./routes/cartRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Permite comunicação com o Front-end
app.use(cors());

app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: "API TechGarage Store rodando com sucesso!" });
});

// Rotas do carrinho
app.use('/api/cart', cartRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});