const HttpError = require('../utils/HttpError');

const SERPER_IMAGES_URL = 'https://google.serper.dev/images';
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const cache = new Map();

function getApiKey() {
  const apiKey = String(process.env.SERPER_API_KEY || '').trim();
  if (!apiKey) {
    throw new HttpError(
      503,
      'SERPER_API_KEY não está configurada. Adicione a chave da Serper no .env do backend.'
    );
  }
  return apiKey;
}

function normalizeQuery(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function cacheKey(query, limit) {
  return `${query.toLocaleLowerCase('pt-BR')}::${limit}`;
}

function readCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key, data) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { createdAt: Date.now(), data });
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function mapImage(item, index) {
  const imageUrl = item?.imageUrl || item?.image || null;
  const thumbnailUrl = item?.thumbnailUrl || item?.thumbnail || imageUrl;
  if (!imageUrl || !isHttpUrl(imageUrl)) return null;

  return {
    id: `${item?.position || index + 1}-${index}`,
    title: String(item?.title || 'Imagem do produto'),
    imageUrl,
    thumbnailUrl: isHttpUrl(thumbnailUrl) ? thumbnailUrl : imageUrl,
    source: String(item?.source || item?.domain || ''),
    domain: String(item?.domain || ''),
    link: isHttpUrl(item?.link) ? item.link : null,
    width: Number(item?.imageWidth) || null,
    height: Number(item?.imageHeight) || null,
    position: Number(item?.position) || index + 1,
  };
}

async function requestSerper(query, limit) {
  const apiKey = getApiKey();
  let response;
  try {
    response = await fetch(SERPER_IMAGES_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        q: query,
        gl: 'br',
        hl: 'pt-br',
        num: limit,
      }),
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new HttpError(504, 'A Serper demorou demais para responder. Tente novamente.');
    }
    throw new HttpError(502, 'Não foi possível conectar à API da Serper.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // Mantém payload nulo para produzir uma mensagem controlada abaixo.
  }

  if (!response.ok) {
    const remoteMessage = payload?.message || payload?.error;

    if (response.status === 401 || response.status === 403) {
      throw new HttpError(502, 'A Serper recusou a API key. Verifique SERPER_API_KEY no .env do backend.');
    }

    if (response.status === 429) {
      throw new HttpError(429, 'Limite de consultas da Serper atingido. Verifique seus créditos ou tente mais tarde.');
    }

    throw new HttpError(
      502,
      remoteMessage ? `Erro da Serper: ${remoteMessage}` : `Erro ${response.status} ao consultar a Serper.`
    );
  }

  return payload || {};
}

exports.searchImages = async (req, res) => {
  const query = normalizeQuery(req.query.q);
  if (query.length < 2) throw new HttpError(400, 'Digite pelo menos 2 caracteres para pesquisar imagens.');
  if (query.length > 160) throw new HttpError(400, 'Pesquisa muito longa.');

  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 4), 30);
  const key = cacheKey(query, limit);
  const cached = readCache(key);

  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  const payload = await requestSerper(query, limit);
  const rawImages = Array.isArray(payload?.images) ? payload.images : [];
  const seen = new Set();
  const images = [];

  for (let index = 0; index < rawImages.length; index += 1) {
    const image = mapImage(rawImages[index], index);
    if (!image || seen.has(image.imageUrl)) continue;
    seen.add(image.imageUrl);
    images.push(image);
    if (images.length >= limit) break;
  }

  const data = {
    query,
    total: images.length,
    images,
    cached: false,
  };

  writeCache(key, data);
  return res.json(data);
};
