const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

// Listar pedidos
router.get("/", orderController.getAll);

// Buscar pedido por ID
router.get("/:id", orderController.getById);

// Criar pedido
router.post("/", orderController.create);

// Atualizar status do pedido
router.put("/:id", orderController.update);

// Excluir pedido
router.delete("/:id", orderController.remove);

module.exports = router;