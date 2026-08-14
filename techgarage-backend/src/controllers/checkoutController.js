const prisma = require('../../database');
const HttpError = require('../utils/HttpError');

function clean(value, max = 160) {
  const text = String(value || '').trim();
  return text.slice(0, max);
}

function shippingData(body) {
  const shipping = body.shipping || {};
  const data = {
    shippingName: clean(shipping.name),
    shippingPhone: clean(shipping.phone, 30),
    shippingZipCode: clean(shipping.zipCode, 12).replace(/[^0-9-]/g, ''),
    shippingAddress: clean(shipping.address),
    shippingNumber: clean(shipping.number, 20),
    shippingComplement: clean(shipping.complement),
    shippingNeighborhood: clean(shipping.neighborhood, 100),
    shippingCity: clean(shipping.city, 100),
    shippingState: clean(shipping.state, 2).toUpperCase(),
  };

  const required = ['shippingName', 'shippingPhone', 'shippingZipCode', 'shippingAddress', 'shippingNumber', 'shippingNeighborhood', 'shippingCity', 'shippingState'];
  if (required.some((field) => !data[field])) throw new HttpError(400, 'Preencha todos os dados obrigatórios de entrega.');
  if (!/^\d{5}-?\d{3}$/.test(data.shippingZipCode)) throw new HttpError(400, 'CEP inválido.');
  if (!/^[A-Z]{2}$/.test(data.shippingState)) throw new HttpError(400, 'UF inválida.');

  return data;
}

exports.checkout = async (req, res) => {
  const checkoutKey = clean(req.body.checkoutKey, 80);
  if (checkoutKey.length < 16) throw new HttpError(400, 'Identificador do checkout inválido.');

  const previous = await prisma.order.findUnique({
    where: { checkoutKey },
    include: { items: { include: { product: true } }, payments: true },
  });
  if (previous) {
    if (previous.userId !== req.user.id) throw new HttpError(409, 'Identificador de checkout já utilizado.');
    return res.status(200).json(previous);
  }

  const paymentType = String(req.body.paymentType || 'PIX').toUpperCase();
  const pixCode = req.body.pixCode ? String(req.body.pixCode) : null;

  if (paymentType !== 'PIX') throw new HttpError(400, 'Forma de pagamento não suportada.');
  if (!pixCode || pixCode.length < 20 || pixCode.length > 512) throw new HttpError(400, 'Código PIX inválido.');

  const shipping = shippingData(req.body);

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cart.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) throw new HttpError(400, 'Seu carrinho está vazio.');

    let totalCents = 0;
    const itemsToCreate = [];

    for (const item of cartItems) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) throw new HttpError(400, 'Há um item com quantidade inválida no carrinho.');
      if (!item.product) throw new HttpError(409, 'Um produto do carrinho não está mais disponível.');

      const stockUpdate = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });

      if (stockUpdate.count !== 1) {
        throw new HttpError(409, `Estoque insuficiente para ${item.product.name}. Atualize o carrinho e tente novamente.`);
      }

      const unitPriceCents = Math.round(Number(item.product.price) * 100);
      totalCents += unitPriceCents * item.quantity;
      itemsToCreate.push({ productId: item.productId, quantity: item.quantity, unitPrice: item.product.price });
    }

    const createdOrder = await tx.order.create({
      data: {
        userId: req.user.id,
        totalValue: totalCents / 100,
        status: 'PAID',
        checkoutKey,
        ...shipping,
        items: { create: itemsToCreate },
        payments: { create: { type: paymentType, pixCode, status: 'APPROVED' } },
      },
      include: { items: { include: { product: true } }, payments: true },
    });

    await tx.cart.deleteMany({ where: { userId: req.user.id } });
      return createdOrder;
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      const duplicated = await prisma.order.findUnique({
        where: { checkoutKey },
        include: { items: { include: { product: true } }, payments: true },
      });
      if (duplicated?.userId === req.user.id) return res.status(200).json(duplicated);
    }
    throw error;
  }

  res.status(201).json(order);
};
