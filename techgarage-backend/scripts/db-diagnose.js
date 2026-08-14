require('dotenv').config();
const prisma = require('../database');

function safeDatabaseLabel() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return 'DATABASE_URL ausente';
  try {
    const url = new URL(raw);
    return `${url.pathname.replace(/^\//, '') || '(sem banco)'} @ ${url.hostname}:${url.port || '3306'}`;
  } catch {
    return 'DATABASE_URL inválida';
  }
}

async function main() {
  console.log('\n=== TechGarage · Diagnóstico do banco ===');
  console.log(`Banco ativo: ${safeDatabaseLabel()}`);

  const [products, users, orders, placeholderProducts] = await Promise.all([
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.product.findMany({
      where: {
        OR: [
          { image: null },
          { image: { contains: 'placehold.co' } },
        ],
      },
      select: { id: true, name: true, image: true, updatedAt: true },
      orderBy: { id: 'asc' },
    }),
  ]);

  console.log(`Produtos: ${products}`);
  console.log(`Usuários: ${users}`);
  console.log(`Pedidos: ${orders}`);
  console.log(`Produtos sem imagem real/placeholder: ${placeholderProducts.length}`);

  if (placeholderProducts.length) {
    console.log('\nProdutos que precisam de imagem:');
    for (const product of placeholderProducts) {
      console.log(`- #${product.id} ${product.name} | atualizado em ${product.updatedAt.toISOString()}`);
    }
  }

  console.log('\nNenhum dado foi alterado por este diagnóstico.\n');
}

main()
  .catch((error) => {
    console.error('Falha no diagnóstico:', error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
