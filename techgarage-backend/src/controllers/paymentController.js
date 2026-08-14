const parseId = require('../utils/parseId');
const prisma = require('../../database');

exports.getAll = async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: { order: true },
    orderBy: { id: 'desc' },
  });

  res.json(payments);
};

exports.getById = async (req, res) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseId(req.params.id, 'Pagamento') },
    include: { order: true },
  });

  if (!payment) {
    return res.status(404).json({ message: 'Pagamento não encontrado.' });
  }

  res.json(payment);
};
