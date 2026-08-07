const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

function gerarCodigoPix() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '00020126580014BR.GOV.BCB.PIX';
  for (let i = 0; i < 40; i++) {
    codigo += chars[Math.floor(Math.random() * chars.length)];
  }
  return codigo;
}

// Criar um novo pedido (carrinho -> checkout)
router.post('/', async (req, res) => {
  const { userId, items } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId é obrigatório." });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "O pedido precisa ter ao menos um item." });
  }

  try {
    // Busca os produtos reais no banco para pegar o preço atual (nunca confiar no preço enviado pelo front)
    const produtosIds = items.map((item) => item.productId);
    const produtos = await prisma.product.findMany({
      where: { id: { in: produtosIds } },
    });

    if (produtos.length !== produtosIds.length) {
      return res.status(400).json({ error: "Um ou mais produtos não foram encontrados." });
    }

    // Confere estoque disponível antes de criar o pedido
    for (const item of items) {
      const produto = produtos.find((p) => p.id === item.productId);
      if (produto.stock < item.quantity) {
        return res.status(400).json({ error: `Estoque insuficiente para "${produto.name}".` });
      }
    }

    const totalValue = items.reduce((soma, item) => {
      const produto = produtos.find((p) => p.id === item.productId);
      return soma + Number(produto.price) * item.quantity;
    }, 0);

    const codigoPix = gerarCodigoPix();

    // Cria o pedido, os itens e o pagamento em uma única transação
    const pedido = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: Number(userId),
          totalValue,
          status: 'PENDING',
        },
      });

      await tx.orderItem.createMany({
        data: items.map((item) => {
          const produto = produtos.find((p) => p.id === item.productId);
          return {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: produto.price,
          };
        }),
      });

      await tx.payment.create({
        data: {
          orderId: order.id,
          type: 'PIX',
          pixCode: codigoPix,
          status: 'PENDING',
        },
      });

      return order;
    });

    const pedidoCompleto = await prisma.order.findUnique({
      where: { id: pedido.id },
      include: { items: { include: { product: true } }, payments: true },
    });

    res.status(201).json(pedidoCompleto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar pedido." });
  }
});

// Confirmar pagamento (simulação do PIX aprovado)
router.put('/:id/confirmar-pagamento', async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }
    if (pedido.status === 'PAID') {
      return res.status(400).json({ error: "Este pedido já foi pago." });
    }

    await prisma.$transaction(async (tx) => {
      // Atualiza o status do pedido e do pagamento
      await tx.order.update({
        where: { id: pedido.id },
        data: { status: 'PAID' },
      });

      await tx.payment.updateMany({
        where: { orderId: pedido.id },
        data: { status: 'APPROVED' },
      });

      // Desconta o estoque de cada item comprado
      for (const item of pedido.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });

    res.json({ message: "Pagamento confirmado e estoque atualizado." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao confirmar pagamento." });
  }
});

// Listar pedidos de um usuário
router.get('/usuario/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const pedidos = await prisma.order.findMany({
      where: { userId: Number(userId) },
      include: { items: { include: { product: true } }, payments: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});

module.exports = router;