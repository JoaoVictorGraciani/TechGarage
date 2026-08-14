const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../database');
const HttpError = require('../utils/HttpError');
const { SAFE_USER_SELECT, normalizeEmail } = require('../utils/user');

const COOKIE_NAME = 'techgarage_token';
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

function baseCookieOptions() {
  const production = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path: '/',
  };
}

function sessionCookieOptions() {
  return {
    ...baseCookieOptions(),
    maxAge: TOKEN_TTL_MS,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: '7d',
    }
  );
}

function setSessionCookie(res, user) {
  res.cookie(COOKIE_NAME, signToken(user), sessionCookieOptions());
}

function validateRegistration({ name, email, password }) {
  if (!String(name || '').trim()) {
    throw new HttpError(400, 'Nome é obrigatório.');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new HttpError(400, 'E-mail inválido.');
  }

  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'A senha deve ter pelo menos 8 caracteres.');
  }
}

exports.register = async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;
  const phone = req.body.phone ? String(req.body.phone).trim() : null;

  validateRegistration({ name, email, password });

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new HttpError(409, 'Este e-mail já está cadastrado.');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      phone,
      role: 'CLIENT',
    },
    select: SAFE_USER_SELECT,
  });

  setSessionCookie(res, user);
  res.status(201).json({ user });
};

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!email || typeof password !== 'string' || !password) {
    throw new HttpError(400, 'E-mail e senha são obrigatórios.');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  const usesBcrypt = /^\$2[aby]\$/.test(user.password);
  const validPassword = usesBcrypt
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!validPassword) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  // Migração transparente de contas antigas que ainda tinham senha em texto puro.
  if (!usesBcrypt) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: passwordHash },
    });
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };

  setSessionCookie(res, safeUser);
  res.json({ user: safeUser });
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};

exports.logout = async (req, res) => {
  res.clearCookie(COOKIE_NAME, baseCookieOptions());

  res.status(204).send();
};
