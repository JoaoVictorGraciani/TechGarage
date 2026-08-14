const bcrypt = require('bcryptjs');
const prisma = require('../../database');
const HttpError = require('../utils/HttpError');
const { SAFE_USER_SELECT, normalizeEmail } = require('../utils/user');
const parseId = require('../utils/parseId');

const ALLOWED_ROLES = new Set(['CLIENT', 'ADMIN']);

exports.getAll = async (req, res) => {
  const users = await prisma.user.findMany({
    select: SAFE_USER_SELECT,
    orderBy: { createdAt: 'desc' },
  });

  res.json(users);
};

exports.getById = async (req, res) => {
  const id = parseId(req.params.id, 'Usuário');

  const user = await prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });

  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  res.json(user);
};

exports.update = async (req, res) => {
  const id = parseId(req.params.id, 'Usuário');
  const data = {};

  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (!name) throw new HttpError(400, 'Nome inválido.');
    data.name = name;
  }

  if (req.body.phone !== undefined) {
    data.phone = req.body.phone ? String(req.body.phone).trim() : null;
  }

  if (req.body.email !== undefined) {
    const email = normalizeEmail(req.body.email);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new HttpError(400, 'E-mail inválido.');
    }
    data.email = email;
  }

  if (req.body.password !== undefined) {
    const password = String(req.body.password);
    if (password.length < 8) {
      throw new HttpError(400, 'A senha deve ter pelo menos 8 caracteres.');
    }
    data.password = await bcrypt.hash(password, 12);
  }

  if (req.user.role === 'ADMIN' && req.body.role !== undefined) {
    const role = String(req.body.role).toUpperCase();
    if (!ALLOWED_ROLES.has(role)) {
      throw new HttpError(400, 'Perfil de usuário inválido.');
    }
    if (id === req.user.id && role !== 'ADMIN') {
      throw new HttpError(400, 'Você não pode remover o próprio acesso de administrador.');
    }
    data.role = role;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: SAFE_USER_SELECT,
  });

  res.json(user);
};

exports.remove = async (req, res) => {
  const id = parseId(req.params.id, 'Usuário');
  if (id === req.user.id) {
    throw new HttpError(400, 'Você não pode excluir a própria conta administrativa.');
  }
  await prisma.user.delete({ where: { id } });
  res.status(204).send();
};
