const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importação das rotas
const cartRoutes = require("./routes/cartRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderItemRoutes = require("./routes/orderItemRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota principal
app.get("/", (req, res) => {
    res.json({
        message: "API TechGarage Store rodando com sucesso!"
    });
});

// Rotas da API
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);
app.use("/api/payments", paymentRoutes);

// Caso a rota não exista
app.use((req, res) => {
    res.status(404).json({
        message: "Rota não encontrada."
    });
});

// Inicializar servidor
app.listen(PORT, () => {
    console.log(` Servidor rodando na porta ${PORT}`);
});