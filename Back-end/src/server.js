const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa as rotas
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: "API TechGarage Store rodando com sucesso!" });
});

// Vincula as rotas
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});