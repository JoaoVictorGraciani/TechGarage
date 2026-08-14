const jwt = require('jsonwebtoken');
const prisma = require('../../database');
const HttpError = require('../utils/HttpError');
const { SAFE_USER_SELECT } = require('../utils/user');

function getToken(req) {
  const bearer = req.headers.authorization;

  if (bearer && bearer.startsWith('Bearer ')) {
    return bearer.slice(7).trim();
  }

  return req.cookies?.techgarage_token || null;
}

async function authenticate(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      throw new HttpError(401, 'Autenticação necessária.');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new HttpError(401, 'Sessão inválida.');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      throw new HttpError(401, 'Sessão inválida.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }

    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(new HttpError(401, 'Sessão expirada ou inválida.'));
    }

    next(error);
  }
}

function authorize(...roles) {
  return function authorizeMiddleware(req, res, next) {
    if (!req.user) {
      return next(new HttpError(401, 'Autenticação necessária.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Você não tem permissão para esta ação.'));
    }

    next();
  };
}

function selfOrAdmin(paramName = 'id') {
  return function selfOrAdminMiddleware(req, res, next) {
    const targetId = Number(req.params[paramName]);
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return next(new HttpError(400, 'Usuário inválido.'));
    }

    if (req.user?.role === 'ADMIN' || req.user?.id === targetId) {
      return next();
    }

    next(new HttpError(403, 'Você não tem permissão para acessar este usuário.'));
  };
}

module.exports = {
  authenticate,
  authorize,
  selfOrAdmin,
};
