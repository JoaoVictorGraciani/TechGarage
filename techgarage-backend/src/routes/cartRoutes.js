const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

// Adicionar produto ao carrinho
router.post("/add", cartController.addItem);

// Listar carrinho do usuário
router.get("/:userId", cartController.getCart);

// Atualizar quantidade
router.put("/:id", cartController.updateItem);

// Remover item
router.delete("/remove/:id", cartController.deleteItem);

module.exports = router;