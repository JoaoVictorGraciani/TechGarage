const prisma = require('../../database');
const HttpError = require('../utils/HttpError');
const parseId = require('../utils/parseId');

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
    where: { id: parseId(req.params.id, 'Categoria') },
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
    where: { id: parseId(req.params.id, 'Categoria') },
    data: { name: categoryName(req.body.name) },
  });

  res.json(category);
};

exports.remove = async (req, res) => {
  await prisma.category.delete({ where: { id: parseId(req.params.id, 'Categoria') } });
  res.status(204).send();
};
