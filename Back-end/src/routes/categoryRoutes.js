const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Listar todas as categorias
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar categorias." });
  }
});

module.exports = router;