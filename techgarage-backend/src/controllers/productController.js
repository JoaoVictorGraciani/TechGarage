const prisma = require('../../database');
const HttpError = require('../utils/HttpError');

function parseId(value, label = 'Produto') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, `${label} inválido.`);
  return id;
}

function productData(body, partial = false) {
  const data = {};

  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (name.length < 2 || name.length > 160) throw new HttpError(400, 'Nome do produto inválido.');
    data.name = name;
  }

  if (body.description !== undefined) {
    const description = body.description ? String(body.description).trim() : null;
    if (description && description.length > 5000) throw new HttpError(400, 'Descrição muito longa.');
    data.description = description;
  }

  if (body.brand !== undefined) {
    const brand = body.brand ? String(body.brand).trim() : null;
    if (brand && brand.length > 80) throw new HttpError(400, 'Marca muito longa.');
    data.brand = brand;
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0 || price > 99999999) throw new HttpError(400, 'Preço inválido.');
    data.price = Math.round(price * 100) / 100;
  }

  if (!partial || body.stock !== undefined) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) throw new HttpError(400, 'Estoque inválido.');
    data.stock = stock;
  }

  if (body.image !== undefined) {
    const image = body.image ? String(body.image).trim() : null;
    if (image && image.length > 2048) throw new HttpError(400, 'URL da imagem muito longa.');
    if (image) {
      let parsed;
      try { parsed = new URL(image); } catch { throw new HttpError(400, 'URL da imagem inválida.'); }
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new HttpError(400, 'A imagem deve usar HTTP ou HTTPS.');
    }
    data.image = image;
  }

  if (body.featured !== undefined) {
    data.featured = body.featured === true || body.featured === 'true';
  }

  if (!partial || body.categoryId !== undefined) {
    data.categoryId = parseId(body.categoryId, 'Categoria');
  }

  return data;
}

async function validateCategory(categoryId) {
  if (!categoryId) return;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new HttpError(400, 'Categoria não encontrada.');
}

exports.getAll = async (req, res) => {
  const where = {};
  const search = String(req.query.search || '').trim();
  const categoryId = Number(req.query.categoryId);
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
      { description: { contains: search } },
    ];
  }
  if (Number.isInteger(categoryId) && categoryId > 0) where.categoryId = categoryId;
  if (req.query.inStock === 'true') where.stock = { gt: 0 };
  if (req.query.featured === 'true') where.featured = true;
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    where.price = {};
    if (Number.isFinite(minPrice)) where.price.gte = Math.max(0, minPrice);
    if (Number.isFinite(maxPrice)) where.price.lte = Math.max(0, maxPrice);
  }

  const orderByMap = {
    newest: { createdAt: 'desc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    name_asc: { name: 'asc' },
    stock_asc: { stock: 'asc' },
  };
  const orderBy = orderByMap[req.query.sort] || [{ featured: 'desc' }, { createdAt: 'desc' }];

  const limit = Math.min(Math.max(Number(req.query.limit) || 200, 1), 500);
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy,
    take: limit,
  });

  res.json(products);
};

exports.getById = async (req, res) => {
  const id = parseId(req.params.id);
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) throw new HttpError(404, 'Produto não encontrado.');
  res.json(product);
};

exports.create = async (req, res) => {
  const data = productData(req.body);
  await validateCategory(data.categoryId);
  const product = await prisma.product.create({ data, include: { category: true } });
  res.status(201).json(product);
};

exports.update = async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new HttpError(404, 'Produto não encontrado.');

  const data = productData(req.body, true);
  if (!Object.keys(data).length) throw new HttpError(400, 'Nenhum campo válido para atualizar.');
  await validateCategory(data.categoryId);

  const product = await prisma.product.update({ where: { id }, data, include: { category: true } });
  res.json(product);
};

exports.remove = async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) throw new HttpError(404, 'Produto não encontrado.');
  if (existing._count.orderItems > 0) {
    throw new HttpError(409, 'Este produto já possui vendas e não pode ser excluído. Zere o estoque para impedir novas compras sem perder o histórico.');
  }
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
};
