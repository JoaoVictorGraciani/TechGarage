const prisma = require('../../database');
const HttpError = require('../utils/HttpError');
const parseId = require('../utils/parseId');

function positiveInteger(value, field = 'quantidade') {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw new HttpError(400, `${field} deve ser um número inteiro maior que zero.`);
  }

  return number;
}

async function findOwnedCartItem(id, userId) {
  const item = await prisma.cart.findUnique({
    where: { id: parseId(id, 'Item do carrinho') },
  });

  if (!item || item.userId !== userId) {
    throw new HttpError(404, 'Item não encontrado no seu carrinho.');
  }

  return item;
}

exports.getCart = async (req, res) => {
  const cart = await prisma.cart.findMany({
    where: { userId: req.user.id },
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: { id: 'asc' },
  });

  res.json(cart);
};

exports.addItem = async (req, res) => {
  const productId = positiveInteger(req.body.productId, 'productId');
  const quantity = positiveInteger(req.body.quantity ?? 1);

  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new HttpError(404, 'Produto não encontrado.');
  }

  const existingItem = await prisma.cart.findFirst({
    where: {
      userId: req.user.id,
      productId,
    },
  });

  const finalQuantity = (existingItem?.quantity || 0) + quantity;

  if (finalQuantity > product.stock) {
    throw new HttpError(409, `Estoque insuficiente. Disponível: ${product.stock}.`);
  }

  const cartItem = existingItem
    ? await prisma.cart.update({
        where: { id: existingItem.id },
        data: { quantity: finalQuantity },
      })
    : await prisma.cart.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
      });

  res.status(existingItem ? 200 : 201).json(cartItem);
};

exports.updateItem = async (req, res) => {
  const quantity = positiveInteger(req.body.quantity);
  const item = await findOwnedCartItem(req.params.id, req.user.id);

  const product = await prisma.product.findUnique({
    where: { id: item.productId },
  });

  if (!product) {
    throw new HttpError(404, 'Produto não encontrado.');
  }

  if (quantity > product.stock) {
    throw new HttpError(409, `Estoque insuficiente. Disponível: ${product.stock}.`);
  }

  const updatedItem = await prisma.cart.update({
    where: { id: item.id },
    data: { quantity },
  });

  res.json(updatedItem);
};

exports.deleteItem = async (req, res) => {
  const item = await findOwnedCartItem(req.params.id, req.user.id);

  await prisma.cart.delete({ where: { id: item.id } });
  res.status(204).send();
};
