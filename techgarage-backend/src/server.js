const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const prisma = require('../database');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const adminRoutes = require('./routes/adminRoutes');
const serperRoutes = require('./routes/serperRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

if (!process.env.DATABASE_URL) {
  console.error('ERRO: configure DATABASE_URL no arquivo .env.');
  process.exit(1);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERRO: configure JWT_SECRET com pelo menos 32 caracteres no arquivo .env.');
  process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Origem não permitida pelo CORS.'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'API TechGarage Store rodando com sucesso!' });
});

app.get('/api/health', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'ok' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/serper', serperRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/payments', paymentRoutes);

app.use(notFound);
app.use(errorHandler);

let server;

function databaseLabel() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    return `${url.pathname.replace(/^\//, '') || '(sem banco)'} @ ${url.hostname}:${url.port || '3306'}`;
  } catch {
    return 'DATABASE_URL inválida';
  }
}

async function start() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const placeholderCount = await prisma.product.count({
      where: {
        OR: [
          { image: null },
          { image: { contains: 'placehold.co' } },
        ],
      },
    });
    server = app.listen(PORT, () => {
      console.log(`TechGarage API: http://localhost:${PORT}`);
      console.log(`Banco conectado: ${databaseLabel()}`);
      if (placeholderCount > 0) {
        console.warn(`ATENÇÃO: ${placeholderCount} produto(s) ainda usam imagem padrão. Rode npm run diagnose:database na raiz para listar.`);
      }
    });
  } catch (error) {
    console.error('ERRO: não foi possível conectar ao banco configurado em DATABASE_URL.');
    console.error(error.message || error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando servidor...`);
  if (!server) {
    await prisma.$disconnect();
    process.exit(0);
    return;
  }
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
