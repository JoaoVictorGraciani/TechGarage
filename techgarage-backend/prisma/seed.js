require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../database');

const catalog = [
  { name: 'Notebook Gamer Predator X15', description: 'Notebook gamer com placa dedicada, ideal para jogos e edição.', brand: 'Acer', price: 6499.9, stock: 5, image: 'https://placehold.co/700x520/18181b/a3e635?text=Notebook', category: 'Notebooks', featured: true },
  { name: 'Ultrabook Slim Pro 14', description: 'Notebook leve e fino para uso corporativo e produtividade.', brand: 'TechGarage', price: 3899, stock: 8, image: 'https://placehold.co/700x520/18181b/a3e635?text=Ultrabook', category: 'Notebooks', featured: false },
  { name: 'Monitor Gamer 27 165Hz', description: 'Monitor Full HD com alta taxa de atualização para competitivo.', brand: 'TechGarage', price: 1299.9, stock: 12, image: 'https://placehold.co/700x520/18181b/a3e635?text=Monitor+165Hz', category: 'Monitores', featured: true },
  { name: 'Monitor UltraWide 34 4K', description: 'Monitor ultrawide 4K para produtividade e design.', brand: 'TechGarage', price: 3299, stock: 3, image: 'https://placehold.co/700x520/18181b/a3e635?text=UltraWide+4K', category: 'Monitores', featured: false },
  { name: 'Cadeira Gamer ProComfort', description: 'Cadeira ergonômica reclinável com apoio lombar.', brand: 'ProComfort', price: 1099.9, stock: 6, image: 'https://placehold.co/700x520/18181b/a3e635?text=Cadeira+Gamer', category: 'Gamer', featured: false },
  { name: 'Placa de Vídeo RTX 4060 8GB', description: 'GPU de alta performance para jogos em Full HD/2K.', brand: 'NVIDIA', price: 2599, stock: 0, image: 'https://placehold.co/700x520/18181b/a3e635?text=RTX+4060', category: 'Gamer', featured: true },
  { name: 'Smartphone Galaxy Turbo 256GB', description: 'Celular com câmera tripla e bateria de longa duração.', brand: 'Galaxy', price: 2199, stock: 15, image: 'https://placehold.co/700x520/18181b/a3e635?text=Smartphone', category: 'Smartphones', featured: true },
  { name: 'Capa Protetora Reforçada', description: 'Capa anti-impacto compatível com diversos modelos.', brand: 'Armor', price: 49.9, stock: 40, image: 'https://placehold.co/700x520/18181b/a3e635?text=Capa', category: 'Smartphones', featured: false },
  { name: 'Headset Gamer 7.1 Surround', description: 'Headset com som surround e microfone destacável.', brand: 'TechGarage', price: 349.9, stock: 20, image: 'https://placehold.co/700x520/18181b/a3e635?text=Headset', category: 'Headsets e Áudio', featured: true },
  { name: 'Fone Bluetooth TWS Pro', description: 'Fone sem fio com cancelamento de ruído ativo.', brand: 'SoundPro', price: 279.9, stock: 2, image: 'https://placehold.co/700x520/18181b/a3e635?text=TWS+Pro', category: 'Headsets e Áudio', featured: false },
  { name: 'Teclado Mecânico RGB', description: 'Teclado mecânico switch blue com iluminação RGB.', brand: 'TechGarage', price: 399.9, stock: 10, image: 'https://placehold.co/700x520/18181b/a3e635?text=Teclado+RGB', category: 'Teclados e Mouses', featured: true },
  { name: 'Mouse Gamer 16000 DPI', description: 'Mouse ultraleve com sensor óptico de alta precisão.', brand: 'TechGarage', price: 199.9, stock: 25, image: 'https://placehold.co/700x520/18181b/a3e635?text=Mouse+Gamer', category: 'Teclados e Mouses', featured: false },
  { name: 'SSD NVMe 1TB', description: 'SSD de alta velocidade para leitura e gravação.', brand: 'SpeedDisk', price: 449.9, stock: 18, image: 'https://placehold.co/700x520/18181b/a3e635?text=SSD+NVMe', category: 'Armazenamento', featured: true },
  { name: 'HD Externo 2TB', description: 'Armazenamento portátil para backups e arquivos.', brand: 'DataBox', price: 379.9, stock: 9, image: 'https://placehold.co/700x520/18181b/a3e635?text=HD+2TB', category: 'Armazenamento', featured: false },
  { name: 'Memória RAM 16GB DDR5', description: 'Kit de memória de alta performance para gamers.', brand: 'TechGarage', price: 429.9, stock: 14, image: 'https://placehold.co/700x520/18181b/a3e635?text=DDR5+16GB', category: 'Memória e Componentes', featured: false },
  { name: 'Processador Octa-Core 5.2GHz', description: 'CPU de última geração para alto desempenho.', brand: 'TechGarage', price: 1899, stock: 4, image: 'https://placehold.co/700x520/18181b/a3e635?text=CPU', category: 'Memória e Componentes', featured: true },
];

async function seedCatalogOnlyWhenEmpty() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Catálogo já possui ${count} produto(s). Seed NÃO alterou produtos, imagens, preços ou estoque.`);
    return;
  }

  console.log('Catálogo vazio. Criando dados iniciais...');
  const categoryMap = new Map();
  for (const name of [...new Set(catalog.map((item) => item.category))]) {
    const category = await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
    categoryMap.set(name, category.id);
  }

  for (const item of catalog) {
    await prisma.product.create({
      data: {
        name: item.name,
        description: item.description,
        brand: item.brand,
        price: item.price,
        stock: item.stock,
        image: item.image,
        featured: item.featured,
        categoryId: categoryMap.get(item.category),
      },
    });
  }
  console.log(`${catalog.length} produtos iniciais criados.`);
}

async function seedAdmin() {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log('ADMIN_EMAIL/ADMIN_PASSWORD não definidos; admin não foi alterado pelo seed.');
    return;
  }
  if (adminPassword.length < 8) throw new Error('ADMIN_PASSWORD deve ter pelo menos 8 caracteres.');

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || 'Administrador TechGarage',
        email: adminEmail,
        password: passwordHash,
        role: 'ADMIN',
      },
    });
    console.log(`Admin criado: ${adminEmail}`);
    return;
  }

  const data = {};
  if (existing.role !== 'ADMIN') data.role = 'ADMIN';
  if (process.env.ADMIN_RESET_PASSWORD === 'true') {
    data.password = await bcrypt.hash(adminPassword, 12);
    console.log(`Senha do admin será redefinida porque ADMIN_RESET_PASSWORD=true.`);
  }

  if (Object.keys(data).length) {
    await prisma.user.update({ where: { id: existing.id }, data });
    console.log(`Admin atualizado: ${adminEmail}`);
  } else {
    console.log(`Admin já existe; senha preservada: ${adminEmail}`);
  }
}

async function main() {
  await seedCatalogOnlyWhenEmpty();
  await seedAdmin();
  console.log('Seed seguro v4.3 concluído.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
