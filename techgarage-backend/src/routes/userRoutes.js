const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Listar usuários
router.get("/", userController.getAll);

// Buscar usuário por ID
router.get("/:id", userController.getById);

// Criar usuário
router.post("/", userController.create);

// Atualizar usuário
router.put("/:id", userController.update);

// Excluir usuário
router.delete("/:id", userController.remove);

module.exports = router;