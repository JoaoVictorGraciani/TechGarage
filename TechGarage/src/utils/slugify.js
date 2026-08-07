// src/utils/slugify.js
export function slugify(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/\s+/g, '-'); // espaços viram hífen
  }