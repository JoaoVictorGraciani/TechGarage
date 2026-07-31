const express = require('express');
const prisma = require('../config/prisma');

const router = express.Router();

// 1. Adicionar item ao carrinho (ou aumentar quantidade se já existir)
router.post('/add', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    // Verifica se o produto já está no carrinho do usuário
    const existingItem = await prisma.cart.findFirst({
      where: { userId, productId }
    });

    if (existingItem) {
      // Se já existe, atualiza a quantidade
      const updatedItem = await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + (quantity || 1) }
      });
      return res.status(200).json(updatedItem);
    }

    // Se não existe, cria um novo registro
    const newItem = await prisma.cart.create({
      data: {
        userId,
        productId,
        quantity: quantity || 1
      }
    });

    res.status(201).json(newItem);
  } catch (error) {
  console.log(error);

  res.status(500).json({ 
    error: error.message 
  });
    }
});

// 2. Listar todos os itens do carrinho de um usuário específico
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId: parseInt(userId) },
      include: {
        product: true // Já traz os dados do produto (nome, preço, imagem) junto
      }
    });

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar carrinho." });
  }
});

// 3. Remover um item do carrinho
router.delete('/remove/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;

  try {
    await prisma.cart.delete({
      where: { id: parseInt(cartItemId) }
    });

    res.json({ message: "Item removido do carrinho com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover item." });
  }
});

module.exports = router;