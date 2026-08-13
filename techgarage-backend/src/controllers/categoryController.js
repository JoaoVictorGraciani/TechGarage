const prisma = require('../../database');
const HttpError = require('../utils/HttpError');

function categoryName(value) {
  const name = String(value || '').trim();
  if (!name) throw new HttpError(400, 'Nome da categoria é obrigatório.');
  return name;
}

exports.getAll = async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });

  res.json(categories);
};

exports.getById = async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!category) {
    throw new HttpError(404, 'Categoria não encontrada.');
  }

  res.json(category);
};

exports.create = async (req, res) => {
  const category = await prisma.category.create({
    data: { name: categoryName(req.body.name) },
  });

  res.status(201).json(category);
};

exports.update = async (req, res) => {
  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: { name: categoryName(req.body.name) },
  });

  res.json(category);
};

exports.remove = async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
};
