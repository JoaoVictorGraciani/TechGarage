const HttpError = require('./HttpError');

function parseId(value, label = 'Registro') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, `${label} inválido.`);
  }
  return id;
}

module.exports = parseId;
