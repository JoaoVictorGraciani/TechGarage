const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

// Listar categorias
router.get("/", categoryController.getAll);

// Buscar categoria por ID
router.get("/:id", categoryController.getById);

// Criar categoria
router.post("/", categoryController.create);

// Atualizar categoria
router.put("/:id", categoryController.update);

// Excluir categoria
router.delete("/:id", categoryController.remove);

module.exports = router;