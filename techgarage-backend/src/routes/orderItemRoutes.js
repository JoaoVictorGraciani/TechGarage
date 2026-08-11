const express = require("express");
const router = express.Router();

const orderItemController = require("../controllers/orderItemController");

// Listar itens
router.get("/", orderItemController.getAll);

// Buscar item por ID
router.get("/:id", orderItemController.getById);

// Criar item
router.post("/", orderItemController.create);

// Atualizar item
router.put("/:id", orderItemController.update);

// Excluir item
router.delete("/:id", orderItemController.remove);

module.exports = router;