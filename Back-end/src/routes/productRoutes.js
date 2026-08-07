const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Listar todos os produtos (com categoria já incluída)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produtos." });
  }
});

// Buscar um produto específico
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar produto." });
  }
});

// Criar um novo produto
router.post('/', async (req, res) => {
  const { name, categoryId, price, stock, image, description } = req.body;

  // Validação básica no back-end (nunca confiar só na validação do front)
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nome do produto é obrigatório." });
  }
  if (!categoryId) {
    return res.status(400).json({ error: "Categoria é obrigatória." });
  }
  if (price === undefined || price <= 0) {
    return res.status(400).json({ error: "Preço deve ser maior que zero." });
  }
  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: "Quantidade em estoque deve ser maior ou igual a zero." });
  }

  try {
    // Confirma que a categoria existe antes de tentar criar o produto
    const categoriaExiste = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!categoriaExiste) {
      return res.status(400).json({ error: "Categoria informada não existe." });
    }

    const produto = await prisma.product.create({
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        price: Number(price),
        stock: Number(stock),
        image: image || null,
        description: description ? description.trim() : null,
      },
      include: { category: true },
    });

    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar produto." });
  }
});
// Atualizar um produto existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, categoryId, price, stock, image, description } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nome do produto é obrigatório." });
  }
  if (!categoryId) {
    return res.status(400).json({ error: "Categoria é obrigatória." });
  }
  if (price === undefined || price <= 0) {
    return res.status(400).json({ error: "Preço deve ser maior que zero." });
  }
  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: "Quantidade em estoque deve ser maior ou igual a zero." });
  }

  try {
    const produtoExiste = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!produtoExiste) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    const categoriaExiste = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!categoriaExiste) {
      return res.status(400).json({ error: "Categoria informada não existe." });
    }

    const produto = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        price: Number(price),
        stock: Number(stock),
        image: image || null,
        description: description ? description.trim() : null,
      },
      include: { category: true },
    });

    res.json(produto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar produto." });
  }
});

// Excluir um produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const produtoExiste = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!produtoExiste) {
      return res.status(404).json({ error: "Produto não encontrado." });
    }

    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ message: "Produto excluído com sucesso." });
  } catch (error) {
    // Se o produto já foi comprado por alguém (existe em OrderItem), o banco impede a exclusão
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: "Não é possível excluir: este produto já possui pedidos vinculados.",
      });
    }
    res.status(500).json({ error: "Erro ao excluir produto." });
  }
});
module.exports = router;