const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

// Listar produtos
router.get("/", productController.getAll);

// Buscar produto por ID
router.get("/:id", productController.getById);

// Criar produto
router.post("/", productController.create);

// Atualizar produto
router.put("/:id", productController.update);

// Excluir produto
router.delete("/:id", productController.remove);

module.exports = router;