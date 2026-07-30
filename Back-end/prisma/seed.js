const prisma = require('../src/prisma');

const categorias = [
  'Notebooks',
  'Monitores',
  'Gamer',
  'Smartphones',
  'Headsets e Áudio',
  'Teclados e Mouses',
  'Armazenamento',
  'Memória e Componentes',
];

async function main() {
  console.log('Criando categorias...');
  const categoriasCriadas = {};

  for (const nome of categorias) {
    const categoria = await prisma.category.upsert({
      where: { name: nome },
      update: {},
      create: { name: nome },
    });
    categoriasCriadas[nome] = categoria.id;
  }

  console.log('Criando produtos...');

  const produtos = [
    { name: 'Notebook Gamer Predator X15', description: 'Notebook gamer com placa dedicada, ideal para jogos e edição.', price: 6499.90, stock: 5, image: 'https://placehold.co/400x400/18181b/a3e635?text=Notebook', categoria: 'Notebooks' },
    { name: 'Ultrabook Slim Pro 14', description: 'Notebook leve e fino para uso corporativo.', price: 3899.00, stock: 8, image: 'https://placehold.co/400x400/18181b/a3e635?text=Ultrabook', categoria: 'Notebooks' },
    { name: 'Monitor Gamer 27 165Hz', description: 'Monitor Full HD com alta taxa de atualização.', price: 1299.90, stock: 12, image: 'https://placehold.co/400x400/18181b/a3e635?text=Monitor+FHD', categoria: 'Monitores' },
    { name: 'Monitor UltraWide 34 4K', description: 'Monitor ultrawide 4K para produtividade.', price: 3299.00, stock: 3, image: 'https://placehold.co/400x400/18181b/a3e635?text=Monitor+4K', categoria: 'Monitores' },
    { name: 'Cadeira Gamer ProComfort', description: 'Cadeira ergonômica reclinável.', price: 1099.90, stock: 6, image: 'https://placehold.co/400x400/18181b/a3e635?text=Cadeira+Gamer', categoria: 'Gamer' },
    { name: 'Placa de Vídeo RTX 4060 8GB', description: 'GPU de alta performance.', price: 2599.00, stock: 0, image: 'https://placehold.co/400x400/18181b/a3e635?text=GPU', categoria: 'Gamer' },
    { name: 'Smartphone Galaxy Turbo 256GB', description: 'Celular com câmera tripla.', price: 2199.00, stock: 15, image: 'https://placehold.co/400x400/18181b/a3e635?text=Smartphone', categoria: 'Smartphones' },
    { name: 'Capa Protetora Reforçada', description: 'Capa anti-impacto.', price: 49.90, stock: 40, image: 'https://placehold.co/400x400/18181b/a3e635?text=Capa', categoria: 'Smartphones' },
    { name: 'Headset Gamer 7.1 Surround', description: 'Headset com som surround.', price: 349.90, stock: 20, image: 'https://placehold.co/400x400/18181b/a3e635?text=Headset', categoria: 'Headsets e Áudio' },
    { name: 'Fone Bluetooth TWS Pro', description: 'Fone sem fio com cancelamento de ruído.', price: 279.90, stock: 2, image: 'https://placehold.co/400x400/18181b/a3e635?text=Fone+TWS', categoria: 'Headsets e Áudio' },
    { name: 'Teclado Mecânico RGB', description: 'Teclado mecânico switch blue.', price: 399.90, stock: 10, image: 'https://placehold.co/400x400/18181b/a3e635?text=Teclado', categoria: 'Teclados e Mouses' },
    { name: 'Mouse Gamer 16000 DPI', description: 'Mouse ultraleve de alta precisão.', price: 199.90, stock: 25, image: 'https://placehold.co/400x400/18181b/a3e635?text=Mouse', categoria: 'Teclados e Mouses' },
    { name: 'SSD NVMe 1TB', description: 'SSD de alta velocidade.', price: 449.90, stock: 18, image: 'https://placehold.co/400x400/18181b/a3e635?text=SSD', categoria: 'Armazenamento' },
    { name: 'HD Externo 2TB', description: 'Armazenamento portátil.', price: 379.90, stock: 9, image: 'https://placehold.co/400x400/18181b/a3e635?text=HD+Externo', categoria: 'Armazenamento' },
    { name: 'Memória RAM 16GB DDR5', description: 'Kit de memória de alta performance.', price: 429.90, stock: 14, image: 'https://placehold.co/400x400/18181b/a3e635?text=RAM', categoria: 'Memória e Componentes' },
    { name: 'Processador Octa-Core 5.2GHz', description: 'CPU de última geração.', price: 1899.00, stock: 4, image: 'https://placehold.co/400x400/18181b/a3e635?text=CPU', categoria: 'Memória e Componentes' },
  ];

  for (const p of produtos) {
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        image: p.image,
        categoryId: categoriasCriadas[p.categoria],
      },
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });