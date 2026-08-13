const prisma = require('../../database');

exports.getAll = async (req, res) => {
  const items = await prisma.orderItem.findMany({
    include: {
      order: true,
      product: true,
    },
    orderBy: { id: 'desc' },
  });

  res.json(items);
};

exports.getById = async (req, res) => {
  const item = await prisma.orderItem.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      order: true,
      product: true,
    },
  });

  if (!item) {
    return res.status(404).json({ message: 'Item não encontrado.' });
  }

  res.json(item);
};
