const prisma = require('../../database');
const HttpError = require('../utils/HttpError');
const { SAFE_USER_SELECT } = require('../utils/user');

const ORDER_INCLUDE = {
  user: { select: SAFE_USER_SELECT },
  items: { include: { product: true } },
  payments: true,
};

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'];
const TRANSITIONS = {
  PENDING: new Set(['PAID', 'CANCELED']),
  PAID: new Set(['PROCESSING', 'CANCELED']),
  PROCESSING: new Set(['SHIPPED', 'CANCELED']),
  SHIPPED: new Set(['DELIVERED']),
  DELIVERED: new Set([]),
  CANCELED: new Set(['PAID']),
};

function orderId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'Pedido inválido.');
  return id;
}

exports.getAll = async (req, res) => {
  const where = {};
  const status = String(req.query.status || '').toUpperCase();
  if (STATUSES.includes(status)) where.status = status;

  const orders = await prisma.order.findMany({ where, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' } });
  res.json(orders);
};

exports.getMine = async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { product: true } }, payments: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
};

exports.getById = async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: orderId(req.params.id) }, include: ORDER_INCLUDE });
  if (!order) throw new HttpError(404, 'Pedido não encontrado.');
  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) throw new HttpError(403, 'Você não tem permissão para acessar este pedido.');
  res.json(order);
};

exports.updateStatus = async (req, res) => {
  const id = orderId(req.params.id);
  const status = String(req.body.status || '').toUpperCase();
  if (!STATUSES.includes(status)) throw new HttpError(400, 'Status de pedido inválido.');

  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({ where: { id }, include: { items: true, payments: true } });
    if (!current) throw new HttpError(404, 'Pedido não encontrado.');
    if (current.status === status) return tx.order.findUnique({ where: { id }, include: ORDER_INCLUDE });

    const allowed = TRANSITIONS[current.status] || new Set();
    if (!allowed.has(status)) throw new HttpError(409, `Transição de ${current.status} para ${status} não permitida.`);

    if (status === 'CANCELED') {
      for (const item of current.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
      await tx.payment.updateMany({ where: { orderId: id }, data: { status: current.status === 'PENDING' ? 'CANCELED' : 'REFUNDED' } });
    }

    if (current.status === 'CANCELED' && status === 'PAID') {
      for (const item of current.items) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (result.count !== 1) throw new HttpError(409, 'Não há estoque suficiente para reativar este pedido.');
      }
      await tx.payment.updateMany({ where: { orderId: id }, data: { status: 'APPROVED' } });
    } else if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
      await tx.payment.updateMany({ where: { orderId: id }, data: { status: 'APPROVED' } });
    }

    return tx.order.update({ where: { id }, data: { status }, include: ORDER_INCLUDE });
  });

  res.json(order);
};
