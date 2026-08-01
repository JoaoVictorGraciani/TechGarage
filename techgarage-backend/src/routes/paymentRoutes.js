const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

// Listar pagamentos
router.get("/", paymentController.getAll);

// Buscar pagamento por ID
router.get("/:id", paymentController.getById);

// Criar pagamento
router.post("/", paymentController.create);

// Atualizar pagamento
router.put("/:id", paymentController.update);

// Excluir pagamento
router.delete("/:id", paymentController.remove);

module.exports = router;