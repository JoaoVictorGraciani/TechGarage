const { Prisma } = require('@prisma/client');

function notFound(req, res) {
  res.status(404).json({
    message: 'Rota não encontrada.',
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'JSON inválido no corpo da requisição.' });
  }

  if (error?.message === 'Origem não permitida pelo CORS.') {
    return res.status(403).json({ message: error.message });
  }

  if (error?.status) {
    return res.status(error.status).json({
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'Já existe um registro com estes dados.',
      });
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'Registro não encontrado.',
      });
    }

    if (error.code === 'P2003') {
      return res.status(409).json({
        message: 'Este registro está sendo utilizado e não pode ser removido.',
      });
    }
  }

  console.error('[API ERROR]', error);

  return res.status(500).json({
    message: 'Erro interno do servidor.',
  });
}

module.exports = {
  notFound,
  errorHandler,
};
